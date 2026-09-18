import type { ScenesSection as ScenesSectionType } from '@/lib/brand-schema';
import { MediaGallery } from './MediaGallery';

export function Scenes({ section }: { section: ScenesSectionType }) {
  const { eyebrow, title, items } = section;
  const visible = items.filter((i) => i.image.images.some((img) => img.src) || i.title || i.body);
  if (visible.length === 0) return null;

  return (
    <section id="scenes" className="section-gap bg-brand-surface/50">
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => (
            <figure key={item.id} className="flex flex-col gap-4">
              {item.image.images.some((img) => img.src) && (
                <MediaGallery
                  slot={item.image}
                  fallbackAlt={item.title}
                  fit="cover"
                  imgClassName="aspect-[4/5] w-full transition-transform duration-500 hover:scale-[1.02]"
                  frameClassName="overflow-hidden rounded-brand-lg bg-brand-background"
                />
              )}
              {(item.title || item.body) && (
                <figcaption className="flex flex-col gap-1.5">
                  {item.title && (
                    <h3 className="whitespace-pre-line font-heading text-lg font-medium">{item.title}</h3>
                  )}
                  {item.body && <p className="whitespace-pre-line text-sm leading-relaxed text-brand-muted">{item.body}</p>}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
