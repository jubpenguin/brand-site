'use client';

import type { ReactNode } from 'react';
import { Button } from './FormControls';

interface ArrayEditorProps<T> {
  items: T[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onMove: (from: number, to: number) => void;
  addLabel?: string;
  renderItem: (item: T, index: number) => ReactNode;
  /** 每项标题，可根据 item 生成 */
  getItemTitle?: (item: T, index: number) => string;
}

export function ArrayEditor<T>({
  items,
  onAdd,
  onRemove,
  onMove,
  addLabel = '添加一项',
  renderItem,
  getItemTitle,
}: ArrayEditorProps<T>) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item, index) => (
        <div
          key={index}
          className="rounded-lg border border-gray-200 bg-gray-50/50 p-3"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">
              {getItemTitle ? getItemTitle(item, index) : `第 ${index + 1} 项`}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => onMove(index, index - 1)}
                className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:bg-gray-200 disabled:opacity-30"
                aria-label="上移"
              >
                ↑
              </button>
              <button
                type="button"
                disabled={index === items.length - 1}
                onClick={() => onMove(index, index + 1)}
                className="flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:bg-gray-200 disabled:opacity-30"
                aria-label="下移"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="flex h-6 w-6 items-center justify-center rounded text-red-400 hover:bg-red-50"
                aria-label="删除"
              >
                ×
              </button>
            </div>
          </div>
          {renderItem(item, index)}
        </div>
      ))}
      <Button variant="secondary" size="sm" onClick={onAdd}>
        + {addLabel}
      </Button>
    </div>
  );
}
