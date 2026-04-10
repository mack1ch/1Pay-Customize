import { createContext } from 'react';
import type {
  AppearanceMode,
  AppearanceVariant,
  CustomizationEditorTab,
  FieldErrors,
  FormCustomizationConfig,
  PaymentFormType,
  PaymentStatusKind,
  PreviewContentScreen,
  SbpQrCustomization,
  StatusScreenCustomization,
} from '../types/customization';
import type { PreviewTheme } from './previewTheme';

export interface CustomizationContextValue {
  editingFormType: PaymentFormType;
  setEditingFormType: (t: PaymentFormType) => void;
  /**
   * Светлая или тёмная тема на устройстве: какой вариант редактируем и что показывает предпросмотр.
   */
  appearanceMode: AppearanceMode;
  setAppearanceMode: (m: AppearanceMode) => void;
  editorTab: CustomizationEditorTab;
  setEditorTab: (t: CustomizationEditorTab) => void;
  /** Какой статус редактируют на вкладке «Статусы»; предпросмотр берёт его оттуда. */
  editingStatusKind: PaymentStatusKind;
  setEditingStatusKind: (k: PaymentStatusKind) => void;
  /** Синтез: форма или экран статуса — без отдельного селектора в превью. */
  previewScreen: PreviewContentScreen;

  draft: FormCustomizationConfig;
  saved: FormCustomizationConfig;
  draftVariant: AppearanceVariant;
  previewTheme: PreviewTheme;
  fieldErrors: FieldErrors;
  isDirty: boolean;
  isSaveEnabled: boolean;
  isResetEnabled: boolean;
  isLoading: boolean;
  toast: string | null;
  setToast: (msg: string | null) => void;

  updateDraft: (patch: Partial<FormCustomizationConfig>) => void;
  updateVariant: (patch: Partial<AppearanceVariant>) => void;
  updateStatusCustomization: (
    kind: PaymentStatusKind,
    patch: Partial<StatusScreenCustomization>,
  ) => void;
  updateSbpCustomization: (patch: Partial<SbpQrCustomization>) => void;

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
