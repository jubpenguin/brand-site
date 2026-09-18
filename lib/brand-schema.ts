import { z } from 'zod';

/**
 * 品牌配置 Schema（Zod）
 * 所有页面内容都必须从 BrandConfig 读取，组件中不允许硬编码品牌信息。
 */

export const SCHEMA_VERSION = '1.0';

// ---------- 基础对象 ----------

/** 图片资源：路径相对于品牌目录，例如 assets/hero.jpg */
export const imageAssetSchema = z.object({
  src: z.string().default(''),
  alt: z.string().default(''),
  /** 焦点位置，对应 object-position，例如 "center center" */
  position: z.string().default('center'),
});
export type ImageAsset = z.infer<typeof imageAssetSchema>;

/**
 * 媒体槽位：一个模块的图片区域。
 * - images 为 0/1 张时静态展示；
 * - 多张且 carousel=true 时轮播，否则只展示第一张。
 */
export const mediaSlotSchema = z.object({
  images: z.array(imageAssetSchema).default([]),
  /** 多张图片时是否轮播 */
  carousel: z.boolean().default(false),
  /** 轮播是否自动播放 */
  autoplay: z.boolean().default(false),
  /** 自动播放间隔（毫秒） */
  interval: z.number().default(4000),
});
export type MediaSlot = z.infer<typeof mediaSlotSchema>;

/** 图文顺序：媒体在前（图在上/左）还是在后（图在下/右） */
export const mediaOrderSchema = z.enum(['first', 'last']).default('first');
export type MediaOrder = z.infer<typeof mediaOrderSchema>;

/** 按钮 / 链接：href 可为内部锚点(#xxx)或外部链接(https://) */
export const ctaSchema = z.object({
  label: z.string().default(''),
  href: z.string().default(''),
  /** 外部链接是否在新窗口打开 */
  external: z.boolean().default(false),
  /** 按钮风格：solid / outline / ghost */
  variant: z.enum(['solid', 'outline', 'ghost']).default('solid'),
});
export type Cta = z.infer<typeof ctaSchema>;

/** 通用模块开关与排序 */
const sectionBase = z.object({
  id: z.string(),
  enabled: z.boolean().default(true),
  order: z.number().default(0),
});

// ---------- 品牌信息 ----------

export const brandInfoSchema = z.object({
  slug: z
    .string()
    .min(1, '品牌标识不能为空')
    .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/, '只能使用小写字母、数字和连字符'),
  name: z.string().min(1, '品牌名称不能为空'),
  logo: imageAssetSchema.default({ src: '', alt: '', position: 'center' }),
  tagline: z.string().default(''),
  description: z.string().default(''),
  region: z.string().default(''),
});
export type BrandInfo = z.infer<typeof brandInfoSchema>;

// ---------- 主题 ----------

export const radiusPresetSchema = z.enum(['small', 'medium', 'large']);
export const buttonStyleSchema = z.enum(['solid', 'outline', 'ghost']);
export const fontPresetSchema = z.enum(['system-sans', 'system-serif', 'rounded']);

export const themeColorsSchema = z.object({
  primary: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, '主色需为 HEX 颜色'),
  secondary: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/).default('#202421'),
  accent: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/).default('#E7B8A4'),
  background: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/).default('#FAF8F4'),
  surface: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/).default('#FFFFFF'),
  text: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/).default('#202421'),
  muted: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/).default('#6B6F6C'),
  border: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/).default('#E5E2DB'),
});
export type ThemeColors = z.infer<typeof themeColorsSchema>;

export const themeSchema = z.object({
  /** 主题预设名称，用于编辑器标识 */
  preset: z.string().default('自然清新'),
  colors: themeColorsSchema,
  fontHeading: fontPresetSchema.default('system-sans'),
  fontBody: fontPresetSchema.default('system-sans'),
  radius: radiusPresetSchema.default('medium'),
  buttonStyle: buttonStyleSchema.default('solid'),
  /** 内容最大宽度（px） */
  maxWidth: z.number().default(1200),
  /** 模块上下间距（px） */
  sectionGap: z.number().default(96),
  /** 图片是否使用大圆角 */
  imageRadius: z.boolean().default(false),
});
export type ThemeConfig = z.infer<typeof themeSchema>;

// ---------- 导航 ----------

export const navItemSchema = z.object({
  id: z.string(),
  label: z.string().default(''),
  href: z.string().default(''),
  enabled: z.boolean().default(true),
});
export type NavItem = z.infer<typeof navItemSchema>;

// ---------- SEO ----------

export const seoSchema = z.object({
  title: z.string().default(''),
  description: z.string().default(''),
  shareImage: imageAssetSchema.default({ src: '', alt: '', position: 'center' }),
  favicon: imageAssetSchema.default({ src: '', alt: '', position: 'center' }),
  canonical: z.string().default(''),
});
export type SeoConfig = z.infer<typeof seoSchema>;

// ---------- 各模块 ----------

export const heroSectionSchema = sectionBase.extend({
  id: z.literal('hero'),
  eyebrow: z.string().default(''),
  title: z.string().default(''),
  body: z.string().default(''),
  image: mediaSlotSchema.default({ images: [], carousel: false, autoplay: false, interval: 4000 }),
  cta: ctaSchema.default({ label: '', href: '', external: false, variant: 'solid' }),
  ctaSecondary: ctaSchema.default({ label: '', href: '', external: false, variant: 'outline' }),
  /** image-right 右图左文；image-left 左图右文；centered 居中堆叠；fullbleed 全屏横图背景 */
  layout: z.enum(['image-right', 'image-left', 'centered', 'fullbleed']).default('image-right'),
  /** centered 布局下图片在文字之前（上）还是之后（下），默认文字在上 */
  mediaOrder: z.enum(['first', 'last']).default('last'),
});
export type HeroSection = z.infer<typeof heroSectionSchema>;

export const aboutSectionSchema = sectionBase.extend({
  id: z.literal('about'),
  eyebrow: z.string().default(''),
  title: z.string().default(''),
  body: z.string().default(''),
  image: mediaSlotSchema.default({ images: [], carousel: false, autoplay: false, interval: 4000 }),
  /** 图片在文字左侧（first）还是右侧（last），默认右侧 */
  mediaOrder: z.enum(['first', 'last']).default('last'),
});
export type AboutSection = z.infer<typeof aboutSectionSchema>;

export const benefitItemSchema = z.object({
  id: z.string(),
  icon: z.string().default(''),
  title: z.string().default(''),
  body: z.string().default(''),
});
export type BenefitItem = z.infer<typeof benefitItemSchema>;

export const benefitsSectionSchema = sectionBase.extend({
  id: z.literal('benefits'),
  title: z.string().default(''),
  items: z.array(benefitItemSchema).default([]),
});
export type BenefitsSection = z.infer<typeof benefitsSectionSchema>;

export const productsSectionSchema = sectionBase.extend({
  id: z.literal('products'),
  eyebrow: z.string().default('核心产品'),
  title: z.string().default(''),
});
export type ProductsSection = z.infer<typeof productsSectionSchema>;

export const sceneItemSchema = z.object({
  id: z.string(),
  image: mediaSlotSchema.default({ images: [], carousel: false, autoplay: false, interval: 4000 }),
  title: z.string().default(''),
  body: z.string().default(''),
});
export type SceneItem = z.infer<typeof sceneItemSchema>;

export const scenesSectionSchema = sectionBase.extend({
  id: z.literal('scenes'),
  eyebrow: z.string().default(''),
  title: z.string().default(''),
  items: z.array(sceneItemSchema).default([]),
});
export type ScenesSection = z.infer<typeof scenesSectionSchema>;

export const storySectionSchema = sectionBase.extend({
  id: z.literal('story'),
  eyebrow: z.string().default(''),
  title: z.string().default(''),
  body: z.string().default(''),
  image: mediaSlotSchema.default({ images: [], carousel: false, autoplay: false, interval: 4000 }),
  /** 图片在文字左侧（first）还是右侧（last），默认右侧 */
  mediaOrder: z.enum(['first', 'last']).default('last'),
  values: z.array(z.object({ id: z.string(), title: z.string(), body: z.string() })).default([]),
});
export type StorySection = z.infer<typeof storySectionSchema>;

export const faqItemSchema = z.object({
  id: z.string(),
  question: z.string().default(''),
  answer: z.string().default(''),
});
export type FaqItem = z.infer<typeof faqItemSchema>;

export const faqSectionSchema = sectionBase.extend({
  id: z.literal('faq'),
  title: z.string().default(''),
  items: z.array(faqItemSchema).default([]),
});
export type FaqSection = z.infer<typeof faqSectionSchema>;

export const contactSectionSchema = sectionBase.extend({
  id: z.literal('contact'),
  eyebrow: z.string().default(''),
  title: z.string().default(''),
  body: z.string().default(''),
  cta: ctaSchema.default({ label: '', href: '', external: false, variant: 'solid' }),
});
export type ContactSection = z.infer<typeof contactSectionSchema>;

export const sectionsSchema = z.object({
  hero: heroSectionSchema,
  about: aboutSectionSchema,
  products: productsSectionSchema,
  benefits: benefitsSectionSchema,
  scenes: scenesSectionSchema,
  story: storySectionSchema,
  faq: faqSectionSchema,
  contact: contactSectionSchema,
});
export type SectionsConfig = z.infer<typeof sectionsSchema>;

// ---------- 产品 ----------

export const productSchema = z.object({
  id: z.string(),
  slug: z.string().min(1, '产品标识不能为空'),
  name: z.string().min(1, '产品名称不能为空'),
  subtitle: z.string().default(''),
  badge: z.string().default(''),
  images: z.array(imageAssetSchema).default([]),
  /** 多张产品图时是否轮播 */
  carousel: z.boolean().default(false),
  autoplay: z.boolean().default(false),
  interval: z.number().default(4000),
  highlights: z.array(z.string()).default([]),
  description: z.string().default(''),
  specifications: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
  usage: z.string().default(''),
  purchaseUrl: z.string().default(''),
  enabled: z.boolean().default(true),
  order: z.number().default(0),
});
export type Product = z.infer<typeof productSchema>;

// ---------- 链接 ----------

/** 自定义社交链接（可新增任意多个平台） */
export const socialLinkSchema = z.object({
  id: z.string(),
  /** 平台名称，如「淘宝店铺」「公众号」 */
  label: z.string().default(''),
  /** 跳转链接 */
  url: z.string().default(''),
});
export type SocialLink = z.infer<typeof socialLinkSchema>;

export const linksSchema = z.object({
  purchase: z.string().default(''),
  purchaseLabel: z.string().default('前往购买'),
  /** 页脚「关注我们」栏标题 */
  socialTitle: z.string().default('关注我们'),
  /** 页脚「联系」栏标题 */
  contactTitle: z.string().default('联系'),
  /** 自定义社交平台列表（可多条，url 为空不显示） */
  socialLinks: z.array(socialLinkSchema).default([]),
  instagram: z.string().default(''),
  xiaohongshu: z.string().default(''),
  weibo: z.string().default(''),
  wechat: z.string().default(''),
  email: z.string().default(''),
  /** 联系电话（联系模块直接显示，可含空格/横线） */
  phone: z.string().default(''),
  privacy: z.string().default(''),
  terms: z.string().default(''),
});
export type LinkConfig = z.infer<typeof linksSchema>;

// ---------- 根配置 ----------

export const brandConfigSchema = z
  .object({
    schemaVersion: z.string().default(SCHEMA_VERSION),
    brand: brandInfoSchema,
    theme: themeSchema,
    navigation: z.array(navItemSchema).default([]),
    seo: seoSchema,
    sections: sectionsSchema,
    products: z.array(productSchema).default([]),
    links: linksSchema,
    /** 预留多语言字段 */
    locales: z.record(z.unknown()).optional(),
  })
  .passthrough();
export type BrandConfig = z.infer<typeof brandConfigSchema>;

// ---------- 旧版本兼容：单图 {src,alt,position} → 媒体槽位 ----------

function isMediaSlot(v: unknown): boolean {
  return typeof v === 'object' && v !== null && Array.isArray((v as { images?: unknown }).images);
}

function toMediaSlot(img: unknown): unknown {
  if (isMediaSlot(img)) return img;
  if (img && typeof img === 'object' && (img as { src?: string }).src) {
    return {
      images: [img],
      carousel: false,
      autoplay: false,
      interval: 4000,
    };
  }
  return { images: [], carousel: false, autoplay: false, interval: 4000 };
}

/**
 * 将旧版本（单图字段）规范化为当前结构。
 * 在 Zod 解析前调用，保证历史 brand.config.json 可平滑升级。
 */
export function normalizeLegacyShape(input: unknown): unknown {
  if (typeof input !== 'object' || input === null) return input;
  const raw = structuredClone(input as Record<string, unknown>);
  const sections = raw.sections as Record<string, unknown> | undefined;
  if (sections && typeof sections === 'object') {
    for (const key of ['hero', 'about', 'story']) {
      const sec = sections[key] as Record<string, unknown> | undefined;
      if (sec && typeof sec === 'object') sec.image = toMediaSlot(sec.image);
    }
    const scenes = sections.scenes as { items?: unknown[] } | undefined;
    if (scenes && Array.isArray(scenes.items)) {
      scenes.items = scenes.items.map((it) => {
        if (it && typeof it === 'object') {
          return { ...(it as Record<string, unknown>), image: toMediaSlot((it as { image?: unknown }).image) };
        }
        return it;
      });
    }
  }
  return raw;
}

/** 安全解析配置：成功返回 data，失败返回格式化的字段错误 */
export function parseBrandConfig(input: unknown): {
  success: true;
  data: BrandConfig;
} | {
  success: false;
  errors: string[];
} {
  const normalized = normalizeLegacyShape(input);
  const result = brandConfigSchema.safeParse(normalized);
  if (result.success) {
    return { success: true, data: result.data as BrandConfig };
  }
  const errors = result.error.issues.map((issue) => {
    const path = issue.path.join('.') || '(root)';
    return `${path}: ${issue.message}`;
  });
  return { success: false, errors };
}
