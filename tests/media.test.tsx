import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { parseBrandConfig, normalizeLegacyShape } from '../lib/brand-schema';
import { createDefaultConfig } from '../lib/brand-defaults';
import { MediaGallery } from '../components/site/MediaGallery';
import { Hero } from '../components/site/Hero';
import type { MediaSlot, HeroSection } from '../lib/brand-schema';

function slot(images: { src: string }[], extra: Partial<MediaSlot> = {}): MediaSlot {
  return {
    images: images.map((i, idx) => ({ src: i.src, alt: `img${idx}`, position: 'center' })),
    carousel: false,
    autoplay: false,
    interval: 4000,
    ...extra,
  };
}

describe('旧版单图字段迁移', () => {
  it('把 hero/about/story 的 {src,alt,position} 转为媒体槽位', () => {
    const legacy = createDefaultConfig('old', 'Old');
    // 构造旧形态
    const raw = JSON.parse(JSON.stringify(legacy));
    raw.sections.hero.image = { src: 'assets/hero.jpg', alt: 'h', position: 'center' };
    raw.sections.about.image = { src: 'assets/about.jpg', alt: 'a', position: 'top' };
    raw.sections.story.image = { src: 'assets/story.jpg', alt: 's', position: 'center' };
    raw.sections.scenes.items = [
      { id: 'sc1', image: { src: 'assets/scene.jpg', alt: '', position: 'center' }, title: 't', body: 'b' },
    ];

    const result = parseBrandConfig(raw);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sections.hero.image.images).toHaveLength(1);
      expect(result.data.sections.hero.image.images[0].src).toBe('assets/hero.jpg');
      expect(result.data.sections.about.image.images[0].src).toBe('assets/about.jpg');
      expect(result.data.sections.story.image.images[0].src).toBe('assets/story.jpg');
      expect(result.data.sections.scenes.items[0].image.images[0].src).toBe('assets/scene.jpg');
      // 新字段补齐默认值
      expect(result.data.sections.hero.image.carousel).toBe(false);
    }
  });

  it('已经是新媒体槽位时保持不变（幂等）', () => {
    const already = {
      images: [{ src: 'a.jpg', alt: '', position: 'center' }],
      carousel: true,
      autoplay: true,
      interval: 3000,
    };
    const out = normalizeLegacyShape({ sections: { hero: { image: already } } }) as {
      sections: { hero: { image: typeof already } };
    };
    expect(out.sections.hero.image).toEqual(already);
  });
});

describe('MediaGallery', () => {
  it('无图时渲染占位', () => {
    render(<MediaGallery slot={slot([])} imgClassName="aspect-square" emptyHint="暂无" />);
    expect(screen.getByText('暂无')).toBeInTheDocument();
  });

  it('单张图片静态渲染，不显示轮播控件', () => {
    const { container } = render(<MediaGallery slot={slot([{ src: 'a.jpg' }])} imgClassName="aspect-square" />);
    expect(container.querySelectorAll('img')).toHaveLength(1);
    expect(screen.queryByRole('button', { name: /第 1 张/ })).toBeNull();
  });

  it('多张但未开启轮播时只显示第一张', () => {
    const { container } = render(
      <MediaGallery slot={slot([{ src: 'a.jpg' }, { src: 'b.jpg' }])} imgClassName="aspect-square" />,
    );
    expect(container.querySelectorAll('img')).toHaveLength(1);
  });

  it('开启轮播后渲染全部图片与指示点，点击可切换', () => {
    render(
      <MediaGallery
        slot={slot([{ src: 'a.jpg' }, { src: 'b.jpg' }, { src: 'c.jpg' }], { carousel: true })}
        imgClassName="aspect-square"
      />,
    );
    expect(screen.getAllByRole('img')).toHaveLength(3);
    const dot2 = screen.getByRole('button', { name: '第 2 张' });
    fireEvent.click(dot2);
    expect(dot2).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('button', { name: '下一张' })).toBeInTheDocument();
  });
});

describe('Hero 布局', () => {
  function makeHero(partial: Partial<HeroSection>): HeroSection {
    const base = createDefaultConfig('a', 'A').sections.hero as HeroSection;
    return {
      ...base,
      title: '标题',
      image: slot([{ src: 'hero.jpg' }]),
      ...partial,
    };
  }

  it('fullbleed 布局渲染全屏容器与白色标题', () => {
    const { container } = render(<Hero section={makeHero({ layout: 'fullbleed' })} />);
    const section = container.querySelector('#hero');
    expect(section?.className).toContain('min-h-[100svh]');
    expect(screen.getByText('标题')).toHaveClass('text-white');
  });

  it('centered 布局 mediaOrder=first 时图片在文字之前', () => {
    const { container } = render(
      <Hero section={makeHero({ layout: 'centered', mediaOrder: 'first' })} />,
    );
    const inner = container.querySelector('#hero .flex-col');
    expect(inner?.querySelector('img')).not.toBeNull();
    // 第一个元素即图片容器
    const firstChild = inner?.firstElementChild;
    expect(firstChild?.querySelector('img')).not.toBeNull();
  });

  it('centered 布局 mediaOrder=last 时文字在图片之前', () => {
    const { container } = render(
      <Hero section={makeHero({ layout: 'centered', mediaOrder: 'last' })} />,
    );
    const inner = container.querySelector('#hero .flex-col');
    const firstChild = inner?.firstElementChild;
    // 第一个元素是文字块（含标题），不含 img
    expect(firstChild?.querySelector('img')).toBeNull();
    expect(firstChild?.textContent).toContain('标题');
  });
});
