import type { BrandConfig } from '@/lib/brand-schema';
import { assetUrl } from '@/lib/asset-url';

export function Footer({ config }: { config: BrandConfig }) {
  const { brand, links } = config;
  const year = new Date().getFullYear();

  const socials: { label: string; href: string }[] = [
    { label: 'Instagram', href: links.instagram },
    { label: '小红书', href: links.xiaohongshu },
    { label: '微博', href: links.weibo },
    { label: '微信', href: links.wechat },
    // 自定义社交平台（可多条，名称和链接均需填写才显示）
    ...links.socialLinks.map((s) => ({ label: s.label, href: s.url })),
  ].filter((s) => s.href && s.label);

  return (
    <footer id="footer" className="border-t border-brand-border bg-brand-surface/40">
      <div className="container-brand py-12 md:py-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-3">
            {brand.logo.src ? (
              <img
                src={assetUrl(brand.logo.src)}
                alt={brand.logo.alt || brand.name}
                className="h-8 w-auto max-w-[220px] self-start object-contain"
              />
            ) : (
              <span className="font-heading text-lg font-semibold">{brand.name}</span>
            )}
            {brand.tagline && (
              <p className="max-w-xs text-sm text-brand-muted">{brand.tagline}</p>
            )}
          </div>

          <div className="flex flex-col gap-6 sm:flex-row sm:gap-12">
            {socials.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="eyebrow">{links.socialTitle || '关注我们'}</p>
                <ul className="flex flex-col gap-1.5">
                  {socials.map((s) => (
                    <li key={s.label}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-brand-muted transition-colors hover:text-brand-text"
                      >
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <p className="eyebrow">{links.contactTitle || '联系'}</p>
              <ul className="flex flex-col gap-1.5">
                {links.showEmailInFooter && links.email && (
                  <li>
                    <a
                      href={`mailto:${links.email}`}
                      className="text-sm text-brand-muted transition-colors hover:text-brand-text"
                    >
                      {links.email}
                    </a>
                  </li>
                )}
                {links.purchase && (
                  <li>
                    <a
                      href={links.purchase}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-brand-muted transition-colors hover:text-brand-text"
                    >
                      {links.purchaseLabel || '前往购买'}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-brand-border pt-6 text-xs text-brand-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {brand.name}. All rights reserved.
            {brand.region ? ` · ${brand.region}` : ''}
          </p>
          <div className="flex gap-5">
            {links.privacy && (
              <a
                href={links.privacy}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-brand-text"
              >
                隐私政策
              </a>
            )}
            {links.terms && (
              <a
                href={links.terms}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-brand-text"
              >
                使用条款
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
