import type { ContactSection as ContactSectionType, LinkConfig } from '@/lib/brand-schema';
import { CtaLink } from './CtaLink';

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export function Contact({
  section,
  links,
}: {
  section: ContactSectionType;
  links?: LinkConfig;
}) {
  const { eyebrow, title, body, cta } = section;
  const email = links?.email ?? '';
  const phone = links?.phone ?? '';
  if (!title && !body && !cta.href && !email && !phone) return null;

  return (
    <section id="contact" className="section-gap">
      <div className="container-brand">
        <div className="flex flex-col items-center gap-5 rounded-brand-lg bg-brand-surface px-6 py-14 text-center md:py-20">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          {title && (
            <h2 className="max-w-xl whitespace-pre-line font-heading text-3xl font-normal leading-tight tracking-tight md:text-4xl">
              {title}
            </h2>
          )}
          {body && (
            <p className="max-w-md whitespace-pre-line text-sm leading-relaxed text-brand-muted md:text-base">{body}</p>
          )}
          {(email || phone) && (
            <div className="mt-1 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="inline-flex items-center gap-2 text-sm text-brand-text underline-offset-4 transition-colors hover:text-brand-primary hover:underline"
                >
                  <MailIcon />
                  <span className="whitespace-pre-line">{email}</span>
                </a>
              )}
              {phone && (
                <a
                  href={`tel:${phone.replace(/[\s()-]/g, '')}`}
                  className="inline-flex items-center gap-2 text-sm text-brand-text underline-offset-4 transition-colors hover:text-brand-primary hover:underline"
                >
                  <PhoneIcon />
                  <span className="whitespace-pre-line">{phone}</span>
                </a>
              )}
            </div>
          )}
          {cta.href && <CtaLink cta={cta} className="mt-2" />}
        </div>
      </div>
    </section>
  );
}
