import type { Cta } from '@/lib/brand-schema';
import { isExternalUrl } from '@/lib/asset-url';

interface CtaLinkProps {
  cta: Cta;
  className?: string;
  /** 覆盖 variant 样式类 */
  variantClass?: string;
  /** 用于深色/图片背景上：浅色按钮 */
  dark?: boolean;
}

/** 渲染 CTA：空 href 时返回 null（按钮自动隐藏） */
export function CtaLink({ cta, className = '', variantClass, dark = false }: CtaLinkProps) {
  if (!cta.href || !cta.label) return null;
  const external = cta.external || isExternalUrl(cta.href);

  // 深色背景上的按钮：实心=白底深字，描边/幽灵=白边白字
  const darkVariants: Record<Cta['variant'], string> = {
    solid: 'bg-white text-neutral-900 hover:bg-white/90',
    outline: 'border border-white/80 text-white hover:bg-white/15',
    ghost: 'text-white hover:bg-white/15',
  };

  let variant: string;
  if (variantClass) variant = variantClass;
  else if (dark) variant = darkVariants[cta.variant];
  else variant = `btn-${cta.variant}`;

  return (
    <a
      href={cta.href}
      className={`btn-brand ${variant} ${className}`}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
    >
      {cta.label}
    </a>
  );
}
