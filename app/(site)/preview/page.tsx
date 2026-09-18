'use client';

import { useEffect, useState, useRef } from 'react';
import type { BrandConfig } from '@/lib/brand-schema';
import { SitePreview } from '@/components/site/SitePreview';
import { themeToCssVars } from '@/lib/themes';

/**
 * iframe 预览页面：编辑器通过 postMessage 推送实时配置，
 * 此页面接收后重新渲染，确保媒体查询按 iframe 宽度生效。
 */
export default function PreviewPage() {
  const [config, setConfig] = useState<BrandConfig | null>(null);
  const [ready, setReady] = useState(false);
  // 标记是否已收到编辑器推送的配置（防止初始 fetch 覆盖）
  const receivedFromEditorRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    const url = slug ? `/api/brands/${encodeURIComponent(slug)}` : '/api/brands/active';

    // 初始配置：从 API 拉取（仅在编辑器尚未推送时使用）
    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.config && !receivedFromEditorRef.current) {
          setConfig(data.config);
        }
      })
      .catch(() => {})
      .finally(() => setReady(true));

    // 监听编辑器推送的配置
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'brand-config' && e.data.config) {
        receivedFromEditorRef.current = true;
        setConfig(e.data.config);
        // 回执：通知父窗口已收到
        try {
          window.parent?.postMessage({ type: 'config-ack' }, '*');
        } catch {}
      }
    };
    window.addEventListener('message', handler);

    // 通知父窗口预览已就绪（多发几次，覆盖时序竞态）
    const notifyReady = () => {
      try {
        window.parent?.postMessage({ type: 'preview-ready' }, '*');
      } catch {}
    };
    notifyReady();
    const t1 = setTimeout(notifyReady, 200);
    const t2 = setTimeout(notifyReady, 600);

    return () => {
      window.removeEventListener('message', handler);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // 主题变更时更新 CSS 变量（用内联样式直接写到 html 元素，
  // 优先级高于 layout.tsx 注入的 <style> 标签，避免被覆盖）
  useEffect(() => {
    if (!config) return;
    const vars = themeToCssVars(config.theme) as Record<string, string>;
    const root = document.documentElement;
    for (const [key, value] of Object.entries(vars)) {
      // key 形如 --brand-primary
      root.style.setProperty(key, value);
    }
    // 移除旧的 style 标签（如果之前版本创建过）
    const old = document.getElementById('preview-theme-vars');
    if (old) old.remove();
  }, [config]);

  if (!config) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm text-gray-400">
        {ready ? '加载配置失败' : '加载中…'}
      </div>
    );
  }

  return <SitePreview config={config} />;
}
