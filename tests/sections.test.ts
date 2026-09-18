import { describe, it, expect } from 'vitest';
import { createDefaultConfig } from '../lib/brand-defaults';
import { getOrderedSections, getVisibleNavItems, getVisibleProducts } from '../lib/sections';
import { runPreExportChecks } from '../lib/export-site';
import type { Product } from '../lib/brand-schema';

function makeProduct(partial: Partial<Product> & { id: string; slug: string; name: string }): Product {
  return {
    images: [],
    carousel: false,
    autoplay: false,
    interval: 4000,
    highlights: [],
    description: '',
    subtitle: '',
    badge: '',
    specifications: [],
    usage: '',
    purchaseUrl: '',
    enabled: true,
    order: 0,
    ...partial,
  };
}

describe('section ordering & visibility', () => {
  it('只返回 enabled 的区块并按 order 排序', () => {
    const config = createDefaultConfig('a', 'A');
    config.sections.hero.order = 10;
    config.sections.about.order = 20;
    config.sections.faq.enabled = false;
    config.sections.story.enabled = false;
    const ordered = getOrderedSections(config);
    expect(ordered.find((s) => s.key === 'faq')).toBeUndefined();
    expect(ordered.find((s) => s.key === 'story')).toBeUndefined();
    expect(ordered[0].key).toBe('hero');
  });

  it('交换两个模块的 order 后渲染顺序随之变化（模块排序）', () => {
    const config = createDefaultConfig('a', 'A');
    const before = getOrderedSections(config).map((s) => s.key);
    // 模拟编辑器「模块排序」：把 scenes 与 benefits 的 order 互换
    const scenesOrder = config.sections.scenes.order;
    config.sections.scenes.order = config.sections.benefits.order;
    config.sections.benefits.order = scenesOrder;
    const after = getOrderedSections(config).map((s) => s.key);
    const idxOf = (list: string[], key: string) => list.indexOf(key);
    expect(before.indexOf('scenes')).toBeGreaterThan(before.indexOf('benefits'));
    expect(idxOf(after, 'scenes')).toBeLessThan(idxOf(after, 'benefits'));
  });

  it('导航只显示启用且有文字和链接的项', () => {
    const config = createDefaultConfig('a', 'A');
    config.navigation[0] = { id: 'x', label: '', href: '#products', enabled: true };
    config.navigation[1] = { id: 'y', label: '产品', href: '', enabled: true };
    const visible = getVisibleNavItems(config);
    expect(visible.every((n) => n.label && n.href)).toBe(true);
  });

  it('产品按 order 排序且只返回启用的', () => {
    const config = createDefaultConfig('a', 'A');
    config.products = [
      makeProduct({ id: '1', slug: 'b', name: 'B', order: 2 }),
      makeProduct({ id: '2', slug: 'a', name: 'A', enabled: false, order: 0 }),
      makeProduct({ id: '3', slug: 'c', name: 'C', order: 1 }),
    ];
    const visible = getVisibleProducts(config);
    expect(visible).toHaveLength(2);
    expect(visible[0].name).toBe('C');
    expect(visible[1].name).toBe('B');
  });
});

describe('pre-export checks', () => {
  it('缺少品牌名和首屏标题时报错', () => {
    const config = createDefaultConfig('a', '');
    config.sections.hero.title = '';
    const { errors } = runPreExportChecks(config, 'a');
    expect(errors.some((e) => e.includes('品牌名称'))).toBe(true);
    expect(errors.some((e) => e.includes('首屏'))).toBe(true);
  });

  it('重复 slug 报错', () => {
    const config = createDefaultConfig('a', 'A');
    config.brand.name = 'A';
    config.sections.hero.title = 'Hello';
    config.products = [
      makeProduct({ id: '1', slug: 'dup', name: 'P1', order: 0 }),
      makeProduct({ id: '2', slug: 'dup', name: 'P2', order: 1 }),
    ];
    const { errors } = runPreExportChecks(config, 'a');
    expect(errors.some((e) => e.includes('重复'))).toBe(true);
  });

  it('完整配置无错误（外部图片 URL 不检查本地存在性）', () => {
    const config = createDefaultConfig('a', 'A');
    config.brand.name = 'A';
    config.sections.hero.title = 'Hello';
    config.sections.hero.image = { images: [{ src: 'https://example.com/x.jpg', alt: '', position: 'center' }], carousel: false, autoplay: false, interval: 4000 };
    config.products = [
      makeProduct({
        id: '1',
        slug: 'p1',
        name: 'P1',
        images: [{ src: 'https://example.com/p.jpg', alt: '', position: 'center' }],
        highlights: ['好'],
        order: 0,
      }),
    ];
    const result = runPreExportChecks(config, 'a');
    expect(result.errors).toHaveLength(0);
  });
});
