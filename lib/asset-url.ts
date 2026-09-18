/**
 * 资源路径解析：
 * 配置中存 "assets/hero.jpg"，开发时由自定义服务器从品牌目录提供，
 * 静态导出时资源拷贝到 out/assets/，两种情况都解析为 "/assets/hero.jpg"。
 *
 * 部署到 GitHub Pages 子路径（如 /brand-site）时，通过 NEXT_PUBLIC_BASE_PATH
 * 给资源路径加上前缀（/brand-site/assets/hero.jpg），保证线上图片可访问。
 * 开发环境未设置该变量，行为与之前完全一致。
 */
export function assetUrl(src: string | undefined | null): string {
  if (!src) return '';
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith('data:')) return src;
  const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
  if (src.startsWith('/')) return base + src;
  return base + '/' + src;
}

/** 判断是否为外部链接 */
export function isExternalUrl(href: string): boolean {
  return /^https?:\/\//i.test(href);
}
