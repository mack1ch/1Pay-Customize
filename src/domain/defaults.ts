import type {
  AppearanceMode,
  AppearanceVariant,
  FormCustomizationConfig,
  FormConfigsByType,
  PaymentFormType,
  PaymentStatusKind,
  StatusScreenCustomization,
} from '../types/customization';
import { PAYMENT_STATUS_KINDS } from '../types/customization';
import { clampFormBaseRadius } from './formRadiusModel';

export const DEFAULT_FORM_BORDER_RADIUS = 16;

export const mockPaymentContext = {
  amountFormatted: '139 ₽',
  amountShort: '139 ₽',
  merchantName: 'AlexShop_bot',
  purchaseDescription: 'Покупка 520 звёзд для @rostik224',
  timer: '29:45',
} as const;

const DEFAULT_SBP_LIGHT = {
  instructionTitle: 'Чтобы оплатить отсканируйте QR-код',
  instructionText:
    'Откройте приложение банка и отсканируйте QR-код для оплаты.',
  bankSearchPlaceholder: 'Поиск банка',
  searchFieldBg: '#F6F6F6',
  bankRowBg: '#F6F6F6',
  bankRowBorder: '#EEEEEE',
  qrDarkModule: '#222222',
  qrLightModule: '#FFFFFF',
} as const;

/** Тёмная тема СБП — макет Figma 1:9202 */
const DEFAULT_SBP_DARK = {
  instructionTitle: DEFAULT_SBP_LIGHT.instructionTitle,
  instructionText: DEFAULT_SBP_LIGHT.instructionText,
  bankSearchPlaceholder: DEFAULT_SBP_LIGHT.bankSearchPlaceholder,
  searchFieldBg: '#303030',
  bankRowBg: '#272727',
  bankRowBorder: '#3D3D3D',
  qrDarkModule: '#E8E8E8',
  qrLightModule: '#121212',
} as const;

function statusDefaults(
  kind: PaymentStatusKind,
  mode: AppearanceMode,
): StatusScreenCustomization {
  const isDark = mode === 'dark';
  const mainText = isDark ? '#F2F2F2' : '#222222';
  const muted = isDark ? '#9CA3AF' : '#757575';
  const cardBg = isDark ? '#2A2A2A' : '#F6F6F6';
  const pageMut = isDark ? '#252525' : '#F6F6F6';

  const base = (o: Partial<StatusScreenCustomization>): StatusScreenCustomization => ({
    title: '',
    description: '',
    iconBackdropColor: '#27AD511A',
    iconColor: '#27AD51',
    titleColor: mainText,
    descriptionColor: muted,
    detailsCardBg: cardBg,
    detailsLabelColor: muted,
    detailsValueColor: mainText,
    ctaBackground: pageMut,
    ctaTextColor: mainText,
    ctaMutedColor: muted,
    ctaLabel: 'Вернуться в магазин',
    ...o,
  });

  switch (kind) {
    case 'success':
      return base({
        title: 'Оплата прошла успешно',
        description:
          'Мы получили ваш платёж. Подтверждение обычно занимает до 5 минут',
        iconBackdropColor: isDark ? '#34D39933' : '#27AD511A',
        iconColor: isDark ? '#34D399' : '#27AD51',
      });
    case 'failure':
      return base({
        title: 'Оплата не прошла',
        description:
          'Попробуйте снова или выберите другой способ оплаты. Если списание прошло, статус обновится позже.',
        iconBackdropColor: isDark ? '#F8717133' : '#E5393514',
        iconColor: isDark ? '#F87171' : '#E53935',
      });
    case 'processing':
      return base({
        title: 'Платёж обрабатывается',
        description:
          'Обычно это занимает до нескольких минут. Обновите страницу позже.',
        iconBackdropColor: isDark ? '#60A5FA33' : '#2563EB14',
        iconColor: isDark ? '#60A5FA' : '#2563EB',
      });
    case 'expired':
      return base({
        title: 'Срок оплаты истёк',
        description:
          'Вернитесь в магазин и создайте новый платёж, чтобы завершить покупку.',
        iconBackdropColor: isDark ? '#FBBF2433' : '#F59E0B1A',
        iconColor: isDark ? '#FBBF24' : '#D97706',
      });
  }
}

function defaultStatuses(mode: AppearanceMode): Record<PaymentStatusKind, StatusScreenCustomization> {
  return PAYMENT_STATUS_KINDS.reduce(
    (acc, k) => {
      acc[k] = statusDefaults(k, mode);
      return acc;
    },
    {} as Record<PaymentStatusKind, StatusScreenCustomization>,
  );
}

/** Дополняет вариант темы недостающими полями (после добавления ключей в схему). */
export function coerceAppearanceVariant(
  partial: Partial<AppearanceVariant>,
  mode: AppearanceMode,
): AppearanceVariant {
  const d = createDefaultAppearanceVariant(mode);
  const statuses = { ...d.statuses };
  for (const k of PAYMENT_STATUS_KINDS) {
    statuses[k] = {
      ...d.statuses[k],
      ...(partial.statuses?.[k] ?? {}),
    };
  }
  return {
    ...d,
    ...partial,
    statuses,
    sbp: { ...d.sbp, ...partial.sbp },
  };
}

export function coerceFormConfig(c: FormCustomizationConfig): FormCustomizationConfig {
  return {
    ...c,
    borderRadius: clampFormBaseRadius(c.borderRadius),
    variants: {
      light: coerceAppearanceVariant(c.variants.light, 'light'),
      dark: coerceAppearanceVariant(c.variants.dark, 'dark'),
    },
  };
}

export function createDefaultAppearanceVariant(mode: AppearanceMode): AppearanceVariant {
  const isDark = mode === 'dark';
  return {
    formName: 'Оплата заказа',
    description: 'Укажите данные и оплатите заказ удобным способом',
    buttonText: 'Оплатить {amount}',
    textColor: isDark ? '#FFFFFF' : '#222222',
    mutedTextColor: '#757575',
    subtleTextColor: '#ADADAD',
    primaryColor: '#26AD50',
    hoverColor: isDark ? '#32C965' : '#32C965',
    activeColor: '#208F43',
    bgColor: isDark ? '#1A1A1A' : '#F0F0F0',
    gradientStart: isDark ? '#1A1A1A' : '#E8F5EC',
    gradientEnd: isDark ? '#272727' : '#F0F9F3',
    cardBackground: isDark ? '#272727' : '#FFFFFF',
    cardBorderColor: isDark ? '#26AD50' : '#FFFFFF',
    onPrimaryTextColor: isDark ? '#303030' : '#FFFFFF',
    inputBorderColor: isDark ? '#3D3D3D' : '#E5E7EB',
    inputFillColor: isDark ? '#272727' : '#FFFFFF',
    statuses: defaultStatuses(mode),
    sbp: {
      ...(isDark ? DEFAULT_SBP_DARK : DEFAULT_SBP_LIGHT),
    },
  };
}

export function defaultSharedFormFields(): Pick<
  FormCustomizationConfig,
  | 'borderRadius'
  | 'fontFamily'
  | 'logoDataUrl'
  | 'logoShowPlaceholder'
  | 'multiformMethods'
> {
  return {
    fontFamily: 'Inter',
  borderRadius: 16,
  logoDataUrl: null,
  logoShowPlaceholder: true,
  multiformMethods: {
    sbpQuick: true,
    payQuick: true,
    card: true,
  },
};
}

const shared = defaultSharedFormFields();

/** Базовый конфиг одного типа формы (без formType / variants). */
function mkFormConfig(formType: PaymentFormType): FormCustomizationConfig {
  return {
    formType,
    ...shared,
    variants: {
      light: createDefaultAppearanceVariant('light'),
      dark: createDefaultAppearanceVariant('dark'),
    },
  };
}

/** Независимые настройки для карты, СБП и мультиформы. */
export function createDefaultConfigsByType(): FormConfigsByType {
  return {
    card: mkFormConfig('card'),
    sbp: mkFormConfig('sbp'),
    multi: mkFormConfig('multi'),
  };
}
