'use client';

import { useState } from 'react';
import type { FaqSection as FaqSectionType } from '@/lib/brand-schema';

export function Faq({ section }: { section: FaqSectionType }) {
  const { title, items } = section;
  const visible = items.filter((i) => i.question && i.answer);
  const [openId, setOpenId] = useState<string | null>(null);
  if (visible.length === 0) return null;

  return (
    <section id="faq" className="section-gap bg-brand-surface/50">
      <div className="container-brand max-w-3xl">
        {title && (
          <h2 className="mb-8 whitespace-pre-line text-center font-heading text-3xl font-normal tracking-tight md:mb-12 md:text-4xl">
            {title}
          </h2>
        )}
        <div className="flex flex-col divide-y divide-brand-border border-y border-brand-border">
          {visible.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div key={item.id}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  aria-expanded={isOpen}
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                >
                  <span className="whitespace-pre-line font-heading text-base font-medium md:text-lg">
                    {item.question}
                  </span>
                  <span
                    className="flex h-6 w-6 flex-shrink-0 items-center justify-center text-brand-muted transition-transform duration-300"
                    style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0)' }}
                    aria-hidden
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </span>
                </button>
                <div
                  className="grid transition-all duration-300 ease-brand"
                  style={{
                    gridTemplateRows: isOpen ? '1fr' : '0fr',
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  <div className="overflow-hidden">
                    <p className="whitespace-pre-line pb-5 pr-8 text-sm leading-relaxed text-brand-muted">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
