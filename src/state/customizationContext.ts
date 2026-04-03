import { createContext } from 'react';
import type {
  FieldErrors,
  FormCustomizationConfig,
  PaymentFormType,
} from "../types/customization";
import type { PreviewTheme } from './previewTheme';

export interface CustomizationContextValue {
  /** Какую форму сейчас редактируют (карта / СБП / мульти) */
  editingFormType: PaymentFormType;
  setEditingFormType: (t: PaymentFormType) => void;
  /** Черновик и сохранённое состояние для выбранного типа */
  draft: FormCustomizationConfig;
  saved: FormCustomizationConfig;
  previewTheme: PreviewTheme;
  fieldErrors: FieldErrors;
  isDirty: boolean;
  isSaveEnabled: boolean;
  isResetEnabled: boolean;
  isLoading: boolean;
  toast: string | null;
  setToast: (msg: string | null) => void;
  updateDraft: (patch: Partial<FormCustomizationConfig>) => void;
  /** @deprecated Используйте setEditingFormType */
  setFormType: (t: PaymentFormType) => void;
  setLogo: (dataUrl: string | null) => void;
  setLogoError: (msg: string | null) => void;
  logoError: string | null;
  save: () => Promise<void>;
  reset: () => void;
}

export const CustomizationContext = createContext<CustomizationContextValue | null>(
  null,
);
