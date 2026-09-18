'use client';

import { useEditorStore } from '../editor-store';
import { Field, TextInput, TextArea, Select, SectionCard, Toggle } from '../FormControls';
import { ImageField } from '../ImageField';
import { THEME_PRESETS, applyPreset } from '@/lib/themes';
import type { ThemeColors } from '@/lib/brand-schema';

export function BrandForm() {
  const config = useEditorStore((s) => s.config);
  const patch = useEditorStore((s) => s.patch);

  return (
    <div className="flex flex-col gap-6">
      <SectionCard title="品牌基本信息" description="显示在导航栏、页脚和 SEO 中">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="品牌名称" hint="显示在 Logo 文字位置">
            <TextInput
              value={config.brand.name}
              onChange={(v) => patch((d) => { d.brand.name = v; })}
              placeholder="例如：Marlow"
            />
          </Field>
          <Field label="品牌标识（slug）" hint="文件夹名，只能用小写字母、数字、连字符">
            <TextInput
              value={config.brand.slug}
              onChange={(v) => patch((d) => { d.brand.slug = v; })}
              placeholder="marlow"
            />
          </Field>
        </div>
        <Field label="品牌标语" hint="一句话定位，建议 20 字以内">
          <TextInput
            value={config.brand.tagline}
            onChange={(v) => patch((d) => { d.brand.tagline = v; })}
            placeholder="Everyday care, considered."
          />
        </Field>
        <Field label="品牌简介" hint="用于 SEO 描述和页脚">
          <TextArea
            value={config.brand.description}
            onChange={(v) => patch((d) => { d.brand.description = v; })}
            placeholder="简短介绍品牌"
            rows={3}
          />
        </Field>
        <Field label="地区" hint="显示在页脚版权信息旁">
          <TextInput
            value={config.brand.region}
            onChange={(v) => patch((d) => { d.brand.region = v; })}
            placeholder="杭州，中国"
          />
        </Field>
        <ImageField
          label="品牌 Logo"
          value={config.brand.logo}
          onChange={(img) => patch((d) => { d.brand.logo = img; })}
          fit="contain"
          hint="建议 SVG 或透明 PNG；不上传则显示品牌名称文字"
        />
      </SectionCard>
    </div>
  );
}

const COLOR_FIELDS: { key: keyof ThemeColors; label: string; hint: string }[] = [
  { key: 'primary', label: '主色', hint: '按钮、重点元素' },
  { key: 'secondary', label: '辅助色', hint: '次要强调' },
  { key: 'accent', label: '点缀色', hint: '小面积装饰' },
  { key: 'background', label: '背景色', hint: '页面底色' },
  { key: 'surface', label: '卡片色', hint: '卡片/区块背景' },
  { key: 'text', label: '正文色', hint: '主要文字' },
  { key: 'muted', label: '次要文字色', hint: '说明文字' },
  { key: 'border', label: '边框色', hint: '分割线、描边' },
];

export function ThemeForm() {
  const config = useEditorStore((s) => s.config);
  const patch = useEditorStore((s) => s.patch);
  const theme = config.theme;

  return (
    <div className="flex flex-col gap-6">
      <SectionCard title="主题预设" description="一键切换内置主题，之后可微调">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {THEME_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => patch((d) => { d.theme = applyPreset(d.theme, preset.name); })}
              className={`flex flex-col gap-2 rounded-lg border p-3 text-left transition ${
                theme.preset === preset.name
                  ? 'border-gray-900 ring-1 ring-gray-900'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <div className="flex gap-1">
                {[preset.colors.primary, preset.colors.accent, preset.colors.background, preset.colors.text].map((c) => (
                  <span
                    key={c}
                    className="h-6 w-6 rounded-full border border-black/10"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-900">{preset.name}</span>
              <span className="text-xs text-gray-400">{preset.description}</span>
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="颜色" description="所有颜色通过 HEX 值控制">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {COLOR_FIELDS.map((f) => (
            <label key={f.key} className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-700">{f.label}</span>
              <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-2 py-1">
                <input
                  type="color"
                  value={normalizeHex(theme.colors[f.key])}
                  onChange={(e) => patch((d) => { d.theme.colors[f.key] = e.target.value; })}
                  className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent p-0"
                />
                <input
                  type="text"
                  value={theme.colors[f.key]}
                  onChange={(e) => patch((d) => { d.theme.colors[f.key] = e.target.value; })}
                  className="w-full text-xs text-gray-700 outline-none"
                />
              </div>
              <span className="text-[10px] text-gray-400">{f.hint}</span>
            </label>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="字体与形状">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="标题字体">
            <Select
              value={theme.fontHeading}
              onChange={(v) => patch((d) => { d.theme.fontHeading = v; })}
              options={[
                { value: 'system-serif', label: '衬线体（优雅）' },
                { value: 'system-sans', label: '无衬线体（现代）' },
                { value: 'rounded', label: '圆体（亲和）' },
              ]}
            />
          </Field>
          <Field label="正文字体">
            <Select
              value={theme.fontBody}
              onChange={(v) => patch((d) => { d.theme.fontBody = v; })}
              options={[
                { value: 'system-sans', label: '无衬线体' },
                { value: 'system-serif', label: '衬线体' },
                { value: 'rounded', label: '圆体' },
              ]}
            />
          </Field>
          <Field label="圆角风格">
            <Select
              value={theme.radius}
              onChange={(v) => patch((d) => { d.theme.radius = v; })}
              options={[
                { value: 'small', label: '小圆角（利落）' },
                { value: 'medium', label: '中等圆角' },
                { value: 'large', label: '大圆角（柔和）' },
              ]}
            />
          </Field>
          <Field label="按钮风格">
            <Select
              value={theme.buttonStyle}
              onChange={(v) => patch((d) => { d.theme.buttonStyle = v; })}
              options={[
                { value: 'solid', label: '实心按钮' },
                { value: 'outline', label: '描边按钮' },
                { value: 'ghost', label: '幽灵按钮' },
              ]}
            />
          </Field>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
          <div>
            <p className="text-sm font-medium text-gray-800">图片大圆角</p>
            <p className="text-xs text-gray-400">开启后图片使用更大圆角</p>
          </div>
          <Toggle
            checked={theme.imageRadius}
            onChange={(v) => patch((d) => { d.theme.imageRadius = v; })}
          />
        </div>
      </SectionCard>

      <SectionCard title="版式" description="控制内容最大宽度和模块间距">
        <div className="grid grid-cols-2 gap-4">
          <Field label="内容最大宽度（px）">
            <TextInput
              type="number"
              value={String(theme.maxWidth)}
              onChange={(v) => patch((d) => { d.theme.maxWidth = Number(v) || 1200; })}
            />
          </Field>
          <Field label="模块间距（px）">
            <TextInput
              type="number"
              value={String(theme.sectionGap)}
              onChange={(v) => patch((d) => { d.theme.sectionGap = Number(v) || 96; })}
            />
          </Field>
        </div>
      </SectionCard>
    </div>
  );
}

function normalizeHex(hex: string): string {
  if (/^#[0-9a-fA-F]{6}$/.test(hex)) return hex;
  if (/^#[0-9a-fA-F]{3}$/.test(hex)) {
    return '#' + hex.slice(1).split('').map((c) => c + c).join('');
  }
  return '#000000';
}
