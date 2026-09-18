import type { BenefitsSection as BenefitsSectionType } from '@/lib/brand-schema';

export function Benefits({ section }: { section: BenefitsSectionType }) {
  const { title, items } = section;
  const visible = items.filter((i) => i.title || i.body);
  if (visible.length === 0) return null;

  return (
    <section id="benefits" className="section-gap bg-brand-surface/50">
      <div className="container-brand">
        {title && (
          <h2 className="mb-10 whitespace-pre-line text-center font-heading text-3xl font-normal tracking-tight md:mb-14 md:text-4xl">
            {title}
          </h2>
        )}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => (
            <div key={item.id} className="flex flex-col gap-3">
              {item.icon ? (
                <span className="text-2xl" aria-hidden>
                  {item.icon}
                </span>
              ) : (
                <span
                  className="h-8 w-8 rounded-full"
                  style={{ backgroundColor: 'var(--brand-accent)' }}
                  aria-hidden
                />
              )}
              {item.title && (
                <h3 className="whitespace-pre-line font-heading text-lg font-medium">{item.title}</h3>
              )}
              {item.body && <p className="whitespace-pre-line text-sm leading-relaxed text-brand-muted">{item.body}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
