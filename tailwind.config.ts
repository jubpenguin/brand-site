import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // 主题色通过 CSS Variables 注入，组件不硬编码颜色
        brand: {
          primary: 'var(--brand-primary)',
          secondary: 'var(--brand-secondary)',
          accent: 'var(--brand-accent)',
          background: 'var(--brand-background)',
          surface: 'var(--brand-surface)',
          text: 'var(--brand-text)',
          muted: 'var(--brand-muted)',
          border: 'var(--brand-border)',
        },
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        brand: 'var(--brand-radius)',
        'brand-sm': 'var(--brand-radius-sm)',
        'brand-lg': 'var(--brand-radius-lg)',
      },
      maxWidth: {
        content: 'var(--brand-max-width)',
      },
      spacing: {
        section: 'var(--brand-section-gap)',
      },
      transitionTimingFunction: {
        brand: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
