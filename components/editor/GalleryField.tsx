'use client';

import { useRef, useState } from 'react';
import type { MediaSlot, ImageAsset } from '@/lib/brand-schema';
import { assetUrl } from '@/lib/asset-url';
import { useEditorStore } from './editor-store';
import { TextInput, Toggle } from './FormControls';

interface GalleryFieldProps {
  label: string;
  value: MediaSlot;
  onChange: (slot: MediaSlot) => void;
  /** 缩略图适配方式 */
  fit?: 'cover' | 'contain';
  hint?: string;
}

const POSITIONS = [
  { value: 'center', label: '居中' },
  { value: 'top', label: '顶部' },
  { value: 'bottom', label: '底部' },
  { value: 'left', label: '左侧' },
  { value: 'right', label: '右侧' },
];

/** 铅笔（替换）图标 */
function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}

/**
 * 媒体槽位编辑器：支持多图上传、点击缩略图替换、排序、逐张替代文本/焦点，
 * 以及轮播开关、自动播放与间隔。
 */
export function GalleryField({ label, value, onChange, fit = 'cover', hint }: GalleryFieldProps) {
  // 追加图片用（可多选）
  const addRef = useRef<HTMLInputElement>(null);
  // 替换单张图片用（每次点击缩略图时触发）
  const replaceRef = useRef<HTMLInputElement>(null);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);
  const uploadImage = useEditorStore((s) => s.uploadImage);
  const [uploading, setUploading] = useState(false);
  const images = value.images ?? [];
  const multi = images.length > 1;

  function update(next: Partial<MediaSlot>) {
    onChange({ ...value, ...next });
  }

  function updateImage(idx: number, patchImg: Partial<ImageAsset>) {
    const nextImages = images.map((img, i) => (i === idx ? { ...img, ...patchImg } : img));
    update({ images: nextImages });
  }

  function move(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= images.length) return;
    const nextImages = [...images];
    [nextImages[idx], nextImages[target]] = [nextImages[target], nextImages[idx]];
    update({ images: nextImages });
  }

  function remove(idx: number) {
    update({ images: images.filter((_, i) => i !== idx) });
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    const added: ImageAsset[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 10 * 1024 * 1024) continue;
      // eslint-disable-next-line no-await-in-loop
      const path = await uploadImage(file);
      if (path) added.push({ src: path, alt: file.name.replace(/\.[^.]+$/, ''), position: 'center' });
    }
    setUploading(false);
    if (added.length > 0) update({ images: [...images, ...added] });
  }

  /** 点击某张缩略图：记录索引并唤起文件选择（替换这一张） */
  function handleReplaceClick(idx: number) {
    setReplaceIndex(idx);
    replaceRef.current?.click();
  }

  /** 替换文件选定后，替换 replaceIndex 对应的那张 */
  async function handleReplaceFile(file: File | undefined) {
    if (!file) return;
    if (replaceIndex === null) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 10 * 1024 * 1024) return;
    setUploading(true);
    const path = await uploadImage(file);
    setUploading(false);
    if (path) {
      const target = images[replaceIndex];
      const nextImages = images.map((img, i) =>
        i === replaceIndex
          ? { src: path, alt: file.name.replace(/\.[^.]+$/, ''), position: target?.position || 'center' }
          : img,
      );
      update({ images: nextImages });
    }
    setReplaceIndex(null);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-800">
          {label}（{images.length} 张）
        </span>
        <button
          type="button"
          onClick={() => addRef.current?.click()}
          className="rounded-lg border border-dashed border-gray-300 px-2.5 py-1.5 text-xs text-gray-500 hover:border-gray-400 hover:text-gray-700"
        >
          {uploading ? '上传中…' : images.length === 0 ? '+ 上传图片' : '+ 添加图片'}
        </button>
        {/* 追加图片（多选） */}
        <input
          ref={addRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          className="sr-only"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = '';
          }}
        />
        {/* 替换单张图片（单文件） */}
        <input
          ref={replaceRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          className="sr-only"
          onChange={(e) => {
            handleReplaceFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>

      {images.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-4 text-center text-xs text-gray-400">
          尚未上传图片
        </div>
      )}

      <div className="flex flex-col gap-2">
        {images.map((img, idx) => (
          <div key={`${img.src}-${idx}`} className="flex gap-2 rounded-lg border border-gray-200 bg-white p-2">
            {/* 缩略图：点击整张图 = 替换此图片 */}
            <button
              type="button"
              title="点击替换此图片"
              aria-label={`替换第 ${idx + 1} 张图片`}
              onClick={() => handleReplaceClick(idx)}
              className="group relative h-16 w-16 flex-shrink-0 cursor-pointer overflow-hidden rounded-md bg-gray-50 ring-1 ring-transparent transition hover:ring-gray-400"
            >
              {img.src ? (
                <>
                  <img
                    src={assetUrl(img.src)}
                    alt={img.alt}
                    className="h-full w-full"
                    style={{ objectFit: fit }}
                  />
                  {/* 悬浮时叠加铅笔图标 */}
                  <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                    <PencilIcon />
                  </span>
                </>
              ) : (
                <span className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                  无图
                </span>
              )}
            </button>
            <div className="flex flex-1 flex-col gap-1.5">
              <TextInput
                value={img.alt}
                onChange={(v) => updateImage(idx, { alt: v })}
                placeholder="替代文本（无障碍 / SEO）"
              />
              <div className="flex items-center gap-1.5">
                <select
                  value={img.position}
                  onChange={(e) => updateImage(idx, { position: e.target.value })}
                  className="flex-1 rounded-md border border-gray-300 bg-white px-1.5 py-1 text-xs text-gray-700 outline-none focus:border-gray-900"
                >
                  {POSITIONS.map((p) => (
                    <option key={p.value} value={p.value}>焦点：{p.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  title="前移"
                  disabled={idx === 0}
                  onClick={() => move(idx, -1)}
                  className="flex h-7 w-7 items-center justify-center rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  title="后移"
                  disabled={idx === images.length - 1}
                  onClick={() => move(idx, 1)}
                  className="flex h-7 w-7 items-center justify-center rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  title="删除"
                  onClick={() => remove(idx)}
                  className="flex h-7 w-7 items-center justify-center rounded text-red-400 hover:bg-red-50"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 轮播设置：两张及以上才有意义 */}
      {multi && (
        <div className="flex flex-col gap-2 rounded-lg bg-gray-50 p-2.5">
          <label className="flex items-center justify-between">
            <span className="text-xs text-gray-700">多图轮播（关闭则只显示第一张）</span>
            <Toggle checked={value.carousel} onChange={(v) => update({ carousel: v })} />
          </label>
          {value.carousel && (
            <>
              <label className="flex items-center justify-between">
                <span className="text-xs text-gray-700">自动播放</span>
                <Toggle checked={value.autoplay} onChange={(v) => update({ autoplay: v })} />
              </label>
              {value.autoplay && (
                <label className="flex items-center gap-2 text-xs text-gray-700">
                  间隔
                  <input
                    type="number"
                    min={1000}
                    step={500}
                    value={value.interval}
                    onChange={(e) => update({ interval: Math.max(1000, Number(e.target.value) || 4000) })}
                    className="w-24 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs outline-none focus:border-gray-900"
                  />
                  毫秒
                </label>
              )}
            </>
          )}
        </div>
      )}

      {hint && <span className="text-xs text-gray-400">{hint}</span>}
    </div>
  );
}
