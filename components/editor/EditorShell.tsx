'use client';

import { useEffect } from 'react';
import { useEditorStore } from './editor-store';
import { Toolbar } from './Toolbar';
import { Sidebar } from './Sidebar';
import { FormPanel } from './FormPanel';
import { PreviewPane } from './PreviewPane';

export function EditorShell() {
  const loadBrands = useEditorStore((s) => s.loadBrands);
  const dirty = useEditorStore((s) => s.dirty);
  const save = useEditorStore((s) => s.save);

  useEffect(() => {
    loadBrands();
  }, [loadBrands]);

  // 离开页面前提示未保存修改
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  // Ctrl/Cmd+S 保存
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [save]);

  return (
    <div className="flex h-screen flex-col bg-gray-50 text-gray-900">
      <Toolbar />
      <div className="flex min-h-0 flex-1">
        <div className="hidden w-48 flex-shrink-0 md:block">
          <Sidebar />
        </div>
        <div className="w-full border-r border-gray-200 md:w-[440px] md:flex-shrink-0">
          <FormPanel />
        </div>
        <div className="hidden min-w-0 flex-1 lg:block">
          <PreviewPane />
        </div>
      </div>
    </div>
  );
}
