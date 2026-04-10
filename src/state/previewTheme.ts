import { clampFormBaseRadius } from '../domain/formRadiusModel';
import {
  createDefaultAppearanceVariant,
  DEFAULT_FORM_BORDER_RADIUS,
} from '../domain/defaults';
import { isValidHex } from '../domain/validation';
import type {
  AppearanceMode,
  AppearanceVariant,
  FormCustomizationConfig,
} from '../types/customization';

/** Черновик: пустое / битое значение → дефолт макета (не 0). */
export function resolveDraftBorderRadius(raw: unknown): number {
  if (raw === null || raw === undefined || raw === '') {
    return clampFormBaseRadius(DEFAULT_FORM_BORDER_RADIUS);
  }
  const n =
    typeof raw === 'number'
      ? raw
      : typeof raw === 'string'
        ? Number(raw.trim())
        : Number(raw);
  if (!Number.isFinite(n)) {
    return clampFormBaseRadius(DEFAULT_FORM_BORDER_RADIUS);
  }
  return clampFormBaseRadius(n);
}

export interface PreviewTheme {
  formType: FormCustomizationConfig['formType'];
  borderRadius: number;
  fontFamily: string;
  logoDataUrl: string | null;
  logoShowPlaceholder: boolean;
  multiformMethods: FormCustomizationConfig['multiformMethods'];
  appearanceMode: AppearanceMode;
  /** Активный вариант темы (light/dark) для предпросмотра */
  variant: AppearanceVariant;
  effectiveTextColor: string;
  effectiveMutedTextColor: string;
  effectiveSubtleTextColor: string;
  effectivePrimaryColor: string;
  effectiveHoverColor: string;
  effectiveActiveColor: string;
  effectiveBgColor: string;
  effectiveGradientStart: string;
  effectiveGradientEnd: string;
  effectiveCardBackground: string;
  effectiveCardBorderColor: string;
  effectiveOnPrimaryTextColor: string;
  effectiveInputBorderColor: string;
  effectiveInputFillColor: string;
}

const defLight = createDefaultAppearanceVariant('light');
const defDark = createDefaultAppearanceVariant('dark');

function pickColor(
  draftVal: string,
  savedVal: string,
  defaultVal: string,
): string {
  if (isValidHex(draftVal)) return draftVal.trim();
  if (isValidHex(savedVal)) return savedVal.trim();
  return defaultVal;
}

export function buildPreviewTheme(
  draft: FormCustomizationConfig,
  saved: FormCustomizationConfig,
  appearance: AppearanceMode,
): PreviewTheme {
  const v = draft.variants[appearance];
  const sv = saved.variants[appearance];
  const d = appearance === 'dark' ? defDark : defLight;

  return {
    formType: draft.formType,
    borderRadius: resolveDraftBorderRadius(draft.borderRadius),
    fontFamily: draft.fontFamily,
    logoDataUrl: draft.logoDataUrl,
    logoShowPlaceholder: draft.logoShowPlaceholder,
    multiformMethods: draft.multiformMethods,
    appearanceMode: appearance,
    variant: v,
    effectiveTextColor: pickColor(v.textColor, sv.textColor, d.textColor),
    effectiveMutedTextColor: pickColor(
      v.mutedTextColor,
      sv.mutedTextColor,
      d.mutedTextColor,
    ),
    effectiveSubtleTextColor: pickColor(
      v.subtleTextColor,
      sv.subtleTextColor,
      d.subtleTextColor,
    ),
    effectivePrimaryColor: pickColor(
      v.primaryColor,
      sv.primaryColor,
      d.primaryColor,
    ),
    effectiveHoverColor: pickColor(v.hoverColor, sv.hoverColor, d.hoverColor),
    effectiveActiveColor: pickColor(
      v.activeColor,
      sv.activeColor,
      d.activeColor,
    ),
    effectiveBgColor: pickColor(v.bgColor, sv.bgColor, d.bgColor),
    effectiveGradientStart: pickColor(
      v.gradientStart,
      sv.gradientStart,
      d.gradientStart,
    ),
    effectiveGradientEnd: pickColor(
      v.gradientEnd,
      sv.gradientEnd,
      d.gradientEnd,
    ),
    effectiveCardBackground: pickColor(
      v.cardBackground,
      sv.cardBackground,
      d.cardBackground,
    ),
    effectiveCardBorderColor: pickColor(
      v.cardBorderColor,
      sv.cardBorderColor,
      d.cardBorderColor,
    ),
    effectiveOnPrimaryTextColor: pickColor(
      v.onPrimaryTextColor,
      sv.onPrimaryTextColor,
      d.onPrimaryTextColor,
    ),
    effectiveInputBorderColor: pickColor(
      v.inputBorderColor,
      sv.inputBorderColor,
      d.inputBorderColor,
    ),
    effectiveInputFillColor: pickColor(
      v.inputFillColor,
      sv.inputFillColor,
      d.inputFillColor,
    ),
  };
}
