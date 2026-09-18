'use client';

import { useEditorStore } from '../editor-store';
import { Field, TextInput, TextArea, Select, SectionCard, Toggle, Button } from '../FormControls';
import { GalleryField } from '../GalleryField';
import { ArrayEditor } from '../ArrayEditor';
import { genId, emptyMediaSlot } from '@/lib/brand-defaults';
import type { Cta } from '@/lib/brand-schema';

function CtaFields({ cta, onChange }: { cta: Cta; onChange: (c: Cta) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3 sm:grid-cols-4">
      <Field label="按钮文字">
        <TextInput value={cta.label} onChange={(v) => onChange({ ...cta, label: v })} placeholder="了解更多" />
      </Field>
      <Field label="链接">
        <TextInput value={cta.href} onChange={(v) => onChange({ ...cta, href: v })} placeholder="#products 或 https://" />
      </Field>
      <Field label="样式">
        <Select
          value={cta.variant}
          onChange={(v) => onChange({ ...cta, variant: v })}
          options={[
            { value: 'solid', label: '实心' },
            { value: 'outline', label: '描边' },
            { value: 'ghost', label: '幽灵' },
          ]}
        />
      </Field>
      <Field label="新窗口打开">
        <Toggle checked={cta.external} onChange={(v) => onChange({ ...cta, external: v })} />
      </Field>
    </div>
  );
}

function SectionToggle({ idField, label }: { idField: string; label: string }) {
  const config = useEditorStore((s) => s.config);
  const patch = useEditorStore((s) => s.patch);
  const section = config.sections[idField as keyof typeof config.sections];
  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
      <span className="text-sm font-medium text-gray-800">{label}</span>
      <Toggle
        checked={section.enabled}
        onChange={(v) => patch((d) => { (d.sections[idField as keyof typeof d.sections] as { enabled: boolean }).enabled = v; })}
      />
    </div>
  );
}

/** 图文顺序选择（通用） */
function MediaOrderSelect({
  value,
  onChange,
  firstLabel,
  lastLabel,
}: {
  value: 'first' | 'last';
  onChange: (v: 'first' | 'last') => void;
  firstLabel: string;
  lastLabel: string;
}) {
  return (
    <Field label="图文顺序">
      <Select
        value={value}
        onChange={onChange}
        options={[
          { value: 'first', label: firstLabel },
          { value: 'last', label: lastLabel },
        ]}
      />
    </Field>
  );
}

export function HeroForm() {
  const config = useEditorStore((s) => s.config);
  const patch = useEditorStore((s) => s.patch);
  const s = config.sections.hero;

  return (
    <div className="flex flex-col gap-6">
      <SectionCard title="首屏 Hero" description="访客看到的第一屏，建议大图 + 简短标题">
        <SectionToggle idField="hero" label="显示此模块" />
        <Field label="小标签（eyebrow）" hint="标题上方的小字，可留空">
          <TextInput value={s.eyebrow} onChange={(v) => patch((d) => { d.sections.hero.eyebrow = v; })} />
        </Field>
        <Field label="主标题" hint="建议 10–20 字，回车可换行">
          <TextArea value={s.title} onChange={(v) => patch((d) => { d.sections.hero.title = v; })} rows={2} placeholder="简洁有力的品牌主张" />
        </Field>
        <Field label="副标题" hint="1–2 句话补充说明">
          <TextArea value={s.body} onChange={(v) => patch((d) => { d.sections.hero.body = v; })} rows={3} />
        </Field>
        <Field label="布局" hint="全屏横图会把图片作为整屏背景，文字叠加其上，建议使用横向大图">
          <Select
            value={s.layout}
            onChange={(v) => patch((d) => { d.sections.hero.layout = v; })}
            options={[
              { value: 'image-right', label: '右图左文' },
              { value: 'image-left', label: '左图右文' },
              { value: 'centered', label: '居中大图（上下堆叠）' },
              { value: 'fullbleed', label: '全屏横图（PC 占满首屏）' },
            ]}
          />
        </Field>
        {s.layout === 'centered' && (
          <MediaOrderSelect
            value={s.mediaOrder}
            onChange={(v) => patch((d) => { d.sections.hero.mediaOrder = v; })}
            firstLabel="图片在上，文字在下"
            lastLabel="文字在上，图片在下"
          />
        )}
        <GalleryField
          label="首屏主视觉"
          value={s.image}
          onChange={(slot) => patch((d) => { d.sections.hero.image = slot; })}
          fit="cover"
          hint={s.layout === 'fullbleed' ? '全屏横图建议使用横向高清大图（如 1920×1080 以上）' : '竖图或方图效果最佳，手机端会等比缩放；可上传多张并开启轮播'}
        />
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-800">主按钮</span>
          <CtaFields cta={s.cta} onChange={(c) => patch((d) => { d.sections.hero.cta = c; })} />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-800">次按钮（可留空）</span>
          <CtaFields cta={s.ctaSecondary} onChange={(c) => patch((d) => { d.sections.hero.ctaSecondary = c; })} />
        </div>
      </SectionCard>
    </div>
  );
}

export function AboutForm() {
  const s = useEditorStore((s) => s.config.sections.about);
  const patch = useEditorStore((s) => s.patch);
  return (
    <SectionCard title="品牌简介" description="简短介绍品牌定位和理念">
      <SectionToggle idField="about" label="显示此模块" />
      <Field label="小标签">
        <TextInput value={s.eyebrow} onChange={(v) => patch((d) => { d.sections.about.eyebrow = v; })} />
      </Field>
      <Field label="标题" hint="回车可换行">
        <TextArea value={s.title} onChange={(v) => patch((d) => { d.sections.about.title = v; })} rows={2} />
      </Field>
      <Field label="正文" hint="可换行，每段之间空一行">
        <TextArea value={s.body} onChange={(v) => patch((d) => { d.sections.about.body = v; })} rows={5} />
      </Field>
      <MediaOrderSelect
        value={s.mediaOrder}
        onChange={(v) => patch((d) => { d.sections.about.mediaOrder = v; })}
        firstLabel="图片在左，文字在右"
        lastLabel="文字在左，图片在右"
      />
      <GalleryField label="配图" value={s.image} onChange={(slot) => patch((d) => { d.sections.about.image = slot; })} fit="cover" />
    </SectionCard>
  );
}

export function ProductsSectionForm() {
  const s = useEditorStore((s) => s.config.sections.products);
  const patch = useEditorStore((s) => s.patch);
  return (
    <SectionCard title="核心产品模块" description="产品列表标题（产品内容在左侧「产品」中编辑）">
      <SectionToggle idField="products" label="显示此模块" />
      <Field label="小标签">
        <TextInput value={s.eyebrow} onChange={(v) => patch((d) => { d.sections.products.eyebrow = v; })} />
      </Field>
      <Field label="标题" hint="回车可换行">
        <TextArea value={s.title} onChange={(v) => patch((d) => { d.sections.products.title = v; })} rows={2} />
      </Field>
    </SectionCard>
  );
}

export function BenefitsForm() {
  const s = useEditorStore((s) => s.config.sections.benefits);
  const patch = useEditorStore((s) => s.patch);
  return (
    <SectionCard title="核心卖点" description="3–6 个短卖点，可配 emoji 图标">
      <SectionToggle idField="benefits" label="显示此模块" />
      <Field label="区块标题" hint="回车可换行">
        <TextArea value={s.title} onChange={(v) => patch((d) => { d.sections.benefits.title = v; })} rows={2} />
      </Field>
      <ArrayEditor
        items={s.items}
        addLabel="添加卖点"
        getItemTitle={(item) => item.title || '新卖点'}
        onAdd={() => patch((d) => { d.sections.benefits.items.push({ id: genId('ben'), icon: '', title: '', body: '' }); })}
        onRemove={(i) => patch((d) => { d.sections.benefits.items.splice(i, 1); })}
        onMove={(from, to) => patch((d) => {
          const [item] = d.sections.benefits.items.splice(from, 1);
          d.sections.benefits.items.splice(to, 0, item);
        })}
        renderItem={(_, i) => (
          <div className="flex flex-col gap-2">
            <TextInput
              value={s.items[i].icon}
              onChange={(v) => patch((d) => { d.sections.benefits.items[i].icon = v; })}
              placeholder="图标 emoji（如 🌿，可留空）"
            />
            <TextInput
              value={s.items[i].title}
              onChange={(v) => patch((d) => { d.sections.benefits.items[i].title = v; })}
              placeholder="卖点标题"
            />
            <TextArea
              value={s.items[i].body}
              onChange={(v) => patch((d) => { d.sections.benefits.items[i].body = v; })}
              placeholder="一句话说明"
              rows={2}
            />
          </div>
        )}
      />
    </SectionCard>
  );
}

export function ScenesForm() {
  const s = useEditorStore((s) => s.config.sections.scenes);
  const patch = useEditorStore((s) => s.patch);
  return (
    <SectionCard title="场景种草" description="生活方式图片 + 短文案，图片使用 cover 裁切，可多图轮播">
      <SectionToggle idField="scenes" label="显示此模块" />
      <Field label="小标签">
        <TextInput value={s.eyebrow} onChange={(v) => patch((d) => { d.sections.scenes.eyebrow = v; })} />
      </Field>
      <Field label="标题" hint="回车可换行">
        <TextArea value={s.title} onChange={(v) => patch((d) => { d.sections.scenes.title = v; })} rows={2} />
      </Field>
      <ArrayEditor
        items={s.items}
        addLabel="添加场景"
        getItemTitle={(item) => item.title || '新场景'}
        onAdd={() => patch((d) => { d.sections.scenes.items.push({ id: genId('scene'), image: emptyMediaSlot(), title: '', body: '' }); })}
        onRemove={(i) => patch((d) => { d.sections.scenes.items.splice(i, 1); })}
        onMove={(from, to) => patch((d) => {
          const [item] = d.sections.scenes.items.splice(from, 1);
          d.sections.scenes.items.splice(to, 0, item);
        })}
        renderItem={(_, i) => (
          <div className="flex flex-col gap-2">
            <GalleryField
              label="场景图"
              value={s.items[i].image}
              onChange={(slot) => patch((d) => { d.sections.scenes.items[i].image = slot; })}
              fit="cover"
            />
            <TextArea
              value={s.items[i].title}
              onChange={(v) => patch((d) => { d.sections.scenes.items[i].title = v; })}
              placeholder="场景标题"
              rows={2}
            />
            <TextArea
              value={s.items[i].body}
              onChange={(v) => patch((d) => { d.sections.scenes.items[i].body = v; })}
              placeholder="短文案"
              rows={2}
            />
          </div>
        )}
      />
    </SectionCard>
  );
}

export function StoryForm() {
  const s = useEditorStore((s) => s.config.sections.story);
  const patch = useEditorStore((s) => s.patch);
  return (
    <SectionCard title="品牌故事" description="较完整的故事、价值观、原料或工艺">
      <SectionToggle idField="story" label="显示此模块" />
      <Field label="小标签">
        <TextInput value={s.eyebrow} onChange={(v) => patch((d) => { d.sections.story.eyebrow = v; })} />
      </Field>
      <Field label="标题" hint="回车可换行">
        <TextArea value={s.title} onChange={(v) => patch((d) => { d.sections.story.title = v; })} rows={2} />
      </Field>
      <Field label="正文" hint="可换行">
        <TextArea value={s.body} onChange={(v) => patch((d) => { d.sections.story.body = v; })} rows={6} />
      </Field>
      <MediaOrderSelect
        value={s.mediaOrder}
        onChange={(v) => patch((d) => { d.sections.story.mediaOrder = v; })}
        firstLabel="图片在左，文字在右"
        lastLabel="文字在左，图片在右"
      />
      <GalleryField label="配图" value={s.image} onChange={(slot) => patch((d) => { d.sections.story.image = slot; })} fit="cover" />
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-gray-800">价值观/要点</span>
        <ArrayEditor
          items={s.values}
          addLabel="添加要点"
          getItemTitle={(item) => item.title || '新要点'}
          onAdd={() => patch((d) => { d.sections.story.values.push({ id: genId('val'), title: '', body: '' }); })}
          onRemove={(i) => patch((d) => { d.sections.story.values.splice(i, 1); })}
          onMove={(from, to) => patch((d) => {
            const [item] = d.sections.story.values.splice(from, 1);
            d.sections.story.values.splice(to, 0, item);
          })}
          renderItem={(_, i) => (
            <div className="flex flex-col gap-2">
              <TextArea
                value={s.values[i].title}
                onChange={(v) => patch((d) => { d.sections.story.values[i].title = v; })}
                placeholder="要点标题"
                rows={2}
              />
              <TextArea
                value={s.values[i].body}
                onChange={(v) => patch((d) => { d.sections.story.values[i].body = v; })}
                placeholder="说明"
                rows={2}
              />
            </div>
          )}
        />
      </div>
    </SectionCard>
  );
}

export function FaqForm() {
  const s = useEditorStore((s) => s.config.sections.faq);
  const patch = useEditorStore((s) => s.patch);
  return (
    <SectionCard title="常见问题 FAQ" description="折叠面板形式">
      <SectionToggle idField="faq" label="显示此模块" />
      <Field label="标题" hint="回车可换行">
        <TextArea value={s.title} onChange={(v) => patch((d) => { d.sections.faq.title = v; })} rows={2} />
      </Field>
      <ArrayEditor
        items={s.items}
        addLabel="添加问题"
        getItemTitle={(item) => item.question || '新问题'}
        onAdd={() => patch((d) => { d.sections.faq.items.push({ id: genId('faq'), question: '', answer: '' }); })}
        onRemove={(i) => patch((d) => { d.sections.faq.items.splice(i, 1); })}
        onMove={(from, to) => patch((d) => {
          const [item] = d.sections.faq.items.splice(from, 1);
          d.sections.faq.items.splice(to, 0, item);
        })}
        renderItem={(_, i) => (
          <div className="flex flex-col gap-2">
            <TextArea
              value={s.items[i].question}
              onChange={(v) => patch((d) => { d.sections.faq.items[i].question = v; })}
              placeholder="问题"
              rows={2}
            />
            <TextArea
              value={s.items[i].answer}
              onChange={(v) => patch((d) => { d.sections.faq.items[i].answer = v; })}
              placeholder="答案"
              rows={3}
            />
          </div>
        )}
      />
    </SectionCard>
  );
}

export function ContactForm() {
  const s = useEditorStore((s) => s.config.sections.contact);
  const patch = useEditorStore((s) => s.patch);
  return (
    <SectionCard title="联系/行动号召" description="页脚上方的 CTA 区块">
      <SectionToggle idField="contact" label="显示此模块" />
      <Field label="小标签">
        <TextInput value={s.eyebrow} onChange={(v) => patch((d) => { d.sections.contact.eyebrow = v; })} />
      </Field>
      <Field label="标题" hint="回车可换行">
        <TextArea value={s.title} onChange={(v) => patch((d) => { d.sections.contact.title = v; })} rows={2} />
      </Field>
      <Field label="正文">
        <TextArea value={s.body} onChange={(v) => patch((d) => { d.sections.contact.body = v; })} rows={2} />
      </Field>
      <CtaFields cta={s.cta} onChange={(c) => patch((d) => { d.sections.contact.cta = c; })} />
    </SectionCard>
  );
}

export function NavigationForm() {
  const nav = useEditorStore((s) => s.config.navigation);
  const patch = useEditorStore((s) => s.patch);
  return (
    <SectionCard title="导航栏" description="只显示已启用且有文字和链接的项。锚点：#top 首屏、#about 品牌简介、#products 产品、#benefits 卖点、#scenes 场景、#story 故事、#faq 常见问题、#contact 联系；也可填完整网址（如 https://shop.taobao.com/...）">
      <ArrayEditor
        items={nav}
        addLabel="添加导航项"
        getItemTitle={(item) => item.label || '新导航项'}
        onAdd={() => patch((d) => { d.navigation.push({ id: genId('nav'), label: '', href: '', enabled: true }); })}
        onRemove={(i) => patch((d) => { d.navigation.splice(i, 1); })}
        onMove={(from, to) => patch((d) => {
          const [item] = d.navigation.splice(from, 1);
          d.navigation.splice(to, 0, item);
        })}
        renderItem={(_, i) => (
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <TextInput
                value={nav[i].label}
                onChange={(v) => patch((d) => { d.navigation[i].label = v; })}
                placeholder="名称"
              />
              <TextInput
                value={nav[i].href}
                onChange={(v) => patch((d) => { d.navigation[i].href = v; })}
                placeholder="#products"
              />
            </div>
            <div className="flex items-center gap-2">
              <Toggle checked={nav[i].enabled} onChange={(v) => patch((d) => { d.navigation[i].enabled = v; })} />
              <span className="text-xs text-gray-500">显示</span>
            </div>
          </div>
        )}
      />
      <div className="mt-2">
        <Button size="sm" variant="ghost" onClick={() => patch((d) => {
          d.navigation = [
            { id: genId('nav'), label: '产品', href: '#products', enabled: true },
            { id: genId('nav'), label: '卖点', href: '#benefits', enabled: true },
            { id: genId('nav'), label: '场景', href: '#scenes', enabled: true },
            { id: genId('nav'), label: '故事', href: '#story', enabled: false },
            { id: genId('nav'), label: '常见问题', href: '#faq', enabled: false },
          ];
        })}>
          恢复默认导航
        </Button>
      </div>
    </SectionCard>
  );
}

/** 页面模块顺序说明 */
const SECTION_ORDER_META: { key: string; label: string }[] = [
  { key: 'hero', label: '首屏 Hero' },
  { key: 'about', label: '品牌简介' },
  { key: 'products', label: '核心产品' },
  { key: 'benefits', label: '核心卖点' },
  { key: 'scenes', label: '场景种草' },
  { key: 'story', label: '品牌故事' },
  { key: 'faq', label: '常见问题' },
  { key: 'contact', label: '联系/CTA' },
];

/**
 * 页面模块排序：调整各区块在官网上的显示顺序。
 * 排序通过每个模块已有的 order 字段实现，隐藏/显示开关也在此提供。
 */
export function SectionOrderForm() {
  const sections = useEditorStore((s) => s.config.sections);
  const patch = useEditorStore((s) => s.patch);

  const ordered = SECTION_ORDER_META.map((m) => ({
    key: m.key,
    label: m.label,
    enabled: (sections as unknown as Record<string, { enabled: boolean }>)[m.key].enabled,
    order: (sections as unknown as Record<string, { order: number }>)[m.key].order,
  })).sort((a, b) => a.order - b.order);

  /** 与相邻模块交换 order，从而改变页面渲染顺序 */
  function swap(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= ordered.length) return;
    const a = ordered[idx];
    const b = ordered[target];
    patch((d) => {
      const secA = d.sections[a.key as keyof typeof d.sections] as { order: number };
      const secB = d.sections[b.key as keyof typeof d.sections] as { order: number };
      const tmp = secA.order;
      secA.order = secB.order;
      secB.order = tmp;
    });
  }

  return (
    <SectionCard
      title="页面模块排序"
      description="调整各模块在官网上的上下顺序，如把「场景种草」移到「核心卖点」上方；隐藏的模块不会出现在页面上"
    >
      <div className="flex flex-col gap-1.5">
        {ordered.map((item, idx) => (
          <div
            key={item.key}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2"
          >
            <span className="w-5 text-center text-xs text-gray-400">{idx + 1}</span>
            <span className="flex-1 text-sm font-medium text-gray-800">{item.label}</span>
            <Toggle
              checked={item.enabled}
              onChange={(v) =>
                patch((d) => {
                  (d.sections[item.key as keyof typeof d.sections] as { enabled: boolean }).enabled = v;
                })
              }
            />
            <div className="flex flex-col">
              <button
                type="button"
                title="上移"
                disabled={idx === 0}
                onClick={() => swap(idx, -1)}
                className="flex h-5 w-7 items-center justify-center rounded text-gray-500 hover:bg-gray-100 disabled:opacity-25"
              >
                ↑
              </button>
              <button
                type="button"
                title="下移"
                disabled={idx === ordered.length - 1}
                onClick={() => swap(idx, 1)}
                className="flex h-5 w-7 items-center justify-center rounded text-gray-500 hover:bg-gray-100 disabled:opacity-25"
              >
                ↓
              </button>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400">修改后右侧预览会立即按新顺序渲染；导航锚点（#scenes 等）会自动跟随模块位置。</p>
    </SectionCard>
  );
}
