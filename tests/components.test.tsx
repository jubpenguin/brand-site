import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CtaLink } from '../components/site/CtaLink';
import { Benefits } from '../components/site/Benefits';
import { Contact } from '../components/site/Contact';
import { createDefaultConfig } from '../lib/brand-defaults';
import type { BenefitsSection, ContactSection } from '../lib/brand-schema';

describe('CtaLink', () => {
  it('空 href 时不渲染', () => {
    const { container } = render(<CtaLink cta={{ label: '点击', href: '', external: false, variant: 'solid' }} />);
    expect(container.firstChild).toBeNull();
  });

  it('空 label 时不渲染', () => {
    const { container } = render(<CtaLink cta={{ label: '', href: '#x', external: false, variant: 'solid' }} />);
    expect(container.firstChild).toBeNull();
  });

  it('外部链接添加 target=_blank 和 rel', () => {
    render(<CtaLink cta={{ label: '购买', href: 'https://example.com', external: false, variant: 'solid' }} />);
    const link = screen.getByRole('link', { name: '购买' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('内部锚点不打开新窗口', () => {
    render(<CtaLink cta={{ label: '了解', href: '#products', external: false, variant: 'solid' }} />);
    const link = screen.getByRole('link', { name: '了解' });
    expect(link).not.toHaveAttribute('target');
});

describe('Benefits', () => {
  it('没有卖点时不渲染区块', () => {
    const empty = createDefaultConfig('a', 'A').sections.benefits as BenefitsSection;
    const { container } = render(<Benefits section={empty} />);
    expect(container.firstChild).toBeNull();
  });

  it('渲染卖点标题和内容', () => {
    const section: BenefitsSection = {
      id: 'benefits',
      enabled: true,
      order: 30,
      title: '为什么选择我们',
      items: [
        { id: '1', icon: '🌿', title: '天然', body: '成分天然' },
        { id: '2', icon: '', title: '安全', body: '温和不刺激' },
      ],
    };
    render(<Benefits section={section} />);
    expect(screen.getByText('为什么选择我们')).toBeInTheDocument();
    expect(screen.getByText('天然')).toBeInTheDocument();
    expect(screen.getByText('成分天然')).toBeInTheDocument();
  });
});

describe('Contact', () => {
  it('内容全空时不渲染', () => {
    const empty = createDefaultConfig('a', 'A').sections.contact as ContactSection;
    empty.title = '';
    empty.body = '';
    empty.cta = { label: '', href: '', external: false, variant: 'solid' };
    const { container } = render(<Contact section={empty} />);
    expect(container.firstChild).toBeNull();
  });
  });

  it('显示邮箱与电话链接', () => {
    const cfg = createDefaultConfig('a', 'A');
    cfg.links.email = 'hello@brand.com';
    cfg.links.phone = '400-000-0000';
    const section = cfg.sections.contact as ContactSection;
    render(<Contact section={section} links={cfg.links} />);
    const mail = screen.getByText('hello@brand.com');
    expect(mail.closest('a')).toHaveAttribute('href', 'mailto:hello@brand.com');
    const tel = screen.getByText('400-000-0000');
    expect(tel.closest('a')).toHaveAttribute('href', 'tel:4000000000');
  });
});
