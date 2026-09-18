'use client';

import { useEditorStore } from '../editor-store';
import { Field, TextInput, TextArea, SectionCard, Toggle, Button } from '../FormControls';
import { ArrayEditor } from '../ArrayEditor';
import { genId } from '@/lib/brand-defaults';
import { assetUrl } from '@/lib/asset-url';

export function ProductsForm() {
  const products = useEditorStore((s) => s.config.products);
  const patch = useEditorStore((s) => s.patch);

  return (
    <SectionCard title="产品" description="产品图使用 contain 模式，不会裁切包装；上传多张可开启轮播">
      <ArrayEditor
        items={products}
        addLabel="添加产品"
        getItemTitle={(item) => item.name || '新产品'}
        onAdd={() => patch((d) => {
          d.products.push({
            id: genId('prod'),
            slug: `product-${d.products.length + 1}`,
            name: '',
            subtitle: '',
            badge: '',
            images: [],
            carousel: false,
            autoplay: false,
            interval: 4000,
            highlights: [''],
            description: '',
            specifications: [],
            usage: '',
            purchaseUrl: '',
            enabled: true,
            order: d.products.length,
          });
        })}
        onRemove={(i) => patch((d) => { d.products.splice(i, 1); })}
        onMove={(from, to) => patch((d) => {
          const [item] = d.products.splice(from, 1);
          d.products.splice(to, 0, item);
          d.products.forEach((p, idx) => { p.order = idx; });
        })}
        renderItem={(_, i) => {
          const p = products[i];
          const update = (fn: (prod: typeof p) => void) => patch((d) => { fn(d.products[i]); });
          const moveImg = (imgIdx: number, dir: -1 | 1) => update((prod) => {
            const target = imgIdx + dir;
            if (target < 0 || target >= prod.images.length) return;
            [prod.images[imgIdx], prod.images[target]] = [prod.images[target], prod.images[imgIdx]];
          });
          return (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between rounded bg-white px-2 py-1.5">
                <span className="text-xs text-gray-500">
                  {p.enabled ? '已启用' : '已隐藏'} · 排序 {p.order}
                </span>
                <Toggle checked={p.enabled} onChange={(v) => update((prod) => { prod.enabled = v; })} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Field label="产品名称">
                  <TextInput value={p.name} onChange={(v) => update((prod) => { prod.name = v; })} />
                </Field>
                <Field label="slug">
                  <TextInput value={p.slug} onChange={(v) => update((prod) => { prod.slug = v; })} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Field label="副标题/口味/系列" hint="回车可换行">
                  <TextArea value={p.subtitle} onChange={(v) => update((prod) => { prod.subtitle = v; })} rows={2} />
                </Field>
                <Field label="角标（如新品）">
                  <TextInput value={p.badge} onChange={(v) => update((prod) => { prod.badge = v; })} />
                </Field>
              </div>

              {/* 图片图库 */}
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-800">产品图片（{p.images.length} 张）</span>
                <div className="flex flex-wrap gap-2">
                  {p.images.map((img, imgIdx) => (
                    <div key={imgIdx} className="group relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200 bg-white">
                      <img src={assetUrl(img.src)} alt={img.alt} className="h-full w-full object-contain p-1" />
                      <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/45 px-0.5 opacity-0 transition group-hover:opacity-100">
                        <button
                          type="button"
                          title="前移"
                          disabled={imgIdx === 0}
                          onClick={() => moveImg(imgIdx, -1)}
                          className="flex h-5 flex-1 items-center justify-center text-[10px] text-white disabled:opacity-30"
                        >
                          ←
                        </button>
                        <button
                          type="button"
                          title="后移"
                          disabled={imgIdx === p.images.length - 1}
                          onClick={() => moveImg(imgIdx, 1)}
                          className="flex h-5 flex-1 items-center justify-center text-[10px] text-white disabled:opacity-30"
                        >
                          →
                        </button>
                        <button
                          type="button"
                          title="删除"
                          onClick={() => update((prod) => { prod.images.splice(imgIdx, 1); })}
                          className="flex h-5 flex-1 items-center justify-center text-[10px] text-white"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                  <ImageUploadButton
                    onUploaded={(img) => update((prod) => { prod.images.push(img); })}
                  />
                </div>
                {p.images[0] && (
                  <Field label="主图替代文本">
                    <TextInput
                      value={p.images[0].alt}
                      onChange={(v) => update((prod) => { prod.images[0].alt = v; })}
                    />
                  </Field>
                )}

                {/* 多图轮播设置 */}
                {p.images.length > 1 && (
                  <div className="flex flex-col gap-2 rounded-lg bg-gray-50 p-2.5">
                    <label className="flex items-center justify-between">
                      <span className="text-xs text-gray-700">多图轮播（关闭则只显示第一张）</span>
                      <Toggle checked={p.carousel} onChange={(v) => update((prod) => { prod.carousel = v; })} />
                    </label>
                    {p.carousel && (
                      <>
                        <label className="flex items-center justify-between">
                          <span className="text-xs text-gray-700">自动播放</span>
                          <Toggle checked={p.autoplay} onChange={(v) => update((prod) => { prod.autoplay = v; })} />
                        </label>
                        {p.autoplay && (
                          <label className="flex items-center gap-2 text-xs text-gray-700">
                            间隔
                            <input
                              type="number"
                              min={1000}
                              step={500}
                              value={p.interval}
                              onChange={(e) => update((prod) => { prod.interval = Math.max(1000, Number(e.target.value) || 4000); })}
                              className="w-24 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs outline-none focus:border-gray-900"
                            />
                            毫秒
                          </label>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* 卖点 */}
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-800">卖点（3–6 条）</span>
                {p.highlights.map((h, hIdx) => (
                  <div key={hIdx} className="flex gap-2">
                    <TextInput
                      value={h}
                      onChange={(v) => update((prod) => { prod.highlights[hIdx] = v; })}
                      placeholder={`卖点 ${hIdx + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => update((prod) => { prod.highlights.splice(hIdx, 1); })}
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-red-400 hover:bg-red-50"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <Button size="sm" variant="ghost" onClick={() => update((prod) => { prod.highlights.push(''); })}>
                  + 添加卖点
                </Button>
              </div>

              <Field label="产品介绍">
                <TextArea
                  value={p.description}
                  onChange={(v) => update((prod) => { prod.description = v; })}
                  rows={3}
                />
              </Field>

              {/* 规格 */}
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-gray-800">规格</span>
                {p.specifications.map((spec, sIdx) => (
                  <div key={sIdx} className="grid grid-cols-2 gap-2">
                    <TextInput
                      value={spec.label}
                      onChange={(v) => update((prod) => { prod.specifications[sIdx].label = v; })}
                      placeholder="规格名（如净含量）"
                    />
                    <div className="flex gap-2">
                      <TextInput
                        value={spec.value}
                        onChange={(v) => update((prod) => { prod.specifications[sIdx].value = v; })}
                        placeholder="值（如 30粒）"
                      />
                      <button
                        type="button"
                        onClick={() => update((prod) => { prod.specifications.splice(sIdx, 1); })}
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-red-400 hover:bg-red-50"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
                <Button size="sm" variant="ghost" onClick={() => update((prod) => { prod.specifications.push({ label: '', value: '' }); })}>
                  + 添加规格
                </Button>
              </div>

              <Field label="使用方法">
                <TextArea value={p.usage} onChange={(v) => update((prod) => { prod.usage = v; })} rows={2} />
              </Field>

              <Field label="购买链接" hint="留空则不显示购买按钮">
                <TextInput
                  value={p.purchaseUrl}
                  onChange={(v) => update((prod) => { prod.purchaseUrl = v; })}
                  placeholder="https://..."
                />
              </Field>
            </div>
          );
        }}
      />
    </SectionCard>
  );
}

function ImageUploadButton({ onUploaded }: { onUploaded: (img: { src: string; alt: string; position: string }) => void }) {
  const uploadImage = useEditorStore((s) => s.uploadImage);
  return (
    <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-xs text-gray-400 hover:border-gray-400">
                      + 图片
      <input
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        className="hidden"
        onChange={async (e) => {
          const files = e.target.files;
          if (files) {
            for (const file of Array.from(files)) {
              // eslint-disable-next-line no-await-in-loop
              const path = await uploadImage(file);
              if (path) onUploaded({ src: path, alt: file.name.replace(/\.[^.]+$/, ''), position: 'center' });
            }
          }
          e.target.value = '';
        }}
      />
    </label>
  );
}
