export type PaymentFormType = 'card' | 'sbp' | 'multi';

/** Порядок для перебора всех вариантов в провайдере */
export const PAYMENT_FORM_TYPES: readonly PaymentFormType[] = [
  'card',
  'sbp',
  'multi',
] as const;

export type FormConfigsByType = Record<PaymentFormType, FormCustomizationConfig>;

/** Тема оформления на устройстве пользователя (светлая / тёмная) */
export type AppearanceMode = 'light' | 'dark';

export const APPEARANCE_MODES: readonly AppearanceMode[] = ['light', 'dark'] as const;

/** Вкладки редактора кастомизации */
export type CustomizationEditorTab = 'brand' | 'statuses';

export type PaymentStatusKind = 'success' | 'failure' | 'processing' | 'expired';

export const PAYMENT_STATUS_KINDS: readonly PaymentStatusKind[] = [
  'success',
  'failure',
  'processing',
  'expired',
] as const;

export const PAYMENT_STATUS_LABEL: Record<PaymentStatusKind, string> = {
  success: 'Успех',
  failure: 'Неуспех',
  processing: 'Обработка',
  expired: 'Истёк срок формы',
};

export interface MultiformMethods {
  sbpQuick: boolean;
  payQuick: boolean;
  card: boolean;
}

/** Экран СБП / QR: отдельные тексты и цвета от оплаты картой */
export interface SbpQrCustomization {
  instructionTitle: string;
  instructionText: string;
  bankSearchPlaceholder: string;
  searchFieldBg: string;
  bankRowBg: string;
  bankRowBorder: string;
  /** Тёмные «модули» макета QR */
  qrDarkModule: string;
  qrLightModule: string;
}

/** Один экран статуса после оплаты */
export interface StatusScreenCustomization {
  title: string;
  description: string;
  /** Фон круга вокруг иконки (в макете — полупрозрачный оттенок статуса) */
  iconBackdropColor: string;
  iconColor: string;
  titleColor: string;
  descriptionColor: string;
  detailsCardBg: string;
  detailsLabelColor: string;
  detailsValueColor: string;
  ctaBackground: string;
  ctaTextColor: string;
  ctaMutedColor: string;
  ctaLabel: string;
}

/** Настройки, зависящие от светлой/тёмной темы на устройстве */
export interface AppearanceVariant {
  formName: string;
  description: string;
  buttonText: string;
  textColor: string;
  /**
   * Дополнительный текст: описание в шапке, подписи к полям, «Назад», юридические строки,
   * футер PCI и таймер, второстепенные строки в мультиформе и СБП (где не основной текст).
   */
  mutedTextColor: string;
  /** Приглушённые подсказки: плейсхолдеры полей карты, иконка и текст поиска банка в СБП */
  subtleTextColor: string;
  primaryColor: string;
  hoverColor: string;
  activeColor: string;
  /** Цвет фона всей страницы оплаты (за карточками) */
  bgColor: string;
  gradientStart: string;
  gradientEnd: string;
  /** Фон основной карточки формы (карта / СБП / блоки мультиформы) */
  cardBackground: string;
  /** Обводка карточки (совпадает с фоном = визуально без рамки) */
  cardBorderColor: string;
  /** Текст на сплошной кнопке «Оплатить» */
  onPrimaryTextColor: string;
  /** Обводка полей ввода карточной формы */
  inputBorderColor: string;
  /** Фон полей ввода карточной формы */
  inputFillColor: string;
  statuses: Record<PaymentStatusKind, StatusScreenCustomization>;
  sbp: SbpQrCustomization;
}

export interface FormCustomizationConfig {
  formType: PaymentFormType;
  borderRadius: number;
  fontFamily: string;
  logoDataUrl: string | null;
  logoShowPlaceholder: boolean;
  multiformMethods: MultiformMethods;
  variants: {
    light: AppearanceVariant;
    dark: AppearanceVariant;
  };
}

export type StatusFieldKey = keyof StatusScreenCustomization;

export type StatusErrors = Partial<Record<StatusFieldKey, string>>;

export interface VariantSliceErrors {
  formName?: string;
  description?: string;
  buttonText?: string;
  textColor?: string;
  mutedTextColor?: string;
  subtleTextColor?: string;
  primaryColor?: string;
  hoverColor?: string;
  activeColor?: string;
  bgColor?: string;
  gradientStart?: string;
  gradientEnd?: string;
  cardBackground?: string;
  cardBorderColor?: string;
  onPrimaryTextColor?: string;
  inputBorderColor?: string;
  inputFillColor?: string;
  statuses?: Partial<Record<PaymentStatusKind, StatusErrors>>;
  sbp?: Partial<Record<keyof SbpQrCustomization, string>>;
}

export interface FieldErrors {
  variants: {
    light: VariantSliceErrors;
    dark: VariantSliceErrors;
  };
}

/** Устаревший ключ; передача в новую вкладку идёт через PREVIEW_TRANSFER_KEY (localStorage). */
export const PREVIEW_SESSION_KEY = '1pay_form_preview_config_v1';

/** Черновик конфига для /open-form — общий для всех вкладок origin. */
export const PREVIEW_TRANSFER_KEY = '1pay_form_preview_transfer_v1';

/** Подстановка {amount} в предпросмотре */
export const DEFAULT_BUTTON_TEXT = 'Оплатить {amount}';

/** Экран в предпросмотре: форма оплаты или один из статусов */
export type PreviewContentScreen = 'form' | PaymentStatusKind;
