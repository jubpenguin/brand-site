'use client';

import { useRef, useState } from 'react';
import { useEditorStore } from '../editor-store';
import { Field, TextInput, TextArea, Toggle, SectionCard, Button } from '../FormControls';
import { ImageField } from '../ImageField';
import { ArrayEditor } from '../ArrayEditor';
import { genId } from '@/lib/brand-defaults';
import { assetUrl } from '@/lib/asset-url';

export function LinksForm() {
  const links = useEditorStore((s) => s.config.links);
  const patch = useEditorStore((s) => s.patch);
  const set = (key: keyof typeof links, v: string) =>
    patch((d) => { d.links[key] = v as never; });

  return (
    <SectionCard title="链接与联系方式" description="购买按钮和社媒链接，留空则自动隐藏">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="购买链接（淘宝/天猫/Amazon 等）" hint="导航栏和产品卡片的购买入口">
          <TextInput value={links.purchase} onChange={(v) => set('purchase', v)} placeholder="https://..." />
        </Field>
        <Field label="购买按钮文字">
          <TextInput value={links.purchaseLabel} onChange={(v) => set('purchaseLabel', v)} placeholder="前往购买" />
        </Field>
        <Field label="页脚「关注我们」标题" hint="页脚社媒栏标题，可自定义">
          <TextInput value={links.socialTitle} onChange={(v) => set('socialTitle', v)} placeholder="关注我们" />
        </Field>
        <Field label="页脚「联系」标题" hint="页脚联系栏标题，可自定义">
          <TextInput value={links.contactTitle} onChange={(v) => set('contactTitle', v)} placeholder="联系" />
        </Field>
        <Field label="Instagram">
          <TextInput value={links.instagram} onChange={(v) => set('instagram', v)} placeholder="https://instagram.com/..." />
        </Field>
        <Field label="小红书">
          <TextInput value={links.xiaohongshu} onChange={(v) => set('xiaohongshu', v)} placeholder="https://..." />
        </Field>
        <Field label="微博">
          <TextInput value={links.weibo} onChange={(v) => set('weibo', v)} placeholder="https://..." />
        </Field>
        <Field label="微信（公众号/微信号）">
          <TextInput value={links.wechat} onChange={(v) => set('wechat', v)} placeholder="微信号或文章链接" />
        </Field>
        <Field label="邮箱">
          <TextInput value={links.email} onChange={(v) => set('email', v)} placeholder="hello@brand.com" />
        </Field>
        <Field label="页脚显示邮箱" hint="开启后邮箱同时显示在页脚「联系」栏；关闭则只在「联系我们」模块显示">
          <Toggle
            checked={links.showEmailInFooter}
            onChange={(v) => patch((d) => { d.links.showEmailInFooter = v; })}
          />
        </Field>
        <Field label="联系电话" hint="在「联系」模块直接显示，可含空格或横线">
          <TextInput value={links.phone} onChange={(v) => set('phone', v)} placeholder="400-000-0000" />
        </Field>
        <Field label="隐私政策链接">
          <TextInput value={links.privacy} onChange={(v) => set('privacy', v)} placeholder="https://..." />
        </Field>
        <Field label="使用条款链接">
          <TextInput value={links.terms} onChange={(v) => set('terms', v)} placeholder="https://..." />
        </Field>
      </div>

      {/* 自定义社交平台：可新增任意多个 */}
      <div className="mt-6 flex flex-col gap-2">
        <span className="text-sm font-medium text-gray-800">自定义社交平台</span>
        <span className="text-xs text-gray-400">
          可添加任意多个平台（如淘宝店铺、公众号、拼多多等），名称和链接均可自定义；链接留空则该条不在页脚显示
        </span>
        <ArrayEditor
          items={links.socialLinks}
          addLabel="添加社交链接"
          getItemTitle={(item) => item.label || '未命名平台'}
          onAdd={() => patch((d) => { d.links.socialLinks.push({ id: genId('soc'), label: '', url: '' }); })}
          onRemove={(i) => patch((d) => { d.links.socialLinks.splice(i, 1); })}
          onMove={(from, to) => patch((d) => {
            const [item] = d.links.socialLinks.splice(from, 1);
            d.links.socialLinks.splice(to, 0, item);
          })}
          renderItem={(item, i) => (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <TextInput
                value={item.label}
                onChange={(v) => patch((d) => { d.links.socialLinks[i].label = v; })}
                placeholder="平台名称（如 淘宝店铺）"
              />
              <TextInput
                value={item.url}
                onChange={(v) => patch((d) => { d.links.socialLinks[i].url = v; })}
                placeholder="https://..."
              />
            </div>
          )}
        />
      </div>
    </SectionCard>
  );
}

export function SeoForm() {
  const seo = useEditorStore((s) => s.config.seo);
  const brand = useEditorStore((s) => s.config.brand);
  const patch = useEditorStore((s) => s.patch);

  return (
    <SectionCard title="SEO 与分享" description="搜索引擎和社交分享卡片显示的内容">
      <Field label="网站标题" hint="留空则使用品牌名">
        <TextInput value={seo.title} onChange={(v) => patch((d) => { d.seo.title = v; })} placeholder={brand.name} />
      </Field>
      <Field label="网站描述" hint="建议 80–160 字">
        <TextArea
          value={seo.description}
          onChange={(v) => patch((d) => { d.seo.description = v; })}
          rows={3}
          maxLength={200}
        />
      </Field>
      <Field label="规范链接（canonical）" hint="正式域名，如 https://www.brand.com">
        <TextInput value={seo.canonical} onChange={(v) => patch((d) => { d.seo.canonical = v; })} placeholder="https://..." />
      </Field>
      <ImageField
        label="社交分享图（OG image）"
        value={seo.shareImage}
        onChange={(img) => patch((d) => { d.seo.shareImage = img; })}
        fit="cover"
        hint="建议 1200×630，分享到微信/社交平台时显示"
      />
      <ImageField
        label="网站图标（favicon）"
        value={seo.favicon}
        onChange={(img) => patch((d) => { d.seo.favicon = img; })}
        fit="contain"
        hint="建议正方形 PNG 或 SVG"
      />

      {/* 搜索预览 */}
      <div className="mt-2 rounded-lg border border-gray-200 bg-white p-3">
        <p className="text-xs text-gray-400">搜索结果预览</p>
        <p className="mt-1 text-base text-blue-700">{seo.title || brand.name}</p>
        <p className="text-sm text-green-700">{seo.canonical || 'https://www.brand.com'}</p>
        <p className="text-sm text-gray-600">{seo.description || brand.description || '（网站描述将显示在这里）'}</p>
      </div>
    </SectionCard>
  );
}

export function ExportForm() {
  const exportConfig = useEditorStore((s) => s.exportConfig);
  const exportSite = useEditorStore((s) => s.exportSite);
  const importConfig = useEditorStore((s) => s.importConfig);
  const [exporting, setExporting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleExportSite() {
    setExporting(true);
    setResult(null);
    const r = await exportSite();
    setResult(r);
    setExporting(false);
  }

  return (
    <SectionCard title="导入 / 导出" description="备份配置或生成可部署的静态网站">
      <div className="flex flex-col gap-3">
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-sm font-medium text-gray-800">品牌配置（JSON）</p>
          <p className="mt-0.5 text-xs text-gray-400">导出完整配置用于备份；导入 JSON 会创建为新品牌</p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="secondary" onClick={exportConfig}>
              导出 JSON
            </Button>
            <Button size="sm" variant="secondary" onClick={() => fileRef.current?.click()}>
              导入 JSON
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) await importConfig(file);
                e.target.value = '';
              }}
            />
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-sm font-medium text-gray-800">静态网站导出</p>
          <p className="mt-0.5 text-xs text-gray-400">
            构建可部署的纯静态网站到 out/ 目录。导出前会自动保存并检查断图、必填项。
          </p>
          <div className="mt-3">
            <Button size="sm" variant="primary" onClick={handleExportSite} disabled={exporting}>
              {exporting ? '正在构建…' : '导出静态网站'}
            </Button>
          </div>
          {result && (
            <p className={`mt-2 text-xs ${result.success ? 'text-green-600' : 'text-red-600'}`}>
              {result.message}
            </p>
          )}
        </div>
      </div>
    </SectionCard>
  );
}
