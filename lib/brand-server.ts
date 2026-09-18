/**
 * 服务端渲染时获取品牌配置。
 * - 静态导出：从 BRAND_SLUG 环境变量读取（构建时固定）
 * - 本地开发：从 active brand 指针读取（可在编辑器中切换）
 */
import { loadBrand, getActiveBrandSlug } from './brand-loader';
import { createDefaultConfig } from './brand-defaults';
import type { BrandConfig } from './brand-schema';

export function getBrandForRender(): { config: BrandConfig; slug: string; migratedFrom?: string } {
  const slug = process.env.BRAND_SLUG || getActiveBrandSlug();
  const result = loadBrand(slug);
  if (!result.success) {
    return { config: createDefaultConfig(slug || 'brand', 'Brand'), slug: slug || 'brand' };
  }
  return { config: result.data, slug, migratedFrom: result.migratedFrom };
}
