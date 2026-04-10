import type {
  AppearanceVariant,
  FormCustomizationConfig,
  PaymentFormType,
} from '../types/customization';
import {
  coerceFormConfig,
  createDefaultAppearanceVariant,
  defaultSharedFormFields,
} from './defaults';

/** Плоский конфиг до введения variants (light/dark) */
interface LegacyFlatConfig {
  formType?: PaymentFormType;
  formName?: string;
  description?: string;
  buttonText?: string;
  textColor?: string;
  primaryColor?: string;
  hoverColor?: string;
  activeColor?: string;
  bgColor?: string;
  gradientStart?: string;
  gradientEnd?: string;
  fontFamily?: string;
  borderRadius?: number;
  logoDataUrl?: string | null;
  logoShowPlaceholder?: boolean;
  multiformMethods?: FormCustomizationConfig['multiformMethods'];
  variants?: FormCustomizationConfig['variants'];
}

function cloneVariant(v: AppearanceVariant): AppearanceVariant {
  return {
    ...v,
    statuses: {
      success: { ...v.statuses.success },
      failure: { ...v.statuses.failure },
      processing: { ...v.statuses.processing },
      expired: { ...v.statuses.expired },
    },
    sbp: { ...v.sbp },
  };
}

export function migrateToFormConfig(raw: unknown): FormCustomizationConfig | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as LegacyFlatConfig;
  if (o.variants?.light && o.variants?.dark) {
    return coerceFormConfig(raw as FormCustomizationConfig);
  }

  const shared = defaultSharedFormFields();
  const baseVariant = createDefaultAppearanceVariant('light');
  const merged: AppearanceVariant = {
    ...baseVariant,
    formName: typeof o.formName === 'string' ? o.formName : baseVariant.formName,
    description:
      typeof o.description === 'string' ? o.description : baseVariant.description,
    buttonText:
      typeof o.buttonText === 'string' ? o.buttonText : baseVariant.buttonText,
    textColor: typeof o.textColor === 'string' ? o.textColor : baseVariant.textColor,
    primaryColor:
      typeof o.primaryColor === 'string' ? o.primaryColor : baseVariant.primaryColor,
    hoverColor:
      typeof o.hoverColor === 'string' ? o.hoverColor : baseVariant.hoverColor,
    activeColor:
      typeof o.activeColor === 'string' ? o.activeColor : baseVariant.activeColor,
    bgColor: typeof o.bgColor === 'string' ? o.bgColor : baseVariant.bgColor,
    gradientStart:
      typeof o.gradientStart === 'string' ? o.gradientStart : baseVariant.gradientStart,
    gradientEnd:
      typeof o.gradientEnd === 'string' ? o.gradientEnd : baseVariant.gradientEnd,
  };

  const darkBase = createDefaultAppearanceVariant('dark');
  const lightClone = cloneVariant(merged);
  const darkClone = cloneVariant(darkBase);

  return {
    formType: o.formType === 'card' || o.formType === 'sbp' || o.formType === 'multi'
      ? o.formType
      : 'multi',
    fontFamily:
      typeof o.fontFamily === 'string' ? o.fontFamily : shared.fontFamily,
    borderRadius:
      typeof o.borderRadius === 'number' && Number.isFinite(o.borderRadius)
        ? o.borderRadius
        : shared.borderRadius,
    logoDataUrl:
      o.logoDataUrl === null || typeof o.logoDataUrl === 'string'
        ? o.logoDataUrl ?? null
        : shared.logoDataUrl,
    logoShowPlaceholder:
      typeof o.logoShowPlaceholder === 'boolean'
        ? o.logoShowPlaceholder
        : shared.logoShowPlaceholder,
    multiformMethods:
      o.multiformMethods && typeof o.multiformMethods === 'object'
        ? {
            sbpQuick: Boolean(o.multiformMethods.sbpQuick),
            payQuick: Boolean(o.multiformMethods.payQuick),
            card: Boolean(o.multiformMethods.card),
          }
        : { ...shared.multiformMethods },
    variants: {
      light: lightClone,
      dark: darkClone,
    },
  };
}
