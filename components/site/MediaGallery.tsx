'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { MediaSlot } from '@/lib/brand-schema';
import { assetUrl } from '@/lib/asset-url';

interface MediaGalleryProps {
  slot: MediaSlot;
  /** 图片缺失 alt 时的兜底替代文本 */
  fallbackAlt?: string;
  /** 图片填充方式 */
  fit?: 'cover' | 'contain';
  /** 覆盖 object-fit 的响应式类（如 "object-contain md:object-cover"），非空时优先于 fit */
  fitClass?: string;
  /** 每张图片的类名（控制宽高比等），例如 "aspect-[4/5] w-full" */
  imgClassName: string;
  /** 外层容器类名（圆角、底色等） */
  frameClassName?: string;
  /** 首图是否高优先级加载（首屏用） */
  priority?: boolean;
  /** 无图时的占位提示 */
  emptyHint?: string;
}

/**
 * 媒体展示组件：
 * - 0 张：占位框
 * - 1 张：静态图片
 * - 多张且 carousel=false：静态展示第一张
 * - 多张且 carousel=true：轮播（指示点 / 箭头 / 触摸滑动 / 自动播放）
 */
export function MediaGallery({
  slot,
  fallbackAlt = '',
  fit = 'cover',
  fitClass,
  imgClassName,
  frameClassName = '',
  priority = false,
  emptyHint = '暂无图片',
}: MediaGalleryProps) {
  const images = (slot.images ?? []).filter((img) => img.src);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);

  const count = images.length;
  const showCarousel = slot.carousel && count > 1;
  // Tailwind 需要静态类名，不能用 object-${fit} 拼接
  const objectFit = fitClass || (fit === 'contain' ? 'object-contain' : 'object-cover');
  const go = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  // 图片数量变化或切换开关时回到第一张
  useEffect(() => {
    setIndex(0);
  }, [count, slot.carousel]);

  // 自动播放（尊重 prefers-reduced-motion）
  useEffect(() => {
    if (!showCarousel || !slot.autoplay || paused) return;
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }
    const interval = Math.max(1000, slot.interval || 4000);
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, interval);
    return () => window.clearInterval(timer);
  }, [showCarousel, slot.autoplay, slot.interval, paused, count]);

  if (count === 0) {
    return (
      <div className={`${frameClassName} ${imgClassName} flex items-center justify-center bg-brand-surface text-xs text-brand-muted/60`}>
        {emptyHint}
      </div>
    );
  }

  // 静态单图（或多图但未开启轮播时显示第一张）
  if (!showCarousel) {
    const img = images[0];
    return (
      <div className={frameClassName}>
        <img
          src={assetUrl(img.src)}
          alt={img.alt || fallbackAlt}
          className={`${imgClassName} ${objectFit}`}
          style={{ objectPosition: img.position || 'center' }}
          loading={priority ? 'eager' : 'lazy'}
        />
      </div>
    );
  }

  return (
    <div
      className={`group/gallery relative overflow-hidden ${frameClassName}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const delta = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(delta) > 32) go(index + (delta < 0 ? 1 : -1));
        touchX.current = null;
      }}
      role="region"
      aria-roledescription="轮播"
      aria-label="图片轮播"
    >
      <div
        className="flex h-full transition-transform duration-500 ease-brand"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((img, i) => (
          <div key={`${img.src}-${i}`} className="h-full w-full flex-shrink-0">
            <img
              src={assetUrl(img.src)}
              alt={img.alt || fallbackAlt}
              className={`${imgClassName} ${objectFit}`}
              style={{ objectPosition: img.position || 'center' }}
              loading={priority && i === 0 ? 'eager' : 'lazy'}
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* 左右箭头 */}
      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="上一张"
            onClick={() => go(index - 1)}
            className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/50 focus:opacity-100 group-hover/gallery:opacity-100 md:left-3"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <button
            type="button"
            aria-label="下一张"
            onClick={() => go(index + 1)}
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/50 focus:opacity-100 group-hover/gallery:opacity-100 md:right-3"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </>
      )}

      {/* 指示点 */}
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
        {images.map((img, i) => (
          <button
            key={`dot-${img.src}-${i}`}
            type="button"
            aria-label={`第 ${i + 1} 张`}
            aria-current={i === index}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/55 hover:bg-white/80'}`}
          />
        ))}
      </div>
    </div>
  );
}
