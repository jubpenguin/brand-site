/**
 * 本地开发服务器（自定义 Next.js server）。
 *
 * 职责：
 * 1. 启动 Next.js dev server，提供官网与编辑器页面
 * 2. 处理 /api/* 文件系统操作（品牌增删改查、图片上传、导入导出、静态导出）
 * 3. 将 /assets/* 映射到当前激活品牌的 assets 目录
 *
 * 仅用于本地开发；正式静态网站由 `npm run export` 生成。
 */
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { parse } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import next from 'next';
import {
  listBrands,
  loadBrand,
  saveBrand,
  createBrand,
  duplicateBrand,
  renameBrand,
  deleteBrand,
  saveImage,
  deleteImage,
  listAssets,
  getActiveBrandSlug,
  setActiveBrandSlug,
  brandDir,
  findAssetUsages,
  PROJECT_ROOT,
} from './lib/brand-loader';
import { migrateConfig } from './lib/migrations';
import { exportSite } from './lib/export-site';
import type { BrandConfig } from './lib/brand-schema';

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOSTNAME = '0.0.0.0';
const DEV = process.env.NODE_ENV !== 'production';

const app = next({ dev: DEV, dir: PROJECT_ROOT, hostname: HOSTNAME, port: PORT });
const handle = app.getRequestHandler();

const MAX_BODY = 25 * 1024 * 1024; // 25MB（base64 图片）

// ---------- 工具 ----------

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(new Error('请求体过大（上限 25MB）'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    req.on('error', reject);
  });
}

async function readJsonBody<T = unknown>(req: IncomingMessage): Promise<T> {
  const raw = await readBody(req);
  if (!raw) return {} as T;
  return JSON.parse(raw) as T;
}

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
};

// ---------- API 路由 ----------

async function handleApi(req: IncomingMessage, res: ServerResponse, urlPath: string) {
  const method = req.method || 'GET';
  const parts = urlPath.split('/').filter(Boolean); // ['api', ...]

  try {
    // GET /api/brands — 列出所有品牌
    if (parts[1] === 'brands' && parts.length === 2 && method === 'GET') {
      return sendJson(res, 200, { brands: listBrands(), active: getActiveBrandSlug() });
    }

    // GET /api/brands/active — 获取当前激活品牌的完整配置
    if (parts[1] === 'brands' && parts[2] === 'active' && parts.length === 3 && method === 'GET') {
      const activeSlug = getActiveBrandSlug();
      const loaded = loadBrand(activeSlug);
      if (!loaded.success) return sendJson(res, 404, { errors: loaded.errors });
      return sendJson(res, 200, { slug: activeSlug, config: loaded.data });
    }

    // GET /api/active
    if (parts[1] === 'active' && parts.length === 2 && method === 'GET') {
      return sendJson(res, 200, { slug: getActiveBrandSlug() });
    }

    // POST /api/active  { slug }
    if (parts[1] === 'active' && parts.length === 2 && method === 'POST') {
      const body = await readJsonBody<{ slug: string }>(req);
      setActiveBrandSlug(body.slug);
      return sendJson(res, 200, { slug: body.slug });
    }

    // POST /api/brands  { name, slug? }
    if (parts[1] === 'brands' && parts.length === 2 && method === 'POST') {
      const body = await readJsonBody<{ name: string; slug?: string }>(req);
      if (!body.name?.trim()) return sendJson(res, 400, { error: '品牌名称不能为空' });
      const result = createBrand(body.name.trim(), body.slug);
      if (!result.success) return sendJson(res, 400, { errors: result.errors });
      setActiveBrandSlug(result.slug);
      return sendJson(res, 200, { slug: result.slug });
    }

    // POST /api/import  { config } — 导入 JSON 配置为新品牌
    if (parts[1] === 'import' && parts.length === 2 && method === 'POST') {
      const body = await readJsonBody<{ config: unknown; newSlug?: string }>(req);
      const migrated = migrateConfig(body.config);
      if (!migrated.success) return sendJson(res, 400, { errors: migrated.errors });
      const config = migrated.data;
      const slug = body.newSlug || config.brand.slug;
      // 若 slug 已存在，自动加后缀
      let finalSlug = slug;
      let i = 2;
      while (fs.existsSync(path.join(PROJECT_ROOT, 'brands', finalSlug))) {
        finalSlug = `${slug}-${i}`;
        i += 1;
      }
      config.brand.slug = finalSlug;
      const dir = path.join(PROJECT_ROOT, 'brands', finalSlug, 'assets');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        path.join(PROJECT_ROOT, 'brands', finalSlug, 'brand.config.json'),
        JSON.stringify(config, null, 2),
        'utf-8',
      );
      setActiveBrandSlug(finalSlug);
      return sendJson(res, 200, { slug: finalSlug, migratedFrom: migrated.migratedFrom });
    }

    // GET /api/export/:slug — 导出配置 JSON
    if (parts[1] === 'export' && parts.length === 3 && method === 'GET') {
      const slug = parts[2];
      const loaded = loadBrand(slug);
      if (!loaded.success) return sendJson(res, 404, { errors: loaded.errors });
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${slug}.brand.config.json"`,
      );
      return res.end(JSON.stringify(loaded.data, null, 2));
    }

    // POST /api/export-site/:slug — 静态导出
    if (parts[1] === 'export-site' && parts.length === 3 && method === 'POST') {
      const slug = parts[2];
      const result = exportSite(slug);
      return sendJson(res, result.success ? 200 : 400, result);
    }

    // 以下是 /api/brands/:slug/...
    if (parts[1] === 'brands' && parts.length >= 3) {
      const slug = decodeURIComponent(parts[2]);
      const action = parts[3];

      // GET /api/brands/:slug
      if (!action && method === 'GET') {
        const loaded = loadBrand(slug);
        if (!loaded.success) return sendJson(res, 404, { errors: loaded.errors });
        return sendJson(res, 200, { config: loaded.data, migratedFrom: loaded.migratedFrom });
      }

      // POST /api/brands/:slug/save
      if (action === 'save' && method === 'POST') {
        const body = await readJsonBody<{ config: BrandConfig }>(req);
        const result = saveBrand(slug, body.config);
        if (!result.success) return sendJson(res, 400, { errors: result.errors });
        return sendJson(res, 200, { ok: true });
      }

      // POST /api/brands/:slug/duplicate  { name }
      if (action === 'duplicate' && method === 'POST') {
        const body = await readJsonBody<{ name: string }>(req);
        const result = duplicateBrand(slug, body.name?.trim() || `${slug}-copy`);
        if (!result.success) return sendJson(res, 400, { errors: result.errors });
        return sendJson(res, 200, { slug: result.slug });
      }

      // POST /api/brands/:slug/rename  { name, slug? }
      if (action === 'rename' && method === 'POST') {
        const body = await readJsonBody<{ name: string; slug?: string }>(req);
        const result = renameBrand(slug, body.name?.trim(), body.slug);
        if (!result.success) return sendJson(res, 400, { errors: result.errors });
        return sendJson(res, 200, { slug: result.slug });
      }

      // DELETE /api/brands/:slug
      if (!action && method === 'DELETE') {
        const result = deleteBrand(slug);
        if (!result.success) return sendJson(res, 400, { errors: result.errors });
        return sendJson(res, 200, { ok: true });
      }

      // POST /api/brands/:slug/images  { fileName, dataUrl }
      if (action === 'images' && parts.length === 4 && method === 'POST') {
        const body = await readJsonBody<{ fileName: string; dataUrl: string }>(req);
        const match = /^data:[^;]+;base64,(.*)$/.exec(body.dataUrl || '');
        if (!match) return sendJson(res, 400, { error: '图片数据格式无效' });
        const buffer = Buffer.from(match[1], 'base64');
        const result = saveImage(slug, body.fileName || 'image.png', buffer);
        if (!result.success) return sendJson(res, 400, { errors: result.errors });
        return sendJson(res, 200, { path: result.relativePath });
      }

      // GET /api/brands/:slug/assets
      if (action === 'assets' && parts.length === 4 && method === 'GET') {
        return sendJson(res, 200, { assets: listAssets(slug) });
      }

      // DELETE /api/brands/:slug/images?path=assets/xxx.jpg
      if (action === 'images' && parts.length === 4 && method === 'DELETE') {
        const parsed = parse(req.url || '', true);
        const imgPath = (parsed.query.path as string) || '';
        const loaded = loadBrand(slug);
        let usages: string[] = [];
        if (loaded.success) usages = findAssetUsages(loaded.data, imgPath);
        deleteImage(slug, imgPath);
        return sendJson(res, 200, { ok: true, usages });
      }
    }

    return sendJson(res, 404, { error: '未知的 API 路径' });
  } catch (e) {
    return sendJson(res, 500, { error: (e as Error).message });
  }
}

// ---------- 静态资源服务 ----------

function serveBrandAsset(req: IncomingMessage, res: ServerResponse, urlPath: string) {
  // /assets/xxx.jpg → brands/{active}/assets/xxx.jpg
  const activeSlug = getActiveBrandSlug();
  const relative = urlPath.replace(/^\/+/, ''); // assets/xxx.jpg
  const filePath = path.join(brandDir(activeSlug), relative);

  // 防目录穿越
  if (!filePath.startsWith(brandDir(activeSlug))) {
    res.statusCode = 403;
    return res.end('Forbidden');
  }
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    res.statusCode = 404;
    return res.end('Not found');
  }
  const ext = path.extname(filePath).toLowerCase();
  res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
  // 开发模式不缓存，便于切换品牌/替换图片后立即生效
  res.setHeader('Cache-Control', 'no-cache');
  fs.createReadStream(filePath).pipe(res);
}

// ---------- 启动 ----------

app.prepare().then(() => {
  createServer(async (req, res) => {
    const parsedUrl = parse(req.url || '', true);
    const urlPath = parsedUrl.pathname || '/';

    // API
    if (urlPath.startsWith('/api/')) {
      return handleApi(req, res, urlPath);
    }

    // 品牌资源
    if (urlPath.startsWith('/assets/')) {
      return serveBrandAsset(req, res, urlPath);
    }

    // 其余交给 Next.js
    handle(req, res, parsedUrl);
  }).listen(PORT, () => {
    console.log(`\n  品牌官网模板已启动`);
    console.log(`  ├─ 官网预览:  http://localhost:${PORT}`);
    console.log(`  └─ 内容编辑器: http://localhost:${PORT}/editor\n`);
  });
});
