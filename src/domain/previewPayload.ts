import { migrateToFormConfig } from './configMigration';
import type { AppearanceMode, FormCustomizationConfig } from '../types/customization';
import type { PreviewContentScreen } from '../types/customization';
import { PREVIEW_SESSION_KEY, PREVIEW_TRANSFER_KEY } from '../types/customization';
import type { PreviewDevice } from '../preview/previewDevice';

const PAYLOAD_VERSION = 2;

export interface PreviewHandoffPayload {
  v: number;
  config: FormCustomizationConfig;
  device: PreviewDevice;
  /** Тема предпросмотра из редактора (если не задана — по системной на open-form) */
  previewAppearance?: AppearanceMode;
  /** Экран: форма или статус */
  previewScreen?: PreviewContentScreen;
}

export function stringifyPreviewPayload(p: PreviewHandoffPayload): string {
  return JSON.stringify(p);
}

function normalizeDevice(d: unknown): PreviewDevice {
  return d === 'mobile' ? 'mobile' : 'desktop';
}

export function parsePreviewPayload(
  raw: string | null,
): PreviewHandoffPayload | null {
  if (!raw) return null;
  try {
    const j = JSON.parse(raw) as unknown;
    if (!j || typeof j !== 'object') return null;
    const o = j as Record<string, unknown>;

    if ('config' in o && o.config) {
      const cfg = migrateToFormConfig(o.config);
      if (!cfg) return null;
      const device = normalizeDevice(o.device);
      const previewAppearance =
        o.previewAppearance === 'dark' || o.previewAppearance === 'light'
          ? o.previewAppearance
          : undefined;
      const ps = o.previewScreen;
      const previewScreen =
        ps === 'form' ||
        ps === 'success' ||
        ps === 'failure' ||
        ps === 'processing' ||
        ps === 'expired'
          ? ps
          : undefined;
      return {
        v: typeof o.v === 'number' ? o.v : PAYLOAD_VERSION,
        config: cfg,
        device,
        previewAppearance,
        previewScreen,
      };
    }

    const legacy = migrateToFormConfig(j);
    if (!legacy) return null;
    return {
      v: 1,
      config: legacy,
      device: 'desktop',
    };
  } catch {
    return null;
  }
}

/** Записать текущий черновик перед открытием /open-form в новой вкладке. */
export function writePreviewTransfer(
  config: FormCustomizationConfig,
  device: PreviewDevice,
  previewAppearance: AppearanceMode,
  previewScreen: PreviewContentScreen,
): boolean {
  try {
    const payload: PreviewHandoffPayload = {
      v: PAYLOAD_VERSION,
      config,
      device,
      previewAppearance,
      previewScreen,
    };
    localStorage.setItem(PREVIEW_TRANSFER_KEY, stringifyPreviewPayload(payload));
    return true;
  } catch {
    return false;
  }
}

/**
 * Прочитать конфиг для страницы предпросмотра: сначала handoff из редактора,
 * иначе запасной вариант из sessionStorage.
 */
export function readPreviewHandoff(): PreviewHandoffPayload | null {
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
