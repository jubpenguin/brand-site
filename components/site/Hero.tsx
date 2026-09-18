import type { HeroSection as HeroSectionType } from '@/lib/brand-schema';
import { CtaLink } from './CtaLink';
import { MediaGallery } from './MediaGallery';

export function Hero({ section }: { section: HeroSectionType }) {
  const { eyebrow, title, body, image, cta, ctaSecondary, layout, mediaOrder } = section;
  const hasText = eyebrow || title || body;
  const hasMedia = image.images.some((i) => i.src);

  // ---------- 全屏横图（PC 占满首屏，图片为背景，文字叠加） ----------
  if (layout === 'fullbleed') {
    return (
      <section
        id="hero"
        className="relative -mt-16 flex min-h-[100svh] items-center overflow-hidden"
      >
        <div className="absolute inset-0">
          {hasMedia ? (
            <MediaGallery
              slot={image}
              fallbackAlt={title}
              fit="cover"
              imgClassName="h-full w-full"
              frameClassName="h-full w-full"
              priority
              emptyHint=""
            />
          ) : (
            <div className="h-full w-full bg-brand-secondary" />
          )}
        </div>
        {/* 文字可读性遮罩：底部加深，保证浅色图片上的文字清晰 */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-black/30" />

        <div className="container-brand relative z-10 pt-24 pb-16">
          <div className="max-w-2xl">
            {eyebrow && (
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-white/75">
                {eyebrow}
              </p>
            )}
            {title && (
              <h1 className="whitespace-pre-line font-heading text-4xl font-normal leading-[1.08] tracking-tight text-white md:text-6xl">
                {title}
              </h1>
            )}
            {body && (
              <p className="mt-5 max-w-xl whitespace-pre-line text-base leading-relaxed text-white/85 md:text-lg">
                {body}
              </p>
            )}
            {(cta.href || ctaSecondary.href) && (
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <CtaLink cta={cta} dark />
                <CtaLink cta={ctaSecondary} dark />
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // ---------- 居中堆叠 ----------
  if (layout === 'centered') {
    const textBlock = hasText ? (
      <div className="flex flex-col items-center text-center">
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        {title && (
          <h1 className="whitespace-pre-line font-heading text-4xl font-normal leading-tight tracking-tight md:text-5xl">
            {title}
          </h1>
        )}
        {body && (
          <p className="mt-4 max-w-xl whitespace-pre-line text-base leading-relaxed text-brand-muted md:text-lg">
            {body}
          </p>
        )}
      </div>
    ) : null;

    const mediaBlock = hasMedia ? (
      <MediaGallery
        slot={image}
        fallbackAlt={title}
        fit="cover"
        imgClassName="aspect-[4/5] w-full md:aspect-[3/4]"
        frameClassName="overflow-hidden rounded-brand-lg bg-brand-surface"
        priority
      />
    ) : null;

    return (
      <section id="hero" className="section-gap">
        <div className="container-brand">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 md:gap-10">
            {mediaOrder === 'first' ? (
              <>
                {mediaBlock}
                {textBlock}
              </>
            ) : (
              <>
                {textBlock}
                {mediaBlock}
              </>
            )}
            {(cta.href || ctaSecondary.href) && (
              <div className="flex flex-wrap items-center justify-center gap-3">
                <CtaLink cta={cta} />
                <CtaLink cta={ctaSecondary} />
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // ---------- 左右两列（image-right / image-left） ----------
  const imageOnLeft = layout === 'image-left';
  return (
    <section id="hero" className="section-gap">
      <div className="container-brand">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
          {/* 文字 */}
          <div className={`flex flex-col ${imageOnLeft ? 'md:order-2' : 'md:order-1'}`}>
            {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
            {title && (
              <h1 className="whitespace-pre-line font-heading text-4xl font-normal leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">
                {title}
              </h1>
            )}
            {body && (
              <p className="mt-5 max-w-lg whitespace-pre-line text-base leading-relaxed text-brand-muted md:text-lg">
                {body}
              </p>
            )}
            {(cta.href || ctaSecondary.href) && (
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <CtaLink cta={cta} />
                <CtaLink cta={ctaSecondary} />
              </div>
            )}
          </div>

          {/* 图片 */}
          {hasMedia && (
            <div className={imageOnLeft ? 'md:order-1' : 'md:order-2'}>
              <MediaGallery
                slot={image}
                fallbackAlt={title}
                fit="cover"
                imgClassName="aspect-[4/5] w-full md:aspect-[3/4]"
                frameClassName="overflow-hidden rounded-brand-lg bg-brand-surface"
                priority
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
