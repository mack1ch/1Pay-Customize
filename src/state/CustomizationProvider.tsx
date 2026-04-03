import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { defaultFormConfig } from '../domain/defaults';
import { clampFormBaseRadius } from '../domain/formRadiusModel';
import { hasValidationErrors, validateConfig } from '../domain/validation';
import type { FormCustomizationConfig } from '../types/customization';
import { buildPreviewTheme } from './previewTheme';
import { CustomizationContext, type CustomizationContextValue } from './customizationContext';

function configsEqual(a: FormCustomizationConfig, b: FormCustomizationConfig): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function CustomizationProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<FormCustomizationConfig>(defaultFormConfig);
  const [draft, setDraft] = useState<FormCustomizationConfig>(defaultFormConfig);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const id = window.setTimeout(() => {
      if (cancelled) return;
      setSaved(defaultFormConfig);
      setDraft(defaultFormConfig);
      setIsLoading(false);
    }, 450);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, []);

  const fieldErrors = useMemo(() => validateConfig(draft), [draft]);
  const hasErrors = hasValidationErrors(fieldErrors);

  const isDirty = useMemo(() => !configsEqual(draft, saved), [draft, saved]);

  const previewTheme = useMemo(
    () => buildPreviewTheme(draft, saved),
    [draft, saved],
  );

  const isSaveEnabled = isDirty && !hasErrors;
  const isResetEnabled = isDirty;

  const updateDraft = useCallback((patch: Partial<FormCustomizationConfig>) => {
    setDraft((prev) => {
      const next = { ...prev, ...patch };
      if (patch.borderRadius !== undefined) {
        next.borderRadius = clampFormBaseRadius(patch.borderRadius);
      }
      return next;
    });
  }, []);

  const setFormType = useCallback(
    (formType: FormCustomizationConfig['formType']) => {
      setDraft((prev) => ({ ...prev, formType }));
    },
    [],
  );

  const setLogo = useCallback((logoDataUrl: string | null) => {
    setDraft((prev) => ({ ...prev, logoDataUrl }));
  }, []);

  const save = useCallback(async () => {
    if (hasErrors) return;
    await new Promise((r) => setTimeout(r, 400));
    setSaved(draft);
    setToast('Настройки успешно сохранены и применены');
    window.setTimeout(() => setToast(null), 4000);
  }, [draft, hasErrors]);

  const reset = useCallback(() => {
    setDraft(saved);
    setLogoError(null);
  }, [saved]);

  const value: CustomizationContextValue = {
    draft,
    saved,
    previewTheme,
    fieldErrors,
    isDirty,
    isSaveEnabled,
    isResetEnabled,
    isLoading,
    toast,
    setToast,
    updateDraft,
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
