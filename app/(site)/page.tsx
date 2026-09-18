import { getBrandForRender } from '@/lib/brand-server';
import { SitePreview } from '@/components/site/SitePreview';

export default function SitePage() {
  const { config } = getBrandForRender();
  return <SitePreview config={config} />;
}
