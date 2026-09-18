'use client';

import { useEditorStore } from './editor-store';

interface NavGroup {
  label: string;
  items: { id: string; label: string }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: '品牌',
    items: [
      { id: 'brand', label: '基本信息' },
      { id: 'theme', label: '主题风格' },
      { id: 'navigation', label: '导航栏' },
    ],
  },
  {
    label: '页面内容',
    items: [
      { id: 'order', label: '页面模块排序' },
      { id: 'hero', label: '首屏 Hero' },
      { id: 'about', label: '品牌简介' },
      { id: 'products', label: '核心产品' },
      { id: 'benefits', label: '核心卖点' },
      { id: 'scenes', label: '场景种草' },
      { id: 'story', label: '品牌故事' },
      { id: 'faq', label: '常见问题' },
      { id: 'contact', label: '联系/CTA' },
    ],
  },
  {
    label: '高级',
    items: [
      { id: 'links', label: '链接与联系' },
      { id: 'seo', label: 'SEO 与分享' },
      { id: 'export', label: '导入 / 导出' },
    ],
  },
];

export function Sidebar() {
  const activeSection = useEditorStore((s) => s.activeSection);
  const setActiveSection = useEditorStore((s) => s.setActiveSection);

  return (
    <nav className="flex h-full flex-col overflow-y-auto border-r border-gray-200 bg-white py-4">
      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="mb-4 px-3">
          <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            {group.label}
          </p>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition ${
                    activeSection === item.id
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
