import type { FormCustomizationConfig } from '../types/customization';
import { PREVIEW_SESSION_KEY, PREVIEW_TRANSFER_KEY } from '../types/customization';
import type { PreviewDevice } from '../preview/previewDevice';

export function stringifyPreviewPayload(
  config: FormCustomizationConfig,
  device: PreviewDevice,
): string {
  return JSON.stringify({ v: 1, config, device });
}

export function parsePreviewPayload(
  raw: string | null,
): { config: FormCustomizationConfig; device: PreviewDevice } | null {
  if (!raw) return null;
  try {
    const j = JSON.parse(raw) as unknown;
    if (j && typeof j === 'object' && j !== null && 'config' in j) {
      const o = j as { config: FormCustomizationConfig; device?: string };
      return {
        config: o.config,
        device: o.device === 'mobile' ? 'mobile' : 'desktop',
      };
    }
    return { config: j as FormCustomizationConfig, device: 'desktop' };
  } catch {
    return null;
  }
}

/** Записать текущий черновик перед открытием /open-form в новой вкладке. */
export function writePreviewTransfer(
  config: FormCustomizationConfig,
  device: PreviewDevice,
): boolean {
  try {
    localStorage.setItem(PREVIEW_TRANSFER_KEY, stringifyPreviewPayload(config, device));
    return true;
  } catch {
    return false;
  }
}

/**
 * Прочитать конфиг для страницы предпросмотра: сначала handoff из редактора,
 * иначе запасной вариант из sessionStorage (та же вкладка).
 */
export function readPreviewHandoff(): {
  config: FormCustomizationConfig;
  device: PreviewDevice;
} | null {
  if (typeof window === 'undefined') return null;
  try {
    const transfer = localStorage.getItem(PREVIEW_TRANSFER_KEY);
    if (transfer) {
      const p = parsePreviewPayload(transfer);
      if (p) return p;
    }
  } catch {
    /* quota / disabled */
  }
  try {
    const legacy = sessionStorage.getItem(PREVIEW_SESSION_KEY);
    return parsePreviewPayload(legacy);
  } catch {
    return null;
  }
}

