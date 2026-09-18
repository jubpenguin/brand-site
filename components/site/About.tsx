import type { AboutSection as AboutSectionType } from '@/lib/brand-schema';
import { MediaGallery } from './MediaGallery';

export function About({ section }: { section: AboutSectionType }) {
  const { eyebrow, title, body, image, mediaOrder } = section;
  const hasMedia = image.images.some((i) => i.src);
  if (!eyebrow && !title && !body && !hasMedia) return null;

  const imageOnLeft = mediaOrder === 'first';

  const textBlock = (
    <div className="flex flex-col justify-center">
      {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
      {title && (
        <h2 className="whitespace-pre-line font-heading text-3xl font-normal leading-tight tracking-tight md:text-4xl">
          {title}
        </h2>
      )}
      {body && (
        <div className="prose-brand mt-5 max-w-xl text-base leading-relaxed md:text-lg whitespace-pre-line">
          {body}
        </div>
      )}
    </div>
  );

  const mediaBlock = hasMedia ? (
    <MediaGallery
      slot={image}
      fallbackAlt={title}
      fit="cover"
      imgClassName="aspect-[4/3] w-full"
      frameClassName="overflow-hidden rounded-brand-lg bg-brand-surface"
    />
  ) : null;

  return (
    <section id="about" className="section-gap">
      <div className="container-brand">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
          <div className={imageOnLeft ? 'md:order-1' : 'md:order-2'}>{mediaBlock}</div>
          <div className={imageOnLeft ? 'md:order-2' : 'md:order-1'}>{textBlock}</div>
        </div>
      </div>
    </section>
  );
}
