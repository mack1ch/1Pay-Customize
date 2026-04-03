export type PaymentFormType = 'card' | 'sbp' | 'multi';

/** Порядок для перебора всех вариантов в провайдере */
export const PAYMENT_FORM_TYPES: readonly PaymentFormType[] = [
  'card',
  'sbp',
  'multi',
] as const;

export type FormConfigsByType = Record<PaymentFormType, FormCustomizationConfig>;

export interface MultiformMethods {
  sbpQuick: boolean;
  payQuick: boolean;
  card: boolean;
}

export interface FormCustomizationConfig {
  formType: PaymentFormType;
  formName: string;
  description: string;
  buttonText: string;
  textColor: string;
  primaryColor: string;
  hoverColor: string;
  activeColor: string;
  /** Цвет фона всей страницы оплаты (за карточками), не заливка самих карточек */
  bgColor: string;
  gradientStart: string;
  gradientEnd: string;
  fontFamily: string;
  /** Базовое скругление внешнего контейнера формы, 0…16 px (внутренние — по формуле ТЗ) */
  borderRadius: number;
  logoDataUrl: string | null;
  /** Если нет файла: true — заглушка 1P, false — пустое место */
  logoShowPlaceholder: boolean;
  multiformMethods: MultiformMethods;
}

export interface FieldErrors {
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
  logo?: string;
}

/** Устаревший ключ; передача в новую вкладку идёт через PREVIEW_TRANSFER_KEY (localStorage). */
export const PREVIEW_SESSION_KEY = '1pay_form_preview_config_v1';

/** Черновик конфига для /open-form — общий для всех вкладок origin (в отличие от sessionStorage). */
export const PREVIEW_TRANSFER_KEY = '1pay_form_preview_transfer_v1';

/** Подстановка {amount} в предпросмотре — форматированная сумма, напр. «139 ₽». */
export const DEFAULT_BUTTON_TEXT = 'Оплатить {amount}';
