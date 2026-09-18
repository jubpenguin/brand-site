'use client';

import { useState } from 'react';
import { useEditorStore } from './editor-store';
import { Button } from './FormControls';

export function Toolbar() {
  const brands = useEditorStore((s) => s.brands);
  const activeSlug = useEditorStore((s) => s.activeSlug);
  const dirty = useEditorStore((s) => s.dirty);
  const saving = useEditorStore((s) => s.saving);
  const loadBrand = useEditorStore((s) => s.loadBrand);
  const save = useEditorStore((s) => s.save);
  const createBrand = useEditorStore((s) => s.createBrand);
  const duplicateBrand = useEditorStore((s) => s.duplicateBrand);
  const renameBrand = useEditorStore((s) => s.renameBrand);
  const deleteBrand = useEditorStore((s) => s.deleteBrand);
  const resetToSaved = useEditorStore((s) => s.resetToSaved);
  const resetToTemplate = useEditorStore((s) => s.resetToTemplate);
  const message = useEditorStore((s) => s.message);

  const [showMenu, setShowMenu] = useState(false);

  function promptName(title: string, defaultValue = ''): string | null {
    const name = window.prompt(title, defaultValue);
    return name === null ? null : name.trim();
  }

  async function handleNew() {
    const name = promptName('新品牌名称');
    if (name) await createBrand(name);
  }

  async function handleDuplicate() {
    const name = promptName('副本品牌名称', `${brands.find((b) => b.slug === activeSlug)?.name || ''} 副本`);
    if (name) await duplicateBrand(name);
  }

  async function handleRename() {
    const current = brands.find((b) => b.slug === activeSlug);
    const name = promptName('品牌新名称', current?.name || '');
    if (name) await renameBrand(name);
  }

  async function handleDelete() {
    const current = brands.find((b) => b.slug === activeSlug);
    if (!current) return;
    if (window.confirm(`确定删除品牌「${current.name}」吗？此操作不可恢复。`)) {
      await deleteBrand();
    }
  }

  return (
    <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-gray-900">品牌编辑器</span>
        <span className="text-gray-300">|</span>
        <div className="relative">
          <select
            value={activeSlug}
            onChange={(e) => loadBrand(e.target.value)}
            className="appearance-none rounded-lg border border-gray-300 bg-white py-1.5 pl-3 pr-8 text-sm text-gray-700 outline-none hover:border-gray-400"
          >
            {brands.map((b) => (
              <option key={b.slug} value={b.slug}>
                {b.name}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
        </div>
        {dirty && <span className="text-xs text-amber-600">未保存</span>}
      </div>

      <div className="flex items-center gap-2">
        {message && (
          <span
            className={`text-xs ${
              message.type === 'error'
                ? 'text-red-600'
                : message.type === 'success'
                  ? 'text-green-600'
                  : 'text-gray-500'
            }`}
          >
            {message.text}
          </span>
        )}

        <div className="relative">
          <Button size="sm" variant="secondary" onClick={() => setShowMenu((v) => !v)}>
            品牌 ▾
          </Button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                <MenuItem onClick={handleNew}>新建品牌</MenuItem>
                <MenuItem onClick={handleDuplicate}>复制品牌</MenuItem>
                <MenuItem onClick={handleRename}>重命名</MenuItem>
                <MenuItem onClick={resetToSaved}>恢复上次保存</MenuItem>
                <MenuItem onClick={resetToTemplate}>恢复模板默认</MenuItem>
                <div className="my-1 border-t border-gray-100" />
                <MenuItem danger onClick={handleDelete}>删除品牌</MenuItem>
              </div>
            </>
          )}
        </div>

        <Button size="sm" variant="primary" onClick={save} disabled={saving || !dirty}>
          {saving ? '保存中…' : '保存'}
        </Button>
      </div>
    </header>
  );
}

function MenuItem({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        onClick();
      }}
      className={`block w-full px-3 py-1.5 text-left text-sm transition ${
        danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  );
}
