import type { BrandConfig } from './brand-schema';
import { SCHEMA_VERSION } from './brand-schema';
import { THEME_PRESETS } from './themes';

let idCounter = 0;
/** 生成稳定的短 id（编辑器内新增项使用） */
export function genId(prefix = 'id'): string {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${idCounter.toString(36)}`;
}

/** 空媒体槽位 */
export function emptyMediaSlot() {
  return { images: [], carousel: false, autoplay: false, interval: 4000 };
}

/**
 * 创建一份默认（空白模板）品牌配置。
 * 用于"新建品牌"和"恢复模板默认值"。
 */
export function createDefaultConfig(slug: string, name: string): BrandConfig {
  const preset = THEME_PRESETS[0];
  return {
    schemaVersion: SCHEMA_VERSION,
    brand: {
      slug,
      name,
      logo: { src: '', alt: name, position: 'center' },
      tagline: '',
      description: '',
      region: '',
    },
    theme: {
      preset: preset.name,
      colors: { ...preset.colors },
      fontHeading: preset.fontHeading,
      fontBody: preset.fontBody,
      radius: preset.radius,
      buttonStyle: preset.buttonStyle,
      maxWidth: 1200,
      sectionGap: 96,
      imageRadius: preset.imageRadius,
    },
    navigation: [
      { id: genId('nav'), label: '产品', href: '#products', enabled: true },
      { id: genId('nav'), label: '卖点', href: '#benefits', enabled: true },
      { id: genId('nav'), label: '场景', href: '#scenes', enabled: true },
      { id: genId('nav'), label: '故事', href: '#story', enabled: false },
      { id: genId('nav'), label: '常见问题', href: '#faq', enabled: false },
    ],
    seo: {
      title: name,
      description: '',
      shareImage: { src: '', alt: '', position: 'center' },
      favicon: { src: '', alt: '', position: 'center' },
      canonical: '',
    },
    sections: {
      hero: {
        id: 'hero',
        enabled: true,
        order: 10,
        eyebrow: '',
        title: '',
        body: '',
        image: emptyMediaSlot(),
        cta: { label: '了解产品', href: '#products', external: false, variant: 'solid' },
        ctaSecondary: { label: '', href: '', external: false, variant: 'outline' },
        layout: 'image-right',
        mediaOrder: 'last',
      },
      about: {
        id: 'about',
        enabled: true,
        order: 20,
        eyebrow: '关于我们',
        title: '',
        body: '',
        image: emptyMediaSlot(),
        mediaOrder: 'last',
      },
      products: {
        id: 'products',
        enabled: true,
        order: 25,
        eyebrow: '核心产品',
        title: '每一件，都值得认真对待',
      },
      benefits: {
        id: 'benefits',
        enabled: true,
        order: 30,
        title: '为什么选择我们',
        items: [],
      },
      scenes: {
        id: 'scenes',
        enabled: true,
        order: 40,
        eyebrow: '',
        title: '',
        items: [],
      },
      story: {
        id: 'story',
        enabled: false,
        order: 50,
        eyebrow: '品牌故事',
        title: '',
        body: '',
        image: emptyMediaSlot(),
        mediaOrder: 'last',
        values: [],
      },
      faq: {
        id: 'faq',
        enabled: false,
        order: 80,
        title: '常见问题',
        items: [],
      },
      contact: {
        id: 'contact',
        enabled: true,
        order: 90,
        eyebrow: '',
        title: '想了解更多？',
        body: '',
        cta: { label: '联系我们', href: '#footer', external: false, variant: 'solid' },
      },
    },
    products: [],
    links: {
      purchase: '',
      purchaseLabel: '前往购买',
      socialTitle: '关注我们',
      contactTitle: '联系',
      socialLinks: [],
      instagram: '',
      xiaohongshu: '',
      weibo: '',
      wechat: '',
      email: '',
      phone: '',
      privacy: '',
      terms: '',
    },
  };
}

/** 深拷贝配置（用于复制品牌、撤销等） */
export function cloneConfig(config: BrandConfig): BrandConfig {
  return JSON.parse(JSON.stringify(config)) as BrandConfig;
}
