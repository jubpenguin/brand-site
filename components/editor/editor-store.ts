'use client';

import { create } from 'zustand';
import type { BrandConfig } from '@/lib/brand-schema';
import { createDefaultConfig } from '@/lib/brand-defaults';
import { themeToCssVars } from '@/lib/themes';
import { compressImageFile } from './imageCompress';

export type DeviceMode = 'desktop' | 'tablet' | 'mobile';

interface BrandSummary {
  slug: string;
  name: string;
  tagline: string;
}

interface EditorState {
  // 数据
  config: BrandConfig;
  savedConfig: BrandConfig;
  brands: BrandSummary[];
  activeSlug: string;
  // UI 状态
  loading: boolean;
  saving: boolean;
  dirty: boolean;
  device: DeviceMode;
  activeSection: string;
  message: { type: 'success' | 'error' | 'info'; text: string } | null;
  // 品牌操作
  loadBrands: () => Promise<void>;
  loadBrand: (slug: string) => Promise<void>;
  save: () => Promise<boolean>;
  createBrand: (name: string) => Promise<void>;
  duplicateBrand: (name: string) => Promise<void>;
  renameBrand: (name: string, slug?: string) => Promise<void>;
  deleteBrand: () => Promise<void>;
  // 编辑操作
  patch: (producer: (draft: BrandConfig) => void) => void;
  setDevice: (d: DeviceMode) => void;
  setActiveSection: (s: string) => void;
  setMessage: (m: EditorState['message']) => void;
  // 图片
  uploadImage: (file: File) => Promise<string | null>;
  // 导入导出
  importConfig: (file: File) => Promise<boolean>;
  exportConfig: () => void;
  exportSite: () => Promise<{ success: boolean; message: string }>;
  resetToSaved: () => void;
  resetToTemplate: () => void;
}

async function api<T = unknown>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = data.error || data.errors?.join('; ') || `请求失败 (${res.status})`;
    throw new Error(msg);
  }
  return data as T;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  config: createDefaultConfig('brand', '品牌'),
  savedConfig: createDefaultConfig('brand', '品牌'),
  brands: [],
  activeSlug: '',
  loading: true,
  saving: false,
  dirty: false,
  device: 'desktop',
  activeSection: 'brand',
  message: null,

  loadBrands: async () => {
    try {
      const data = await api<{ brands: BrandSummary[]; active: string }>('/api/brands');
      set({ brands: data.brands, activeSlug: data.active });
      if (data.active) await get().loadBrand(data.active);
    } catch (e) {
      set({ message: { type: 'error', text: `加载品牌列表失败：${(e as Error).message}` } });
    } finally {
      set({ loading: false });
    }
  },

  loadBrand: async (slug: string) => {
    set({ loading: true });
    try {
      const data = await api<{ config: BrandConfig; migratedFrom?: string }>(
        `/api/brands/${encodeURIComponent(slug)}`,
      );
      set({
        config: data.config,
        savedConfig: JSON.parse(JSON.stringify(data.config)),
        activeSlug: slug,
        dirty: false,
        loading: false,
      });
      if (data.migratedFrom) {
        set({
          message: {
            type: 'info',
            text: `配置已从旧版本 ${data.migratedFrom} 迁移，请检查后保存。`,
          },
        });
      }
    } catch (e) {
      set({
        loading: false,
        message: { type: 'error', text: `加载品牌失败：${(e as Error).message}` },
      });
    }
  },

  save: async () => {
    const { config, activeSlug } = get();
    set({ saving: true });
    try {
      await api(`/api/brands/${encodeURIComponent(activeSlug)}/save`, {
        method: 'POST',
        body: JSON.stringify({ config }),
      });
      set({
        savedConfig: JSON.parse(JSON.stringify(config)),
        dirty: false,
        saving: false,
        message: { type: 'success', text: '已保存' },
      });
      setTimeout(() => {
        if (get().message?.text === '已保存') set({ message: null });
      }, 2000);
      return true;
    } catch (e) {
      set({
        saving: false,
        message: { type: 'error', text: `保存失败：${(e as Error).message}` },
      });
      return false;
    }
  },

  createBrand: async (name: string) => {
    try {
      const data = await api<{ slug: string }>('/api/brands', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      await get().loadBrands();
      await get().loadBrand(data.slug);
      set({ message: { type: 'success', text: `已创建品牌「${name}」` } });
    } catch (e) {
      set({ message: { type: 'error', text: `创建失败：${(e as Error).message}` } });
    }
  },

  duplicateBrand: async (name: string) => {
    const { activeSlug } = get();
    try {
      const data = await api<{ slug: string }>(
        `/api/brands/${encodeURIComponent(activeSlug)}/duplicate`,
        { method: 'POST', body: JSON.stringify({ name }) },
      );
      await get().loadBrands();
      await get().loadBrand(data.slug);
      set({ message: { type: 'success', text: `已复制为「${name}」` } });
    } catch (e) {
      set({ message: { type: 'error', text: `复制失败：${(e as Error).message}` } });
    }
  },

  renameBrand: async (name: string, slug?: string) => {
    const { activeSlug } = get();
    try {
      const data = await api<{ slug: string }>(
        `/api/brands/${encodeURIComponent(activeSlug)}/rename`,
        { method: 'POST', body: JSON.stringify({ name, slug }) },
      );
      await get().loadBrands();
      await get().loadBrand(data.slug);
      set({ message: { type: 'success', text: '已重命名' } });
    } catch (e) {
      set({ message: { type: 'error', text: `重命名失败：${(e as Error).message}` } });
    }
  },

  deleteBrand: async () => {
    const { activeSlug } = get();
    try {
      await api(`/api/brands/${encodeURIComponent(activeSlug)}`, { method: 'DELETE' });
      set({ message: { type: 'success', text: '品牌已删除' } });
      await get().loadBrands();
      const first = get().brands[0];
      if (first) await get().loadBrand(first.slug);
    } catch (e) {
      set({ message: { type: 'error', text: `删除失败：${(e as Error).message}` } });
    }
  },

  patch: (producer) => {
    const draft: BrandConfig = JSON.parse(JSON.stringify(get().config));
    producer(draft);
    set({ config: draft, dirty: true });
  },

  setDevice: (d) => set({ device: d }),
  setActiveSection: (s) => set({ activeSection: s }),
  setMessage: (m) => set({ message: m }),

  uploadImage: async (file: File) => {
    const { activeSlug } = get();
    try {
      // 上传前自动压缩（大图缩尺寸、摄影 PNG 转 JPEG）
      file = await compressImageFile(file);
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const data = await api<{ path: string }>(
        `/api/brands/${encodeURIComponent(activeSlug)}/images`,
        {
          method: 'POST',
          body: JSON.stringify({ fileName: file.name, dataUrl }),
        },
      );
      set({ message: { type: 'success', text: '图片已上传' } });
      setTimeout(() => set({ message: null }), 1500);
      return data.path;
    } catch (e) {
      set({ message: { type: 'error', text: `图片上传失败：${(e as Error).message}` } });
      return null;
    }
  },

  importConfig: async (file: File) => {
    try {
      const text = await file.text();
      const config = JSON.parse(text);
      const data = await api<{ slug: string; migratedFrom?: string }>('/api/import', {
        method: 'POST',
        body: JSON.stringify({ config }),
      });
      await get().loadBrands();
      await get().loadBrand(data.slug);
      set({
        message: {
          type: 'success',
          text: `已导入为新品牌「${data.slug}」${data.migratedFrom ? `（从 ${data.migratedFrom} 迁移）` : ''}`,
        },
      });
      return true;
    } catch (e) {
      set({ message: { type: 'error', text: `导入失败：${(e as Error).message}` } });
      return false;
    }
  },

  exportConfig: () => {
    const { config, activeSlug } = get();
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeSlug}.brand.config.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  exportSite: async () => {
    const { activeSlug, dirty, config, savedConfig, save } = get();
    // 导出前若有未保存修改，先保存
    if (dirty) {
      const ok = await save();
      if (!ok) return { success: false, message: '保存失败，无法导出' };
    }
    try {
      const data = await api<{ success: boolean; warnings: string[]; errors: string[]; outDir: string }>(
        `/api/export-site/${encodeURIComponent(activeSlug)}`,
        { method: 'POST' },
      );
      if (data.success) {
        const warnText = data.warnings.length > 0 ? `（${data.warnings.length} 条警告）` : '';
        return { success: true, message: `导出成功${warnText}！产物在 out/ 目录` };
      }
      return { success: false, message: data.errors.join('; ') || '导出失败' };
    } catch (e) {
      return { success: false, message: (e as Error).message };
    }
  },

  resetToSaved: () => {
    const { savedConfig } = get();
    set({ config: JSON.parse(JSON.stringify(savedConfig)), dirty: false });
    set({ message: { type: 'info', text: '已恢复到上次保存的版本' } });
    setTimeout(() => set({ message: null }), 2000);
  },

  resetToTemplate: () => {
    const { activeSlug, config } = get();
    const fresh = createDefaultConfig(activeSlug, config.brand.name);
    set({ config: fresh, dirty: true });
    set({ message: { type: 'info', text: '已恢复模板默认值（保存后生效）' } });
    setTimeout(() => set({ message: null }), 2500);
  },
}));

/** 便捷选择器：主题 CSS 变量 */
export function useThemeVars() {
  const theme = useEditorStore((s) => s.config.theme);
  return themeToCssVars(theme);
}
