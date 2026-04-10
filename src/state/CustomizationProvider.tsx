import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { createDefaultConfigsByType } from '../domain/defaults';
import { clampFormBaseRadius } from '../domain/formRadiusModel';
import { hasValidationErrors, validateConfig } from '../domain/validation';
import {
  PAYMENT_FORM_TYPES,
  type AppearanceMode,
  type AppearanceVariant,
  type CustomizationEditorTab,
  type FormCustomizationConfig,
  type FormConfigsByType,
  type PaymentFormType,
  type PaymentStatusKind,
  type PreviewContentScreen,
  type SbpQrCustomization,
  type StatusScreenCustomization,
} from '../types/customization';
import { buildPreviewTheme } from './previewTheme';
import {
  CustomizationContext,
  type CustomizationContextValue,
} from './customizationContext';

function configsEqual(a: FormCustomizationConfig, b: FormCustomizationConfig): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function configsByTypeEqual(a: FormConfigsByType, b: FormConfigsByType): boolean {
  return PAYMENT_FORM_TYPES.every((t) => configsEqual(a[t], b[t]));
}

export function CustomizationProvider({ children }: { children: ReactNode }) {
  const defaults = useMemo(() => createDefaultConfigsByType(), []);

  const [savedByType, setSavedByType] = useState<FormConfigsByType>(defaults);
  const [draftByType, setDraftByType] = useState<FormConfigsByType>(defaults);
  const [editingFormType, setEditingFormType] =
    useState<PaymentFormType>('multi');
  const [appearanceMode, setAppearanceMode] = useState<AppearanceMode>('light');
  const [editorTab, setEditorTab] = useState<CustomizationEditorTab>('brand');
  const [editingStatusKind, setEditingStatusKind] =
    useState<PaymentStatusKind>('success');
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const id = window.setTimeout(() => {
      if (cancelled) return;
      setSavedByType(defaults);
      setDraftByType(defaults);
      setIsLoading(false);
    }, 450);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [defaults]);

  const draft = draftByType[editingFormType];
  const saved = savedByType[editingFormType];
  const draftVariant = draft.variants[appearanceMode];

  const fieldErrors = useMemo(() => validateConfig(draft), [draft]);

  const hasAnyErrors = useMemo(
    () =>
      PAYMENT_FORM_TYPES.some((t) =>
        hasValidationErrors(validateConfig(draftByType[t])),
      ),
    [draftByType],
  );

  const isDirty = useMemo(
    () => !configsByTypeEqual(draftByType, savedByType),
    [draftByType, savedByType],
  );

  const previewTheme = useMemo(
    () => buildPreviewTheme(draft, saved, appearanceMode),
    [draft, saved, appearanceMode],
  );

  const previewScreen: PreviewContentScreen = useMemo(
    () => (editorTab === 'statuses' ? editingStatusKind : 'form'),
    [editorTab, editingStatusKind],
  );

  const isSaveEnabled = isDirty && !hasAnyErrors;
  const isResetEnabled = isDirty;

  const updateDraft = useCallback(
    (patch: Partial<FormCustomizationConfig>) => {
      setDraftByType((prev) => {
        const cur = prev[editingFormType];
        const merged: FormCustomizationConfig = {
          ...cur,
          ...patch,
          formType: editingFormType,
        };
        if (patch.borderRadius !== undefined) {
          merged.borderRadius = clampFormBaseRadius(
            patch.borderRadius as unknown,
          );
        }
        if (patch.variants !== undefined) {
          merged.variants = patch.variants;
        }
        return { ...prev, [editingFormType]: merged };
      });
    },
    [editingFormType],
  );

  const updateVariant = useCallback(
    (patch: Partial<AppearanceVariant>) => {
      setDraftByType((prev) => {
        const cur = prev[editingFormType];
        const v = cur.variants[appearanceMode];
        const nextVariant: AppearanceVariant = { ...v, ...patch };
        return {
          ...prev,
          [editingFormType]: {
            ...cur,
            variants: {
              ...cur.variants,
              [appearanceMode]: nextVariant,
            },
          },
        };
      });
    },
    [editingFormType, appearanceMode],
  );

  const updateStatusCustomization = useCallback(
    (kind: PaymentStatusKind, patch: Partial<StatusScreenCustomization>) => {
      setDraftByType((prev) => {
        const cur = prev[editingFormType];
        const v = cur.variants[appearanceMode];
        const st = v.statuses[kind];
        return {
          ...prev,
          [editingFormType]: {
            ...cur,
            variants: {
              ...cur.variants,
              [appearanceMode]: {
                ...v,
                statuses: {
                  ...v.statuses,
                  [kind]: { ...st, ...patch },
                },
              },
            },
          },
        };
      });
    },
    [editingFormType, appearanceMode],
  );

  const updateSbpCustomization = useCallback(
    (patch: Partial<SbpQrCustomization>) => {
      setDraftByType((prev) => {
        const cur = prev[editingFormType];
        const v = cur.variants[appearanceMode];
        return {
          ...prev,
          [editingFormType]: {
            ...cur,
            variants: {
              ...cur.variants,
              [appearanceMode]: {
                ...v,
                sbp: { ...v.sbp, ...patch },
              },
            },
          },
        };
      });
    },
    [editingFormType, appearanceMode],
  );

  const setFormType = useCallback((t: PaymentFormType) => {
    setEditingFormType(t);
  }, []);

  const setLogo = useCallback(
    (logoDataUrl: string | null) => {
      setDraftByType((prev) => ({
        ...prev,
        [editingFormType]: { ...prev[editingFormType], logoDataUrl },
      }));
    },
    [editingFormType],
  );

  const save = useCallback(async () => {
    if (hasAnyErrors) return;
    await new Promise((r) => setTimeout(r, 400));
    setSavedByType({ ...draftByType });
    setToast('Настройки успешно сохранены и применены');
    window.setTimeout(() => setToast(null), 4000);
  }, [draftByType, hasAnyErrors]);

  const reset = useCallback(() => {
    setDraftByType({ ...savedByType });
    setLogoError(null);
  }, [savedByType]);

  const value: CustomizationContextValue = {
    editingFormType,
    setEditingFormType,
    appearanceMode,
    setAppearanceMode,
    editorTab,
    setEditorTab,
    editingStatusKind,
    setEditingStatusKind,
    previewScreen,
    draft,
    saved,
    draftVariant,
    previewTheme,
    fieldErrors,
    isDirty,
    isSaveEnabled,
    isResetEnabled,
    isLoading,
    toast,
    setToast,
    updateDraft,
    updateVariant,
    updateStatusCustomization,
    updateSbpCustomization,
    setFormType,
    setLogo,
    setLogoError,
    logoError,
    save,
    reset,
  };

  return (
    <CustomizationContext.Provider value={value}>
      {children}
    </CustomizationContext.Provider>
  );
}
