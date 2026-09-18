'use client';

import { useRef, useState } from 'react';
import type { ImageAsset } from '@/lib/brand-schema';
import { assetUrl } from '@/lib/asset-url';
import { useEditorStore } from './editor-store';
import { Field, TextInput, Button } from './FormControls';

interface ImageFieldProps {
  label: string;
  value: ImageAsset;
  onChange: (img: ImageAsset) => void;
  /** 图片适配方式：cover 用于场景图，contain 用于产品图 */
  fit?: 'cover' | 'contain';
  hint?: string;
}

const POSITIONS = [
  { value: 'center', label: '居中' },
  { value: 'top', label: '顶部' },
  { value: 'bottom', label: '底部' },
  { value: 'left', label: '左侧' },
  { value: 'right', label: '右侧' },
  { value: 'top left', label: '左上' },
  { value: 'bottom right', label: '右下' },
];

export function ImageField({ label, value, onChange, fit = 'cover', hint }: ImageFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadImage = useEditorStore((s) => s.uploadImage);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件（JPG / PNG / WebP / SVG）');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('图片大小不能超过 10MB');
      return;
    }
    setUploading(true);
    const path = await uploadImage(file);
    setUploading(false);
    if (path) {
      onChange({ src: path, alt: value.alt || file.name.replace(/\.[^.]+$/, ''), position: value.position });
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-gray-800">{label}</span>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="group relative flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition hover:border-gray-400"
        >
          {value.src ? (
            <>
              <img
                src={assetUrl(value.src)}
                alt={value.alt || label}
                className="h-full w-full"
                style={{ objectFit: fit, objectPosition: value.position }}
              />
              <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-xs text-white opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                替换
              </span>
            </>
          ) : (
            <span className="text-xs text-gray-400">{uploading ? '上传中…' : '上传图片'}</span>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />
        <div className="flex flex-1 flex-col gap-2">
          <TextInput
            value={value.alt}
            onChange={(v) => onChange({ ...value, alt: v })}
            placeholder="替代文本（无障碍）"
          />
          <select
            value={value.position}
            onChange={(e) => onChange({ ...value, position: e.target.value })}
            className="w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-700 outline-none focus:border-gray-900"
          >
            {POSITIONS.map((p) => (
              <option key={p.value} value={p.value}>
                焦点：{p.label}
              </option>
            ))}
          </select>
          {value.src && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onChange({ src: '', alt: '', position: 'center' })}
            >
              移除图片
            </Button>
          )}
        </div>
      </div>
      {hint && <span className="text-xs text-gray-400">{hint}</span>}
    </div>
  );
}
