import type { Product, ProductsSection as ProductsSectionType } from '@/lib/brand-schema';
import { getVisibleProducts } from '@/lib/sections';
import type { BrandConfig } from '@/lib/brand-schema';
import { MediaGallery } from './MediaGallery';

function ProductCard({ product }: { product: Product }) {
  const hasImages = product.images.some((i) => i.src);
  // 产品多图 → 媒体槽位，复用统一轮播
  const slot = {
    images: product.images,
    carousel: product.carousel,
    autoplay: product.autoplay,
    interval: product.interval,
  };

  return (
    <article className="group flex flex-col">
      <div className="relative overflow-hidden rounded-brand-lg bg-brand-surface">
        {hasImages ? (
          <MediaGallery
            slot={slot}
            fallbackAlt={product.name}
            fit="contain"
            imgClassName="aspect-square w-full p-6"
            frameClassName=""
          />
        ) : (
          <div className="flex aspect-square w-full items-center justify-center bg-brand-surface text-xs text-brand-muted/60">
            暂无产品图
          </div>
        )}
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-brand-background/90 px-2.5 py-1 text-[11px] font-medium tracking-wide text-brand-text backdrop-blur-sm">
            {product.badge}
          </span>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-3">
          {product.name && (
            <h3 className="font-heading text-xl font-medium tracking-tight">{product.name}</h3>
          )}
        </div>
        {product.subtitle && <p className="whitespace-pre-line text-sm text-brand-muted">{product.subtitle}</p>}

        {product.highlights.filter(Boolean).length > 0 && (
          <ul className="mt-2 flex flex-col gap-1">
            {product.highlights.filter(Boolean).slice(0, 4).map((h, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-brand-muted">
                <span className="mt-[7px] h-1 w-1 flex-shrink-0 rounded-full bg-brand-primary" />
                {h}
              </li>
            ))}
          </ul>
        )}

        {product.description && (
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-brand-muted line-clamp-3">
            {product.description}
          </p>
        )}

        {product.purchaseUrl && (
          <a
            href={product.purchaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-brand btn-outline mt-4 self-start text-sm"
          >
            查看详情
          </a>
        )}
      </div>
    </article>
  );
}

export function Products({ section, config }: { section: ProductsSectionType; config: BrandConfig }) {
  const products = getVisibleProducts(config);
  if (products.length === 0) return null;
  const { eyebrow, title } = section;

  return (
    <section id="products" className="section-gap">
      <div className="container-brand">
        {(eyebrow || title) && (
          <div className="mb-10 md:mb-14">
            {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
            {title && (
              <h2 className="whitespace-pre-line font-heading text-3xl font-normal tracking-tight md:text-4xl">
                {title}
              </h2>
            )}
          </div>
        )}
        <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
