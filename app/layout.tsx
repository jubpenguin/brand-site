import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '品牌官网',
  description: '快消品品牌官网通用模板',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
