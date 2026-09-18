/**
 * 静态网站导出逻辑。
 * 由 scripts/export.ts 调用：校验 → next build → 拷贝品牌资源 → 生成 robots/sitemap。
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import {
  PROJECT_ROOT,
  loadBrand,
  brandDir,
  findMissingAssets,
} from './brand-loader';
import type { BrandConfig } from './brand-schema';

export interface ExportResult {
  success: boolean;
  outDir: string;
  warnings: string[];
  errors: string[];
}

/** 导出前检查：必填字段、断图、无效 URL、重复 slug */
export function runPreExportChecks(config: BrandConfig, brandSlug: string): {
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!config.brand.name?.trim()) errors.push('品牌名称不能为空');
  if (!config.sections.hero.title?.trim()) errors.push('首屏主标题不能为空');
  if (!config.sections.hero.image.images.some((i) => i.src)) warnings.push('首屏未设置主视觉图');

  const enabledProducts = config.products.filter((p) => p.enabled);
  if (enabledProducts.length === 0) warnings.push('没有已启用的产品');

  for (const p of enabledProducts) {
    if (!p.highlights || p.highlights.length === 0) {
      warnings.push(`产品「${p.name}」没有卖点`);
    }
    if (p.images.length === 0) warnings.push(`产品「${p.name}」没有图片`);
  }

  // 重复 slug
  const slugs = new Set<string>();
  for (const p of config.products) {
    if (slugs.has(p.slug)) errors.push(`产品 slug 重复：${p.slug}`);
    slugs.add(p.slug);
  }

  // 缺失资源
  const missing = findMissingAssets(config, brandSlug);
  for (const m of missing) errors.push(`图片资源缺失：${m}`);

  // URL 格式
  const urlFields: [string, string][] = [
    ['购买链接', config.links.purchase],
    ['Instagram', config.links.instagram],
    ['邮箱', config.links.email],
  ];
  for (const [label, url] of urlFields) {
    if (
      url &&
      !isValidUrl(url) &&
      !url.startsWith('#') &&
      !url.startsWith('mailto:') &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(url)
    ) {
      warnings.push(`${label} 格式可能无效：${url}`);
    }
  }

  return { errors, warnings };
}

function isValidUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === 'http:' || u.protocol === 'https:' || u.protocol === 'mailto:';
  } catch {
    return false;
  }
}

/** 执行静态导出 */
export function exportSite(brandSlug: string): ExportResult {
  const loaded = loadBrand(brandSlug);
  if (!loaded.success) {
    return { success: false, outDir: '', warnings: [], errors: loaded.errors };
  }
  const config = loaded.data;

  const { errors, warnings } = runPreExportChecks(config, brandSlug);
  if (errors.length > 0) {
    return { success: false, outDir: '', warnings, errors };
  }

  const outDir = path.join(PROJECT_ROOT, 'out');
  // 清理旧的导出产物
  if (fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true, force: true });

  // 运行 next build（静态导出模式）
  // 注意：必须强制 NODE_ENV=production。dev server 环境下 process.env.NODE_ENV
  // 不是标准值，会让 next build 误加载 dev 运行时（<Html> outside pages/_document、
  // useContext null），导致全部页面预渲染失败。
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    NODE_ENV: 'production',
    EXPORT_MODE: 'true',
    BRAND_SLUG: brandSlug,
    NEXT_PUBLIC_EXPORT_MODE: 'true',
    NEXT_PUBLIC_BRAND_SLUG: brandSlug,
  };
  try {
    execSync('npx next build', {
      cwd: PROJECT_ROOT,
      env,
      stdio: 'pipe',
      encoding: 'utf-8',
    });
  } catch (e) {
    const err = e as { message?: string; stderr?: Buffer | string; stdout?: Buffer | string };
    const stderrText = (err.stderr ? err.stderr.toString() : '').trim();
    const stdoutText = (err.stdout ? err.stdout.toString() : '').trim();
    const detail = [stderrText, stdoutText].filter(Boolean).join('\n').slice(0, 3000);
    return {
      success: false,
      outDir,
      warnings,
      errors: [`Next.js 构建失败：${err.message || '未知错误'}${detail ? `\n${detail}` : ''}`],
    };
  }

  if (!fs.existsSync(outDir)) {
    return {
      success: false,
      outDir,
      warnings,
      errors: ['构建完成但未找到 out/ 目录'],
    };
  }

  // 拷贝品牌 assets 到 out/assets
  const srcAssets = path.join(brandDir(brandSlug), 'assets');
  const dstAssets = path.join(outDir, 'assets');
  if (fs.existsSync(srcAssets)) {
    copyDirSync(srcAssets, dstAssets);
  }

  // 从对外站移除本地工具页面（编辑器/预览），编辑功能仅在本地 dev server 使用
  for (const f of ['editor.html', 'editor.txt', 'preview.html', 'preview.txt']) {
    const p = path.join(outDir, f);
    if (fs.existsSync(p)) fs.rmSync(p, { force: true });
  }

  // 拷贝 favicon（如果配置了）
  if (config.seo.favicon?.src) {
    const favSrc = path.join(brandDir(brandSlug), config.seo.favicon.src);
    if (fs.existsSync(favSrc)) {
      fs.copyFileSync(favSrc, path.join(outDir, 'favicon' + path.extname(config.seo.favicon.src)));
    }
  }

  // 生成 robots.txt
  const robots = 'User-agent: *\nAllow: /\n';
  fs.writeFileSync(path.join(outDir, 'robots.txt'), robots, 'utf-8');

  // 生成 sitemap.xml
  // canonical 可能不带协议头（如 www.example.com），自动补全 https://
  let canonical = config.seo.canonical || '';
  if (canonical && !/^https?:\/\//i.test(canonical)) canonical = 'https://' + canonical;
  const origin = canonical || 'https://example.com/';
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${origin}</loc></url>
</urlset>
`;
  fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap, 'utf-8');

  return { success: true, outDir, warnings, errors: [] };
}

function copyDirSync(src: string, dst: string): void {
  if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const dstPath = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDirSync(srcPath, dstPath);
    else fs.copyFileSync(srcPath, dstPath);
  }
}
