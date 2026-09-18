import type { ThemeConfig, ThemeColors } from './brand-schema';

/**
 * 三套内置主题预设。
 * 颜色保持中性通用，不写死任何真实品牌的强烈色彩。
 */

export interface ThemePreset {
  name: string;
  description: string;
  colors: ThemeColors;
  fontHeading: ThemeConfig['fontHeading'];
  fontBody: ThemeConfig['fontBody'];
  radius: ThemeConfig['radius'];
  buttonStyle: ThemeConfig['buttonStyle'];
  imageRadius: boolean;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    name: '自然清新',
    description: '深森林绿 + 暖米底，适合天然、食品、个护品牌',
    colors: {
      primary: '#234B3A',
      secondary: '#202421',
      accent: '#C9D6C4',
      background: '#FAF8F4',
      surface: '#FFFFFF',
      text: '#202421',
      muted: '#6B6F6C',
      border: '#E5E2DB',
    },
    fontHeading: 'system-serif',
    fontBody: 'system-sans',
    radius: 'medium',
    buttonStyle: 'solid',
    imageRadius: false,
  },
  {
    name: '柔和精致',
    description: '暖陶土色 + 奶油底，适合美妆、香氛、生活方式品牌',
    colors: {
      primary: '#8A5A44',
      secondary: '#3D3029',
      accent: '#E7B8A4',
      background: '#F7F1EB',
      surface: '#FFFDFB',
      text: '#3D3029',
      muted: '#8C7E76',
      border: '#E8DDD4',
    },
    fontHeading: 'system-serif',
    fontBody: 'system-sans',
    radius: 'large',
    buttonStyle: 'outline',
    imageRadius: true,
  },
  {
    name: '黑白极简',
    description: '纯黑 + 冷白，高对比，适合科技、潮流、极简品牌',
    colors: {
      primary: '#111111',
      secondary: '#111111',
      accent: '#111111',
      background: '#FFFFFF',
      surface: '#F5F5F5',
      text: '#111111',
      muted: '#737373',
      border: '#E5E5E5',
    },
    fontHeading: 'system-sans',
    fontBody: 'system-sans',
    radius: 'small',
    buttonStyle: 'solid',
    imageRadius: false,
  },
];

export function getPresetByName(name: string): ThemePreset {
  return THEME_PRESETS.find((p) => p.name === name) ?? THEME_PRESETS[0];
}

/** 将预设应用到主题配置（保留可能的自定义字段） */
export function applyPreset(theme: ThemeConfig, presetName: string): ThemeConfig {
  const preset = getPresetByName(presetName);
  return {
    ...theme,
    preset: preset.name,
    colors: { ...preset.colors },
    fontHeading: preset.fontHeading,
    fontBody: preset.fontBody,
    radius: preset.radius,
    buttonStyle: preset.buttonStyle,
    imageRadius: preset.imageRadius,
  };
}

// ---------- CSS 变量映射 ----------

const RADIUS_MAP: Record<ThemeConfig['radius'], { sm: string; base: string; lg: string }> = {
  small: { sm: '4px', base: '6px', lg: '10px' },
  medium: { sm: '8px', base: '14px', lg: '22px' },
  large: { sm: '12px', base: '22px', lg: '36px' },
};

const FONT_STACK: Record<ThemeConfig['fontHeading'], string> = {
  'system-sans':
    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
  'system-serif':
    'ui-serif, Georgia, "Times New Roman", "Songti SC", "SimSun", serif',
  rounded:
    'ui-rounded, "SF Pro Rounded", "Hiragino Maru Gothic ProN", "PingFang SC", system-ui, sans-serif',
};

/** 根据主题生成 CSS Custom Properties 字符串 */
export function themeToCssVars(theme: ThemeConfig): Record<string, string> {
  const radii = RADIUS_MAP[theme.radius];
  return {
    '--brand-primary': theme.colors.primary,
    '--brand-secondary': theme.colors.secondary,
    '--brand-accent': theme.colors.accent,
    '--brand-background': theme.colors.background,
    '--brand-surface': theme.colors.surface,
    '--brand-text': theme.colors.text,
    '--brand-muted': theme.colors.muted,
    '--brand-border': theme.colors.border,
    '--font-heading': FONT_STACK[theme.fontHeading],
    '--font-body': FONT_STACK[theme.fontBody],
    '--brand-radius': radii.base,
    '--brand-radius-sm': radii.sm,
    '--brand-radius-lg': radii.lg,
    '--brand-max-width': `${theme.maxWidth}px`,
    '--brand-section-gap': `${theme.sectionGap}px`,
  };
}
