/**
 * 静态网站导出 CLI。
 * 用法：npm run export -- --brand=demo-brand
 * 不传 --brand 则导出当前激活品牌。
 */
import { exportSite } from '../lib/export-site';
import { getActiveBrandSlug, listBrands } from '../lib/brand-loader';

function getArg(name: string): string | undefined {
  const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
  return arg ? arg.split('=').slice(1).join('=') : undefined;
}

const slug = getArg('brand') || getActiveBrandSlug();

if (!slug) {
  console.error('未指定品牌，且未找到激活品牌。');
  console.error('可用品牌：');
  for (const b of listBrands()) console.error(`  - ${b.slug} (${b.name})`);
  process.exit(1);
}

console.log(`\n开始导出品牌：${slug}\n`);
const result = exportSite(slug);

if (result.warnings.length > 0) {
  console.log('\n警告：');
  for (const w of result.warnings) console.log(`  ⚠ ${w}`);
}

if (!result.success) {
  console.error('\n导出失败：');
  for (const e of result.errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}

console.log(`\n✓ 导出成功！`);
console.log(`  产物目录：${result.outDir}`);
console.log(`  本地预览：npx serve out  或  python -m http.server -d out`);
console.log(`  可直接上传 out/ 目录到任意静态托管服务。\n`);
