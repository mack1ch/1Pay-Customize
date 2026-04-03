import type {
  FormCustomizationConfig,
  FormConfigsByType,
  PaymentFormType,
} from "../types/customization";

export const defaultFormConfig: FormCustomizationConfig = {
  formType: "multi",
  formName: "Оплата заказа",
  description: "Укажите данные и оплатите заказ удобным способом",
  buttonText: "Оплатить {amount}",
  /** Текст и акценты как в макете MIR: #222222 / #26AD50 */
  textColor: "#222222",
  primaryColor: "#26AD50",
  hoverColor: "#32C965",
  activeColor: "#208F43",
  bgColor: "#F0F0F0",
  gradientStart: "#E8F5EC",
  gradientEnd: "#F0F9F3",
  fontFamily: "Inter",
  borderRadius: 16,
  logoDataUrl: null,
  logoShowPlaceholder: true,
  multiformMethods: {
    sbpQuick: true,
    payQuick: true,
    card: true,
  },
};

/** Независимые настройки для карты, СБП и мультиформы (у каждого свой formType). */
export function createDefaultConfigsByType(): FormConfigsByType {
  const base = { ...defaultFormConfig };
  const mk = (formType: PaymentFormType): FormCustomizationConfig => ({
    ...base,
    formType,
  });
  return {
    card: mk("card"),
    sbp: mk("sbp"),
    multi: mk("multi"),
  };
}

export const mockPaymentContext = {
  amountFormatted: "139 ₽",
  amountShort: "139 ₽",
  merchantName: "AlexShop_bot",
  purchaseDescription: "Покупка 520 звезд для @rostik224",
  timer: "29:45",
} as const;
