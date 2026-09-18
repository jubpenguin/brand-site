import type { BrandConfig } from './brand-schema';
import { SCHEMA_VERSION, parseBrandConfig } from './brand-schema';
import { createDefaultConfig } from './brand-defaults';

/**
 * 配置迁移：旧版本配置升级到当前 schemaVersion。
 * 新增字段使用默认值填充，不丢弃未知字段。
 */

interface Migration {
  from: string;
  to: string;
  migrate: (config: Record<string, unknown>) => Record<string, unknown>;
}

const migrations: Migration[] = [
  // 未来在此添加迁移，例如：
  // { from: '1.0', to: '1.1', migrate: (c) => ({ ...c, sections: { ...c.sections, newsletter: {...} } }) },
];

/**
 * 将任意版本的配置迁移到当前版本并校验。
 * 策略：先尝试用当前 schema 直接解析（Zod 会为缺失字段填默认值）；
 * 如果解析失败，再逐步运行迁移函数后重试。
 */
export function migrateConfig(input: unknown): {
  success: true;
  data: BrandConfig;
  migratedFrom?: string;
} | {
  success: false;
  errors: string[];
} {
  if (typeof input !== 'object' || input === null) {
    return { success: false, errors: ['配置文件不是有效的 JSON 对象'] };
  }

  let raw = input as Record<string, unknown>;
  const originalVersion = typeof raw.schemaVersion === 'string' ? raw.schemaVersion : 'unknown';

  // 直接尝试解析（Zod 默认值会补齐新增字段）
  let parsed = parseBrandConfig(raw);
  if (parsed.success) {
    return {
      success: true,
      data: parsed.data,
      ...(originalVersion !== SCHEMA_VERSION ? { migratedFrom: originalVersion } : {}),
    };
  }

  // 逐步迁移
  const maxRounds = migrations.length + 1;
  for (let i = 0; i < maxRounds; i += 1) {
    const currentVersion = typeof raw.schemaVersion === 'string' ? raw.schemaVersion : 'unknown';
    if (currentVersion === SCHEMA_VERSION) break;
    const migration = migrations.find((m) => m.from === currentVersion);
    if (!migration) {
      // 没有对应迁移：用默认配置做基底，浅合并保留已知顶层字段
      const fallback = createDefaultConfig(
        typeof raw.brand === 'object' && raw.brand && typeof (raw.brand as Record<string, unknown>).slug === 'string'
          ? ((raw.brand as Record<string, unknown>).slug as string)
          : 'imported-brand',
        typeof raw.brand === 'object' && raw.brand && typeof (raw.brand as Record<string, unknown>).name === 'string'
          ? ((raw.brand as Record<string, unknown>).name as string)
          : 'Imported Brand',
      );
      const merged = { ...fallback, ...raw, schemaVersion: SCHEMA_VERSION };
      parsed = parseBrandConfig(merged);
      if (parsed.success) {
        return { success: true, data: parsed.data, migratedFrom: originalVersion };
      }
      return { success: false, errors: [`无法从版本 ${currentVersion} 迁移：${parsed.success ? '' : parsed.errors.join('; ')}`] };
    }
    raw = migration.migrate(raw);
    raw.schemaVersion = migration.to;
  }

  parsed = parseBrandConfig(raw);
  if (parsed.success) {
    return { success: true, data: parsed.data, migratedFrom: originalVersion };
  }
  return { success: false, errors: parsed.errors };
}
