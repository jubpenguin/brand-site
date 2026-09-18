import type { Metadata } from 'next';
import { getBrandForRender } from '@/lib/brand-server';
import { themeToCssVars } from '@/lib/themes';
import { assetUrl } from '@/lib/asset-url';

export async function generateMetadata(): Promise<Metadata> {
  const { config } = getBrandForRender();
  const title = config.seo.title || config.brand.name;
  const description = config.seo.description || config.brand.description || config.brand.tagline;
  const shareImage = config.seo.shareImage.src
    ? assetUrl(config.seo.shareImage.src)
    : undefined;
  const favicon = config.seo.favicon.src ? assetUrl(config.seo.favicon.src) : undefined;
  // OG 图等相对路径生成绝对 URL 的基准域名：
  // canonical（品牌配置）→ NEXT_PUBLIC_SITE_URL（部署环境）→ 本地
  const siteUrl =
    config.seo.canonical ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'http://localhost:3000';

  return {
    title,
    description,
    metadataBase: new URL(siteUrl),
    icons: favicon ? { icon: favicon } : undefined,
    openGraph: {
      title,
      description: description || undefined,
      images: shareImage ? [shareImage] : undefined,
      siteName: config.brand.name,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: description || undefined,
      images: shareImage ? [shareImage] : undefined,
    },
    alternates: config.seo.canonical ? { canonical: config.seo.canonical } : undefined,
  };
}

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { config } = getBrandForRender();
  const vars = themeToCssVars(config.theme);
  const cssVars = Object.entries(vars)
    .map(([k, v]) => `${k}: ${v};`)
    .join('\n  ');

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `:root {\n  ${cssVars}\n}`,
        }}
      />
      {children}
    </>
  );
}
