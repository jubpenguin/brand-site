'use client';

import { useEditorStore, type DeviceMode } from './editor-store';
import { useEffect, useRef, useState, useCallback } from 'react';

const DEVICE_WIDTHS: Record<DeviceMode, { width: string; label: string }> = {
  desktop: { width: '100%', label: '桌面' },
  tablet: { width: '768px', label: '平板' },
  mobile: { width: '390px', label: '手机' },
};

export function PreviewPane() {
  const config = useEditorStore((s) => s.config);
  const device = useEditorStore((s) => s.device);
  const setDevice = useEditorStore((s) => s.setDevice);
  const activeSlug = useEditorStore((s) => s.activeSlug);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeReady, setIframeReady] = useState(false);
  // 始终持有最新 config，避免闭包过期
  const configRef = useRef(config);
  configRef.current = config;

  const { width } = DEVICE_WIDTHS[device];

  /** 向 iframe 推送配置（带多次重试，覆盖时序竞态） */
  const sendConfig = useCallback(() => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    const payload = { type: 'brand-config', config: configRef.current };
    win.postMessage(payload, '*');
    // 100ms 和 350ms 后再发一次，防止 iframe 内 listener 尚未就绪
    setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage(payload, '*');
    }, 100);
    setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage(payload, '*');
    }, 350);
  }, []);

  // iframe 加载完成（onLoad 事件是可靠的就绪信号）
  const handleIframeLoad = useCallback(() => {
    setIframeReady(true);
  }, []);

  // 收到 iframe 的 preview-ready 消息也标记就绪
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'preview-ready') {
        setIframeReady(true);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // 就绪后推送配置
  useEffect(() => {
    if (iframeReady) sendConfig();
  }, [iframeReady, sendConfig]);

  // 配置变化时实时推送
  useEffect(() => {
    if (iframeReady) sendConfig();
  }, [config, iframeReady, sendConfig]);

  return (
    <div className="flex h-full flex-col bg-gray-100">
      {/* 设备切换工具栏 */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
        <div className="flex gap-1 rounded-lg bg-gray-100 p-0.5">
          {(Object.keys(DEVICE_WIDTHS) as DeviceMode[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDevice(d)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                device === d ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {DEVICE_WIDTHS[d].label}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-400">实时预览</span>
      </div>

      {/* 预览区域 —— 使用 iframe 确保媒体查询按设备宽度生效 */}
      <div className="flex-1 overflow-auto p-4">
        <div
          className="mx-auto overflow-hidden rounded-lg bg-white shadow-lg transition-[width] duration-300"
          style={{ width, maxWidth: '100%' }}
        >
          {!iframeReady && (
            <div className="flex h-[600px] items-center justify-center text-sm text-gray-400">
              预览加载中…
            </div>
          )}
          {/* key 确保切换品牌时 iframe 完全重新挂载 */}
          <iframe
            key={activeSlug || 'empty'}
            ref={iframeRef}
            src={`/preview?slug=${encodeURIComponent(activeSlug)}`}
            title="品牌官网预览"
            onLoad={handleIframeLoad}
            className="block w-full border-0"
            style={{
              height: 'calc(100vh - 160px)',
              minHeight: 600,
              visibility: iframeReady ? 'visible' : 'hidden',
              position: iframeReady ? 'static' : 'absolute',
            }}
          />
        </div>
      </div>
    </div>
  );
}
