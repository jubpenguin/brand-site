/**
 * 生成 Demo 品牌的 SVG 占位图片。
 * 运行：tsx scripts/generate-placeholder-assets.ts
 * 这些是清晰标注的占位图，替换品牌时在编辑器中上传真实图片即可。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '../brands/demo-brand/assets');

const C = {
  primary: '#234B3A',
  accent: '#C9D6C4',
  bg: '#FAF8F4',
  cream: '#F0EBE0',
  muted: '#6B6F6C',
  white: '#FFFFFF',
  border: '#E5E2DB',
};

function svg(w: number, h: number, inner: string, opts: { rounded?: boolean } = {}): string {
  const r = opts.rounded ? 24 : 0;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${C.bg}" rx="${r}"/>
  ${inner}
</svg>`;
}

function demoTag(x: number, y: number): string {
  return `<g>
    <rect x="${x}" y="${y}" width="72" height="22" rx="11" fill="${C.primary}" opacity="0.85"/>
    <text x="${x + 36}" y="${y + 15}" font-family="system-ui,sans-serif" font-size="11" font-weight="600" fill="${C.white}" text-anchor="middle" letter-spacing="1">DEMO</text>
  </g>`;
}

// Logo —— 简洁的字母 M 字标
function logo(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="40" viewBox="0 0 160 40">
  <text x="0" y="30" font-family="Georgia,serif" font-size="28" font-weight="500" fill="${C.primary}" letter-spacing="-0.5">Marlow</text>
</svg>`;
}

// Favicon
function favicon(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="${C.primary}"/>
  <text x="32" y="44" font-family="Georgia,serif" font-size="34" font-weight="500" fill="${C.white}" text-anchor="middle">M</text>
</svg>`;
}

// Hero —— 抽象生活方式构图：柔和色块 + 圆形（暗示产品/植物）
function hero(): string {
  return svg(900, 1120, `
  <rect x="0" y="0" width="900" height="1120" fill="${C.cream}"/>
  <circle cx="620" cy="380" r="280" fill="${C.accent}" opacity="0.55"/>
  <circle cx="320" cy="780" r="200" fill="${C.primary}" opacity="0.10"/>
  <rect x="340" y="440" width="220" height="360" rx="28" fill="${C.white}" stroke="${C.primary}" stroke-width="2" opacity="0.9"/>
  <rect x="400" y="500" width="100" height="16" rx="8" fill="${C.primary}" opacity="0.25"/>
  <rect x="400" y="540" width="70" height="10" rx="5" fill="${C.muted}" opacity="0.3"/>
  <circle cx="450" cy="680" r="50" fill="${C.accent}"/>
  <ellipse cx="450" cy="640" rx="26" ry="34" fill="${C.primary}" opacity="0.8"/>
  <text x="450" y="900" font-family="Georgia,serif" font-size="22" fill="${C.muted}" text-anchor="middle" opacity="0.6">占位图 · Placeholder</text>
  ${demoTag(40, 40)}
`);
}

// About —— 横向构图
function about(): string {
  return svg(1000, 750, `
  <rect x="0" y="0" width="1000" height="750" fill="${C.accent}" opacity="0.35"/>
  <circle cx="780" cy="200" r="160" fill="${C.white}" opacity="0.6"/>
  <circle cx="220" cy="580" r="200" fill="${C.primary}" opacity="0.08"/>
  <path d="M500 280 Q560 220 620 280 T740 280" stroke="${C.primary}" stroke-width="3" fill="none" opacity="0.4"/>
  <circle cx="500" cy="280" r="8" fill="${C.primary}" opacity="0.5"/>
  <circle cx="620" cy="280" r="8" fill="${C.primary}" opacity="0.5"/>
  <circle cx="740" cy="280" r="8" fill="${C.primary}" opacity="0.5"/>
  <text x="500" y="480" font-family="Georgia,serif" font-size="24" fill="${C.muted}" text-anchor="middle" opacity="0.6">占位图 · Placeholder</text>
  ${demoTag(40, 40)}
`);
}

// 产品图 —— 白底产品占位（contain 友好）
function product(label: string, accent: string): string {
  return svg(800, 800, `
  <rect x="0" y="0" width="800" height="800" fill="${C.white}"/>
  <rect x="260" y="180" width="280" height="440" rx="20" fill="${C.bg}" stroke="${C.border}" stroke-width="2"/>
  <rect x="310" y="240" width="180" height="14" rx="7" fill="${accent}"/>
  <rect x="310" y="270" width="120" height="10" rx="5" fill="${C.muted}" opacity="0.3"/>
  <circle cx="400" cy="440" r="70" fill="${accent}" opacity="0.3"/>
  <ellipse cx="400" cy="420" rx="36" ry="48" fill="${C.primary}" opacity="0.75"/>
  <rect x="310" y="540" width="180" height="8" rx="4" fill="${C.muted}" opacity="0.25"/>
  <rect x="310" y="558" width="140" height="8" rx="4" fill="${C.muted}" opacity="0.2"/>
  <text x="400" y="680" font-family="system-ui,sans-serif" font-size="16" fill="${C.muted}" text-anchor="middle" opacity="0.7">${label}（Demo）</text>
  ${demoTag(30, 30)}
`);
}

// 场景图 —— 竖版生活方式占位
function scene(label: string, variant: number): string {
  const palettes = [
    { bg: C.cream, a: C.accent, b: C.primary },
    { bg: '#E8EDE8', a: C.primary, b: C.accent },
    { bg: '#F2EDE6', a: '#D4C5B0', b: C.primary },
  ];
  const p = palettes[variant % palettes.length];
  return svg(700, 875, `
  <rect x="0" y="0" width="700" height="875" fill="${p.bg}"/>
  <circle cx="${variant === 1 ? 180 : 520}" cy="260" r="180" fill="${p.a}" opacity="0.5"/>
  <rect x="${variant === 2 ? 120 : 380}" y="420" width="200" height="200" rx="${variant === 1 ? 100 : 24}" fill="${p.b}" opacity="0.12"/>
  <line x1="80" y1="700" x2="620" y2="700" stroke="${p.b}" stroke-width="2" opacity="0.2"/>
  <text x="350" y="760" font-family="Georgia,serif" font-size="20" fill="${C.muted}" text-anchor="middle" opacity="0.6">${label} · Demo</text>
  ${demoTag(30, 30)}
`);
}

// Story
function story(): string {
  return svg(900, 1100, `
  <rect x="0" y="0" width="900" height="1100" fill="${C.primary}" opacity="0.06"/>
  <rect x="120" y="160" width="660" height="780" rx="12" fill="none" stroke="${C.primary}" stroke-width="1.5" opacity="0.3"/>
  <circle cx="450" cy="420" r="120" fill="${C.accent}" opacity="0.6"/>
  <circle cx="450" cy="420" r="70" fill="${C.white}" opacity="0.5"/>
  <rect x="300" y="620" width="300" height="12" rx="6" fill="${C.primary}" opacity="0.3"/>
  <rect x="340" y="650" width="220" height="10" rx="5" fill="${C.muted}" opacity="0.25"/>
  <rect x="380" y="680" width="140" height="10" rx="5" fill="${C.muted}" opacity="0.2"/>
  <text x="450" y="860" font-family="Georgia,serif" font-size="22" fill="${C.muted}" text-anchor="middle" opacity="0.6">品牌故事 · Placeholder</text>
  ${demoTag(40, 40)}
`);
}

// OG share image
function og(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${C.bg}"/>
  <circle cx="980" cy="180" r="220" fill="${C.accent}" opacity="0.5"/>
  <circle cx="160" cy="520" r="160" fill="${C.primary}" opacity="0.08"/>
  <text x="80" y="320" font-family="Georgia,serif" font-size="84" font-weight="500" fill="${C.primary}" letter-spacing="-1">Marlow</text>
  <text x="84" y="380" font-family="system-ui,sans-serif" font-size="28" fill="${C.muted}">日常护理，认真对待。（Demo 示例品牌）</text>
  <rect x="84" y="430" width="120" height="32" rx="16" fill="${C.primary}" opacity="0.85"/>
  <text x="144" y="451" font-family="system-ui,sans-serif" font-size="14" font-weight="600" fill="${C.white}" text-anchor="middle" letter-spacing="2">DEMO</text>
</svg>`;
}

const files: Record<string, string> = {
  'logo.svg': logo(),
  'favicon.svg': favicon(),
  'hero.svg': hero(),
  'about.svg': about(),
  'product-1.svg': product('Daily Cleanser', C.accent),
  'product-2.svg': product('Soft Mist', '#D4C5B0'),
  'scene-1.svg': scene('清晨', 0),
  'scene-2.svg': scene('工作间隙', 1),
  'scene-3.svg': scene('夜晚', 2),
  'story.svg': story(),
  'og.svg': og(),
};

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
for (const [name, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(OUT, name), content, 'utf-8');
  console.log(`  ✓ ${name}`);
}
console.log(`\n生成了 ${Object.keys(files).length} 个占位图到 ${OUT}`);
