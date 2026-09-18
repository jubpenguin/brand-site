'use client';

import { useEffect, useState } from 'react';
import type { BrandConfig } from '@/lib/brand-schema';
import { assetUrl } from '@/lib/asset-url';
import { getVisibleNavItems } from '@/lib/sections';

export function Nav({ config }: { config: BrandConfig }) {
  const [open, setOpen] = useState(false);
  const { brand, links } = config;
  const navItems = getVisibleNavItems(config);
  const purchaseHref = links.purchase;

  // 全屏横图首屏时，导航在页面顶部透明叠加，滚动后恢复实底
  const fullbleed = config.sections.hero.enabled && config.sections.hero.layout === 'fullbleed';
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    if (!fullbleed) {
      setScrolled(true);
      return undefined;
    }
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [fullbleed]);

  // 顶部透明状态：文字/图标为白色
  const onDark = fullbleed && !scrolled && !open;

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur-md transition-colors duration-300 ${
        onDark
          ? 'border-b border-transparent bg-transparent'
          : 'border-b border-brand-border/60 bg-brand-background/85'
      }`}
    >
      <nav className="container-brand flex h-16 items-center justify-between">
        {/* Logo */}
        <a href="#top" className="flex items-center gap-2" aria-label={brand.name}>
          {brand.logo.src ? (
            <img
              src={assetUrl(brand.logo.src)}
              alt={brand.logo.alt || brand.name}
              className="h-8 w-auto max-w-[180px] object-contain md:h-9"
            />
          ) : (
            <span
              className={`font-heading text-lg font-semibold tracking-tight md:text-xl ${
                onDark ? 'text-white' : 'text-brand-text'
              }`}
            >
              {brand.name}
            </span>
          )}
        </a>

        {/* 桌面导航 */}
        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className={`text-sm transition-colors ${
                onDark ? 'text-white/85 hover:text-white' : 'text-brand-muted hover:text-brand-text'
              }`}
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* 购买按钮 + 移动端菜单按钮 */}
        <div className="flex items-center gap-3">
          {purchaseHref && (
            <a
              href={purchaseHref}
              target="_blank"
              rel="noopener noreferrer"
              className={`btn-brand hidden text-sm sm:inline-flex ${
                onDark ? 'bg-white text-neutral-900 hover:bg-white/90' : 'btn-solid'
              }`}
            >
              {links.purchaseLabel || '前往购买'}
            </a>
          )}
          <button
            type="button"
            className={`flex h-10 w-10 items-center justify-center rounded-brand-sm md:hidden ${
              onDark ? 'text-white' : 'text-brand-text'
            }`}
            aria-label={open ? '关闭菜单' : '打开菜单'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              {open ? (
                <>
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </>
              ) : (
                <>
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* 移动端展开菜单 */}
      {open && (
        <div className="border-t border-brand-border/60 bg-brand-background md:hidden">
          <div className="container-brand flex flex-col gap-1 py-4">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className="rounded-brand-sm px-2 py-3 text-base text-brand-text hover:bg-brand-surface"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ))}
            {purchaseHref && (
              <a
                href={purchaseHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-brand btn-solid mt-2"
                onClick={() => setOpen(false)}
              >
                {links.purchaseLabel || '前往购买'}
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
