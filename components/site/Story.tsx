import type { StorySection as StorySectionType } from '@/lib/brand-schema';
import { MediaGallery } from './MediaGallery';

export function Story({ section }: { section: StorySectionType }) {
  const { eyebrow, title, body, image, values, mediaOrder } = section;
  const hasMedia = image.images.some((i) => i.src);
  const visibleValues = values.filter((v) => v.title || v.body);
  if (!eyebrow && !title && !body && !hasMedia && visibleValues.length === 0) return null;

  const imageOnLeft = mediaOrder === 'first';

  return (
    <section id="story" className="section-gap bg-brand-surface/50">
      <div className="container-brand">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
          {hasMedia && (
            <div className={imageOnLeft ? 'md:order-1' : 'md:order-2'}>
              <MediaGallery
                slot={image}
                fallbackAlt={title}
                fit="cover"
                imgClassName="aspect-[4/5] w-full md:aspect-[3/4]"
                frameClassName="overflow-hidden rounded-brand-lg bg-brand-background"
              />
            </div>
          )}

          <div className={`flex flex-col ${imageOnLeft ? 'md:order-2' : 'md:order-1'}`}>
            {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
            {title && (
              <h2 className="whitespace-pre-line font-heading text-3xl font-normal leading-tight tracking-tight md:text-4xl">
                {title}
              </h2>
            )}
            {body && (
              <p className="mt-5 max-w-xl text-base leading-relaxed text-brand-muted md:text-lg whitespace-pre-line">
                {body}
              </p>
            )}

            {visibleValues.length > 0 && (
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                {visibleValues.map((v) => (
                  <div key={v.id} className="border-l-2 border-brand-accent pl-4">
                    {v.title && <h3 className="whitespace-pre-line font-heading text-base font-medium">{v.title}</h3>}
                    {v.body && <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-brand-muted">{v.body}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
