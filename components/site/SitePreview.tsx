import type { BrandConfig } from '@/lib/brand-schema';
import { getOrderedSections } from '@/lib/sections';
import { Nav } from './Nav';
import { Hero } from './Hero';
import { About } from './About';
import { Products } from './Products';
import { Benefits } from './Benefits';
import { Scenes } from './Scenes';
import { Story } from './Story';
import { Faq } from './Faq';
import { Contact } from './Contact';
import { Footer } from './Footer';

/**
 * 官网完整渲染：导航 + 按 order 排序的已启用区块 + 页脚。
 * 官网页面和编辑器预览共用此组件，确保所见即所得。
 */
export function SitePreview({ config }: { config: BrandConfig }) {
  const ordered = getOrderedSections(config);

  return (
    <div className="min-h-screen bg-brand-background">
      <Nav config={config} />
      <main>
        {ordered.map((section) => {
          switch (section.key) {
            case 'hero':
              return <Hero key="hero" section={section} />;
            case 'about':
              return <About key="about" section={section} />;
            case 'products':
              return <Products key="products" section={section} config={config} />;
            case 'benefits':
              return <Benefits key="benefits" section={section} />;
            case 'scenes':
              return <Scenes key="scenes" section={section} />;
            case 'story':
              return <Story key="story" section={section} />;
            case 'faq':
              return <Faq key="faq" section={section} />;
            case 'contact':
              return <Contact key="contact" section={section} links={config.links} />;
            default:
              return null;
          }
        })}
      </main>
      <Footer config={config} />
    </div>
  );
}
