import type { BrandConfig } from './brand-schema';
import type {
  HeroSection,
  AboutSection,
  ProductsSection,
  BenefitsSection,
  ScenesSection,
  StorySection,
  FaqSection,
  ContactSection,
} from './brand-schema';

/** 区块 id 与对应锚点的映射 */
export const SECTION_ANCHORS: Record<string, string> = {
  hero: 'top',
  about: 'about',
  products: 'products',
  benefits: 'benefits',
  scenes: 'scenes',
  story: 'story',
  faq: 'faq',
  contact: 'contact',
};

/** 带 key 的区块联合类型，用于 switch 类型收窄 */
export type OrderedSection =
  | ({ key: 'hero' } & HeroSection)
  | ({ key: 'about' } & AboutSection)
  | ({ key: 'products' } & ProductsSection)
  | ({ key: 'benefits' } & BenefitsSection)
  | ({ key: 'scenes' } & ScenesSection)
  | ({ key: 'story' } & StorySection)
  | ({ key: 'faq' } & FaqSection)
  | ({ key: 'contact' } & ContactSection);

/** 返回已启用区块的有序列表（用于官网渲染） */
export function getOrderedSections(config: BrandConfig): OrderedSection[] {
  const { sections } = config;
  const list: OrderedSection[] = [
    { key: 'hero', ...sections.hero },
    { key: 'about', ...sections.about },
    { key: 'products', ...sections.products },
    { key: 'benefits', ...sections.benefits },
    { key: 'scenes', ...sections.scenes },
    { key: 'story', ...sections.story },
    { key: 'faq', ...sections.faq },
    { key: 'contact', ...sections.contact },
  ];
  return list.filter((s) => s.enabled).sort((a, b) => a.order - b.order);
}

/** 返回导航中应显示的项（启用且有 href） */
export function getVisibleNavItems(config: BrandConfig) {
  return config.navigation.filter((n) => n.enabled && n.href && n.label);
}

/** 返回已启用的产品（按 order 排序） */
export function getVisibleProducts(config: BrandConfig) {
  return config.products
    .filter((p) => p.enabled)
    .sort((a, b) => a.order - b.order);
}
