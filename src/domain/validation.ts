import type {
  AppearanceMode,
  AppearanceVariant,
  FieldErrors,
  FormCustomizationConfig,
  PaymentStatusKind,
  StatusErrors,
  StatusScreenCustomization,
  VariantSliceErrors,
} from '../types/customization';
import { PAYMENT_STATUS_KINDS } from '../types/customization';

const HEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;

export function isValidHex(value: string): boolean {
  return HEX.test(value.trim());
}

const MAX_NAME = 120;
const MAX_DESCRIPTION = 500;
const MAX_BUTTON = 200;
const MAX_STATUS_TITLE = 200;
const MAX_STATUS_DESC = 600;
const MAX_CTA = 120;
const MAX_SBP_LINE = 400;
const LOGO_MAX_BYTES = 1024 * 1024;
const LOGO_MIME = new Set(['image/png', 'image/jpeg', 'image/svg+xml']);

const STATUS_HEX_KEYS: (keyof StatusScreenCustomization)[] = [
  'iconBackdropColor',
  'iconColor',
  'titleColor',
  'descriptionColor',
  'detailsCardBg',
  'detailsLabelColor',
  'detailsValueColor',
  'ctaBackground',
  'ctaTextColor',
  'ctaMutedColor',
];

function validateStatus(
  _kind: PaymentStatusKind,
  s: StatusScreenCustomization,
): StatusErrors {
  const out: StatusErrors = {};
  if (s.title.length > MAX_STATUS_TITLE) {
    out.title = `Не более ${MAX_STATUS_TITLE} символов`;
  }
  if (s.description.length > MAX_STATUS_DESC) {
    out.description = `Не более ${MAX_STATUS_DESC} символов`;
  }
  if (s.ctaLabel.length > MAX_CTA) {
    out.ctaLabel = `Не более ${MAX_CTA} символов`;
  }
  for (const key of STATUS_HEX_KEYS) {
    if (!isValidHex(s[key])) {
      out[key] = 'Некорректный формат HEX';
    }
  }
  return out;
}

function validateSbp(s: AppearanceVariant['sbp']): VariantSliceErrors['sbp'] {
  const out: VariantSliceErrors['sbp'] = {};
  if (s.instructionTitle.length > MAX_SBP_LINE) {
    out.instructionTitle = `Не более ${MAX_SBP_LINE} символов`;
  }
  if (s.instructionText.length > MAX_SBP_LINE) {
    out.instructionText = `Не более ${MAX_SBP_LINE} символов`;
  }
  if (s.bankSearchPlaceholder.length > 80) {
    out.bankSearchPlaceholder = 'Не более 80 символов';
  }
  const hexKeys: (keyof AppearanceVariant['sbp'])[] = [
    'searchFieldBg',
    'bankRowBg',
    'bankRowBorder',
    'qrDarkModule',
    'qrLightModule',
  ];
  for (const k of hexKeys) {
    if (!isValidHex(s[k])) {
      out[k] = 'Некорректный формат HEX';
    }
  }
  return Object.keys(out).length ? out : undefined;
}

function validateVariantSlice(v: AppearanceVariant): VariantSliceErrors {
  const errors: VariantSliceErrors = {};

  if (v.formName.length > MAX_NAME) {
    errors.formName = `Не более ${MAX_NAME} символов`;
  }
  if (v.description.length > MAX_DESCRIPTION) {
    errors.description = `Не более ${MAX_DESCRIPTION} символов`;
  }
  if (v.buttonText.length > MAX_BUTTON) {
    errors.buttonText = `Не более ${MAX_BUTTON} символов`;
  }
  if (!isValidHex(v.textColor)) errors.textColor = 'Некорректный формат HEX';
  if (!isValidHex(v.mutedTextColor))
    errors.mutedTextColor = 'Некорректный формат HEX';
  if (!isValidHex(v.subtleTextColor))
    errors.subtleTextColor = 'Некорректный формат HEX';
  if (!isValidHex(v.primaryColor))
    errors.primaryColor = 'Некорректный формат HEX';
  if (!isValidHex(v.hoverColor)) errors.hoverColor = 'Некорректный формат HEX';
  if (!isValidHex(v.activeColor)) errors.activeColor = 'Некорректный формат HEX';
  if (!isValidHex(v.bgColor)) errors.bgColor = 'Некорректный формат HEX';
  if (!isValidHex(v.gradientStart))
    errors.gradientStart = 'Некорректный формат HEX';
  if (!isValidHex(v.gradientEnd))
    errors.gradientEnd = 'Некорректный формат HEX';
  if (!isValidHex(v.cardBackground))
    errors.cardBackground = 'Некорректный формат HEX';
  if (!isValidHex(v.cardBorderColor))
    errors.cardBorderColor = 'Некорректный формат HEX';
  if (!isValidHex(v.onPrimaryTextColor))
    errors.onPrimaryTextColor = 'Некорректный формат HEX';
  if (!isValidHex(v.inputBorderColor))
    errors.inputBorderColor = 'Некорректный формат HEX';
  if (!isValidHex(v.inputFillColor))
    errors.inputFillColor = 'Некорректный формат HEX';

  const st: NonNullable<VariantSliceErrors['statuses']> = {};
  for (const kind of PAYMENT_STATUS_KINDS) {
    const se = validateStatus(kind, v.statuses[kind]);
    if (Object.keys(se).length) {
      st[kind] = se;
    }
  }
  if (Object.keys(st).length) errors.statuses = st;

  const sbpErr = validateSbp(v.sbp);
  if (sbpErr && Object.keys(sbpErr).length) errors.sbp = sbpErr;

  return errors;
}

function sliceHasErrors(e: VariantSliceErrors): boolean {
  if (e.formName || e.description || e.buttonText) return true;
  if (
    e.textColor ||
    e.mutedTextColor ||
    e.subtleTextColor ||
    e.primaryColor ||
    e.hoverColor ||
    e.activeColor ||
    e.bgColor ||
    e.gradientStart ||
    e.gradientEnd ||
    e.cardBackground ||
    e.cardBorderColor ||
    e.onPrimaryTextColor ||
    e.inputBorderColor ||
    e.inputFillColor
  ) {
    return true;
  }
  if (e.statuses) {
    for (const kind of PAYMENT_STATUS_KINDS) {
      const s = e.statuses[kind];
      if (s && Object.keys(s).length) return true;
    }
  }
  if (e.sbp && Object.keys(e.sbp).length) return true;
  return false;
}

export function validateConfig(config: FormCustomizationConfig): FieldErrors {
  return {
    variants: {
      light: validateVariantSlice(config.variants.light),
      dark: validateVariantSlice(config.variants.dark),
    },
  };
}

export function hasValidationErrors(errors: FieldErrors): boolean {
  return (
    sliceHasErrors(errors.variants.light) || sliceHasErrors(errors.variants.dark)
  );
}

export function errorsForAppearance(
  errors: FieldErrors,
  mode: AppearanceMode,
): VariantSliceErrors {
  return errors.variants[mode];
}

export async function validateLogoFile(file: File): Promise<string | null> {
  if (!LOGO_MIME.has(file.type)) {
    return 'Допустимы только PNG, JPG или SVG';
  }
  if (file.size > LOGO_MAX_BYTES) {
    return 'Размер файла не должен превышать 1 МБ';
  }
  return null;
}

export function normalizeHexForPreview(value: string, fallback: string): string {
  const v = value.trim();
  return isValidHex(v) ? v : fallback;
}
