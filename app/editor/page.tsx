'use client';

import dynamic from 'next/dynamic';

// 编辑器仅在本地开发时使用；静态导出中显示提示
const isExport = process.env.NEXT_PUBLIC_EXPORT_MODE === 'true';

const EditorShell = dynamic(
  () => import('@/components/editor/EditorShell').then((m) => m.EditorShell),
  { ssr: false, loading: () => <div className="p-8 text-gray-400">加载编辑器…</div> },
);

export default function EditorPage() {
  if (isExport) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-8">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold text-gray-900">编辑器仅在本地可用</h1>
          <p className="mt-2 text-sm text-gray-500">
            这是导出的静态网站，不包含内容编辑器。请在本地运行 <code className="rounded bg-gray-200 px-1.5 py-0.5 text-xs">npm run dev</code> 后访问 <code className="rounded bg-gray-200 px-1.5 py-0.5 text-xs">/editor</code>。
          </p>
        </div>
      </div>
    );
  }
  return <EditorShell />;
}
