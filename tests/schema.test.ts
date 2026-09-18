import { describe, it, expect } from 'vitest';
import {
  brandConfigSchema,
  parseBrandConfig,
  SCHEMA_VERSION,
} from '../lib/brand-schema';
import { createDefaultConfig } from '../lib/brand-defaults';
import { migrateConfig } from '../lib/migrations';
import { THEME_PRESETS, themeToCssVars, applyPreset } from '../lib/themes';

describe('BrandConfig schema', () => {
  it('默认配置通过校验', () => {
    const config = createDefaultConfig('test-brand', 'Test Brand');
    const result = brandConfigSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  it('缺少必填字段时失败', () => {
    const result = parseBrandConfig({ brand: { slug: 'x' } });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.length).toBeGreaterThan(0);
    }
  });

  it('非法 slug 被拒绝', () => {
    const config = createDefaultConfig('Invalid Slug!', 'X');
    const result = brandConfigSchema.shape.brand.shape.slug.safeParse('Invalid Slug!');
    expect(result.success).toBe(false);
  });

  it('非法颜色被拒绝', () => {
    const result = brandConfigSchema.shape.theme.shape.colors.shape.primary.safeParse('red');
    expect(result.success).toBe(false);
  });

  it('schemaVersion 默认为当前版本', () => {
    const config = createDefaultConfig('a', 'A');
    expect(config.schemaVersion).toBe(SCHEMA_VERSION);
  });

  it('未知顶层字段被保留（passthrough）', () => {
    const config = createDefaultConfig('ab', 'AB');
    const withExtra = { ...config, customField: 'keep-me' };
    const result = brandConfigSchema.safeParse(withExtra);
    expect(result.success).toBe(true);
    if (result.success) {
      expect((result.data as Record<string, unknown>).customField).toBe('keep-me');
    }
  });

  it('links 页脚标题默认值并可自定义', () => {
    const config = createDefaultConfig('a', 'A');
    expect(config.links.socialTitle).toBe('关注我们');
    expect(config.links.contactTitle).toBe('联系');
    const parsed = parseBrandConfig({ ...config, links: { ...config.links, socialTitle: '找到我们', contactTitle: '联系我们' } });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.links.socialTitle).toBe('找到我们');
      expect(parsed.data.links.contactTitle).toBe('联系我们');
    }
  });

  it('旧配置缺 links 标题字段时自动补齐默认值', () => {
    const config = createDefaultConfig('a', 'A') as Record<string, unknown>;
    delete (config.links as Record<string, unknown>).socialTitle;
    delete (config.links as Record<string, unknown>).contactTitle;
    const result = parseBrandConfig(config);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.links.socialTitle).toBe('关注我们');
      expect(result.data.links.contactTitle).toBe('联系');
    }
  });

  it('links 自定义社交平台默认空、可多条并保留顺序', () => {
    const config = createDefaultConfig('a', 'A');
    expect(config.links.socialLinks).toEqual([]);
    const parsed = parseBrandConfig({
      ...config,
      links: {
        ...config.links,
        socialLinks: [
          { id: 'soc-1', label: '淘宝店铺', url: 'https://taobao.com/shop' },
          { id: 'soc-2', label: '公众号', url: 'https://mp.weixin.qq.com/x' },
        ],
      },
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.links.socialLinks).toHaveLength(2);
      expect(parsed.data.links.socialLinks[0].label).toBe('淘宝店铺');
      expect(parsed.data.links.socialLinks[1].url).toBe('https://mp.weixin.qq.com/x');
    }
  });

  it('links 联系电话默认空并可自定义', () => {
    const config = createDefaultConfig('a', 'A');
    expect(config.links.phone).toBe('');
    const parsed = parseBrandConfig({ ...config, links: { ...config.links, phone: '400-000-0000' } });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.links.phone).toBe('400-000-0000');
    }
  });

  it('旧配置无 phone 时自动补齐为空', () => {
    const config = createDefaultConfig('a', 'A') as Record<string, unknown>;
    delete (config.links as Record<string, unknown>).phone;
    const result = parseBrandConfig(config);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.links.phone).toBe('');
    }
  });
});

describe('migrations', () => {
  it('当前版本配置无需迁移', () => {
    const config = createDefaultConfig('a', 'A');
    const result = migrateConfig(config);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.migratedFrom).toBeUndefined();
      expect(result.data.schemaVersion).toBe(SCHEMA_VERSION);
    }
  });

  it('旧版本配置迁移后通过校验并补齐新字段', () => {
    const old = {
      schemaVersion: '0.9',
      brand: { slug: 'old-brand', name: 'Old' },
    };
    const result = migrateConfig(old);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.migratedFrom).toBe('0.9');
      expect(result.data.schemaVersion).toBe(SCHEMA_VERSION);
      expect(result.data.sections.hero).toBeDefined();
      expect(result.data.products).toEqual([]);
    }
  });

  it('损坏的 JSON 对象返回错误', () => {
    const result = migrateConfig(null);
    expect(result.success).toBe(false);
  });
});

describe('themes', () => {
  it('内置三套主题预设', () => {
    expect(THEME_PRESETS).toHaveLength(3);
    for (const preset of THEME_PRESETS) {
      expect(preset.colors.primary).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it('themeToCssVars 生成所有 CSS 变量', () => {
    const config = createDefaultConfig('a', 'A');
    const vars = themeToCssVars(config.theme);
    expect(vars['--brand-primary']).toBeDefined();
    expect(vars['--font-heading']).toBeDefined();
    expect(vars['--brand-radius']).toBeDefined();
  });

  it('applyPreset 切换主题颜色', () => {
    const config = createDefaultConfig('a', 'A');
    const updated = applyPreset(config.theme, '黑白极简');
    expect(updated.preset).toBe('黑白极简');
    expect(updated.colors.primary).toBe('#111111');
  });
});
