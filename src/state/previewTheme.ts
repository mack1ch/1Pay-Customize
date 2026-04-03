import { defaultFormConfig } from '../domain/defaults';
import { isValidHex } from '../domain/validation';
import type { FormCustomizationConfig } from '../types/customization';

export interface PreviewTheme extends FormCustomizationConfig {
  effectiveTextColor: string;
  effectivePrimaryColor: string;
  effectiveHoverColor: string;
  effectiveActiveColor: string;
  /** Совпадает с bgColor: фон всей страницы формы (превью и open-form), не карточки */
  effectiveBgColor: string;
  effectiveGradientStart: string;
  effectiveGradientEnd: string;
}

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
): PreviewTheme {
  const d = defaultFormConfig;
  return {
    ...draft,
    effectiveTextColor: pickColor(draft.textColor, saved.textColor, d.textColor),
    effectivePrimaryColor: pickColor(
      draft.primaryColor,
      saved.primaryColor,
      d.primaryColor,
    ),
    effectiveHoverColor: pickColor(
      draft.hoverColor,
      saved.hoverColor,
      d.hoverColor,
    ),
    effectiveActiveColor: pickColor(
      draft.activeColor,
      saved.activeColor,
      d.activeColor,
    ),
    effectiveBgColor: pickColor(draft.bgColor, saved.bgColor, d.bgColor),
    effectiveGradientStart: pickColor(
      draft.gradientStart,
      saved.gradientStart,
      d.gradientStart,
    ),
    effectiveGradientEnd: pickColor(
      draft.gradientEnd,
      saved.gradientEnd,
      d.gradientEnd,
    ),
  };
}
