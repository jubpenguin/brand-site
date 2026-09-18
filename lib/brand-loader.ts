/**
 * 服务端品牌配置加载器（仅在本地 dev server / 导出脚本中使用）。
 * 负责品牌目录的读写、图片资源管理、配置校验与迁移。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { BrandConfig } from './brand-schema';
import { migrateConfig } from './migrations';
import { createDefaultConfig } from './brand-defaults';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** 项目根目录 */
export const PROJECT_ROOT = path.resolve(__dirname, '..');
/** 品牌数据目录 */
export const BRANDS_DIR = path.join(PROJECT_ROOT, 'brands');
/** 当前激活品牌指针文件 */
const ACTIVE_POINTER = path.join(BRANDS_DIR, '.active-brand');

export interface BrandSummary {
  slug: string;
  name: string;
  tagline: string;
  updatedAt: string;
  isTemplate?: boolean;
}

function ensureBrandsDir(): void {
  if (!fs.existsSync(BRANDS_DIR)) {
    fs.mkdirSync(BRANDS_DIR, { recursive: true });
  }
}

export function brandDir(slug: string): string {
  return path.join(BRANDS_DIR, slug);
}

function configPath(slug: string): string {
  return path.join(brandDir(slug), 'brand.config.json');
}

function assetsDir(slug: string): string {
  return path.join(brandDir(slug), 'assets');
}

/** 列出所有品牌（不含 _template 模板，除非指定） */
export function listBrands(includeTemplate = false): BrandSummary[] {
  ensureBrandsDir();
  const entries = fs.readdirSync(BRANDS_DIR, { withFileTypes: true });
  const brands: BrandSummary[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('_') && !includeTemplate) continue;
    const cfgFile = path.join(BRANDS_DIR, entry.name, 'brand.config.json');
    if (!fs.existsSync(cfgFile)) continue;
    try {
      const raw = JSON.parse(fs.readFileSync(cfgFile, 'utf-8')) as BrandConfig;
      const stat = fs.statSync(cfgFile);
      brands.push({
        slug: raw.brand?.slug ?? entry.name,
        name: raw.brand?.name ?? entry.name,
        tagline: raw.brand?.tagline ?? '',
        updatedAt: stat.mtime.toISOString(),
        isTemplate: entry.name.startsWith('_'),
      });
    } catch {
      // 跳过损坏配置
    }
  }
  return brands.sort((a, b) => a.name.localeCompare(b.name, 'zh'));
}

/** 获取当前激活品牌 slug */
export function getActiveBrandSlug(): string {
  ensureBrandsDir();
  if (fs.existsSync(ACTIVE_POINTER)) {
    const slug = fs.readFileSync(ACTIVE_POINTER, 'utf-8').trim();
    if (slug && fs.existsSync(configPath(slug))) return slug;
  }
  // 默认选择第一个品牌或 demo-brand
  const brands = listBrands();
  if (brands.length > 0) return brands[0].slug;
  return 'demo-brand';
}

/** 设置当前激活品牌 */
export function setActiveBrandSlug(slug: string): void {
  ensureBrandsDir();
  fs.writeFileSync(ACTIVE_POINTER, slug, 'utf-8');
}

/** 读取并迁移品牌配置 */
export function loadBrand(slug: string): {
  success: true;
  data: BrandConfig;
  migratedFrom?: string;
} | {
  success: false;
  errors: string[];
} {
  const file = configPath(slug);
  if (!fs.existsSync(file)) {
    return { success: false, errors: [`品牌配置不存在：${slug}`] };
  }
  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch (e) {
    return { success: false, errors: [`配置文件 JSON 解析失败：${(e as Error).message}`] };
  }
  return migrateConfig(raw);
}

/** 保存品牌配置（先校验，不静默覆盖损坏文件） */
export function saveBrand(slug: string, config: BrandConfig): {
  success: true;
} | {
  success: false;
  errors: string[];
} {
  // 写入前重新校验，确保落盘文件合法
  const result = migrateConfig(config);
  if (!result.success) return { success: false, errors: result.errors };
  const dir = brandDir(slug);
  const assets = assetsDir(slug);
  if (!fs.existsSync(assets)) fs.mkdirSync(assets, { recursive: true });
  // 确保配置中的 slug 与目录一致
  result.data.brand.slug = slug;
  fs.writeFileSync(configPath(slug), JSON.stringify(result.data, null, 2), 'utf-8');
  return { success: true };
}

/** 生成不冲突的安全 slug */
function uniqueSlug(base: string, exclude?: string): string {
  const normalized = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'brand';
  let slug = normalized;
  let i = 2;
  while (fs.existsSync(brandDir(slug)) && slug !== exclude) {
    slug = `${normalized}-${i}`;
    i += 1;
  }
  return slug;
}

/** 新建品牌：基于默认模板 */
export function createBrand(name: string, slugBase?: string): {
  success: true;
  slug: string;
} | {
  success: false;
  errors: string[];
} {
  const baseSlug = slugBase || name;
  const slug = uniqueSlug(baseSlug);
  const config = createDefaultConfig(slug, name);
  const dir = brandDir(slug);
  fs.mkdirSync(path.join(dir, 'assets'), { recursive: true });
  fs.writeFileSync(configPath(slug), JSON.stringify(config, null, 2), 'utf-8');
  return { success: true, slug };
}

/** 复制品牌（生成新 slug，不覆盖原品牌） */
export function duplicateBrand(sourceSlug: string, newName: string): {
  success: true;
  slug: string;
} | {
  success: false;
  errors: string[];
} {
  const loaded = loadBrand(sourceSlug);
  if (!loaded.success) return { success: false, errors: loaded.errors };
  const newSlug = uniqueSlug(newName || sourceSlug);
  const config = loaded.data;
  config.brand.slug = newSlug;
  config.brand.name = newName || `${config.brand.name} 副本`;
  const srcDir = brandDir(sourceSlug);
  const dstDir = brandDir(newSlug);
  // 复制整个目录（含 assets）
  copyDirSync(srcDir, dstDir);
  config.brand.slug = newSlug;
  fs.writeFileSync(configPath(newSlug), JSON.stringify(config, null, 2), 'utf-8');
  return { success: true, slug: newSlug };
}

/** 重命名品牌（修改显示名称，slug 可选变更） */
export function renameBrand(slug: string, newName: string, newSlug?: string): {
  success: true;
  slug: string;
} | {
  success: false;
  errors: string[];
} {
  const loaded = loadBrand(slug);
  if (!loaded.success) return { success: false, errors: loaded.errors };
  let targetSlug = slug;
  if (newSlug && newSlug !== slug) {
    targetSlug = uniqueSlug(newSlug, slug);
    if (targetSlug !== slug) {
      fs.renameSync(brandDir(slug), brandDir(targetSlug));
    }
  }
  loaded.data.brand.name = newName;
  loaded.data.brand.slug = targetSlug;
  fs.writeFileSync(configPath(targetSlug), JSON.stringify(loaded.data, null, 2), 'utf-8');
  return { success: true, slug: targetSlug };
}

/** 删除品牌（不可恢复，调用方应做二次确认） */
export function deleteBrand(slug: string): { success: true } | { success: false; errors: string[] } {
  if (slug.startsWith('_')) {
    return { success: false, errors: ['不能删除内置模板'] };
  }
  const dir = brandDir(slug);
  if (!fs.existsSync(dir)) return { success: false, errors: ['品牌不存在'] };
  fs.rmSync(dir, { recursive: true, force: true });
  return { success: true };
}

/** 保存上传的图片到品牌 assets 目录，返回相对路径 */
export function saveImage(
  brandSlug: string,
  fileName: string,
  buffer: Buffer,
): { success: true; relativePath: string } | { success: false; errors: string[] } {
  const safeName = sanitizeFileName(fileName);
  const assets = assetsDir(brandSlug);
  if (!fs.existsSync(assets)) fs.mkdirSync(assets, { recursive: true });
  let finalName = safeName;
  let i = 2;
  const ext = path.extname(safeName);
  const base = path.basename(safeName, ext);
  while (fs.existsSync(path.join(assets, finalName))) {
    finalName = `${base}-${i}${ext}`;
    i += 1;
  }
  fs.writeFileSync(path.join(assets, finalName), buffer);
  return { success: true, relativePath: `assets/${finalName}` };
}

/** 删除品牌 assets 中的图片 */
export function deleteImage(brandSlug: string, relativePath: string): void {
  const full = path.join(brandDir(brandSlug), relativePath);
  // 安全检查：必须在品牌目录内
  if (!full.startsWith(brandDir(brandSlug))) return;
  if (fs.existsSync(full) && fs.statSync(full).isFile()) {
    fs.unlinkSync(full);
  }
}

/** 列出品牌 assets 目录中的图片 */
export function listAssets(brandSlug: string): string[] {
  const assets = assetsDir(brandSlug);
  if (!fs.existsSync(assets)) return [];
  return fs
    .readdirSync(assets)
    .filter((f) => /\.(jpe?g|png|webp|svg|gif|avif)$/i.test(f))
    .map((f) => `assets/${f}`);
}

/** 判断字符串是否是本地资源路径（而非 emoji 或纯文字） */
function isAssetPath(s: string): boolean {
  if (/^https?:\/\//i.test(s)) return false;
  if (s.startsWith('data:')) return false;
  // 包含路径分隔符或图片扩展名才视为资源路径
  return /[\\/]/.test(s) || /\.(jpe?g|png|webp|svg|gif|avif)$/i.test(s);
}

/**
 * 检查配置引用的资源是否都存在。
 * 返回缺失资源的相对路径列表（空数组表示全部存在）。
 */
export function findMissingAssets(config: BrandConfig, brandSlug: string): string[] {
  const refs = collectAssetRefs(config);
  const missing: string[] = [];
  for (const ref of refs) {
    if (!ref) continue;
    // 外部 URL 不检查
    if (/^https?:\/\//i.test(ref)) continue;
    const full = path.join(brandDir(brandSlug), ref);
    if (!fs.existsSync(full)) missing.push(ref);
  }
  return missing;
}

/** 收集配置中所有图片引用路径 */
export function collectAssetRefs(config: BrandConfig): string[] {
  const refs: string[] = [];
  const add = (img?: { src?: string }) => {
    if (img?.src) refs.push(img.src);
  };
  const addSlot = (slot?: { images?: { src?: string }[] }) => {
    for (const img of slot?.images ?? []) add(img);
  };
  add(config.brand.logo);
  add(config.seo.shareImage);
  add(config.seo.favicon);
  addSlot(config.sections.hero.image);
  addSlot(config.sections.about.image);
  addSlot(config.sections.story.image);
  for (const item of config.sections.benefits.items) {
    // icon 可能是 emoji 或图片路径；只有看起来像文件路径的才作为资源检查
    if (item.icon && isAssetPath(item.icon)) refs.push(item.icon);
  }
  for (const item of config.sections.scenes.items) addSlot(item.image);
  for (const p of config.products) {
    for (const img of p.images) add(img);
  }
  return refs;
}

/** 查找引用某图片的位置（用于删除前提示） */
export function findAssetUsages(config: BrandConfig, relativePath: string): string[] {
  const usages: string[] = [];
  const check = (label: string, img?: { src?: string }) => {
    if (img?.src === relativePath) usages.push(label);
  };
  const checkSlot = (label: string, slot?: { images?: { src?: string }[] }) => {
    (slot?.images ?? []).forEach((img, i) => {
      if (img.src === relativePath) usages.push(`${label} ${i + 1}`);
    });
  };
  check('品牌 Logo', config.brand.logo);
  check('SEO 分享图', config.seo.shareImage);
  check('favicon', config.seo.favicon);
  checkSlot('首屏图', config.sections.hero.image);
  checkSlot('品牌简介图', config.sections.about.image);
  checkSlot('品牌故事图', config.sections.story.image);
  config.sections.scenes.items.forEach((item, i) => checkSlot(`场景图 ${i + 1}`, item.image));
  config.products.forEach((p) => {
    p.images.forEach((img, i) => check(`产品「${p.name}」图 ${i + 1}`, img));
  });
  return usages;
}

// ---------- 工具函数 ----------

function sanitizeFileName(name: string): string {
  const ext = path.extname(name).toLowerCase();
  const base = path
    .basename(name, ext)
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'image';
  const allowedExt = new Set(['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif', '.avif']);
  const safeExt = allowedExt.has(ext) ? ext : '.png';
  return `${base}${safeExt}`;
}

function copyDirSync(src: string, dst: string): void {
  if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const dstPath = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, dstPath);
    } else {
      fs.copyFileSync(srcPath, dstPath);
    }
  }
}
