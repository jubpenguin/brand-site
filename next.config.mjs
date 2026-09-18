/** @type {import('next').NextConfig} */
const isExport = process.env.EXPORT_MODE === 'true';

// 部署到 GitHub Pages 子路径时设置（如 /brand-site），开发环境为空
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig = {
  reactStrictMode: true,
  basePath,
  images: {
    unoptimized: isExport,
  },
  ...(isExport
    ? {
        output: 'export',
        // 导出时使用独立目录 out/，避免与 dev server 的 .next 冲突
        distDir: 'out',
      }
    : {}),
};

export default nextConfig;
