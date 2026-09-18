'use client';

import { useEditorStore } from './editor-store';
import { BrandForm, ThemeForm } from './forms/BrandForm';
import {
  HeroForm,
  AboutForm,
  ProductsSectionForm,
  BenefitsForm,
  ScenesForm,
  StoryForm,
  FaqForm,
  ContactForm,
  NavigationForm,
  SectionOrderForm,
} from './forms/SectionsForm';
import { ProductsForm } from './forms/ProductsForm';
import { LinksForm, SeoForm, ExportForm } from './forms/LinksSeoForm';

export function FormPanel() {
  const activeSection = useEditorStore((s) => s.activeSection);
  const loading = useEditorStore((s) => s.loading);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-400">
        加载中…
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-6 py-6">
      {activeSection === 'brand' && <BrandForm />}
      {activeSection === 'theme' && <ThemeForm />}
      {activeSection === 'navigation' && <NavigationForm />}
      {activeSection === 'order' && <SectionOrderForm />}
      {activeSection === 'hero' && <HeroForm />}
      {activeSection === 'about' && <AboutForm />}
      {activeSection === 'products' && (
        <div className="flex flex-col gap-6">
          <ProductsSectionForm />
          <ProductsForm />
        </div>
      )}
      {activeSection === 'benefits' && <BenefitsForm />}
      {activeSection === 'scenes' && <ScenesForm />}
      {activeSection === 'story' && <StoryForm />}
      {activeSection === 'faq' && <FaqForm />}
      {activeSection === 'contact' && <ContactForm />}
      {activeSection === 'links' && <LinksForm />}
      {activeSection === 'seo' && <SeoForm />}
      {activeSection === 'export' && <ExportForm />}
    </div>
  );
}
