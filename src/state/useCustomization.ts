import { useContext } from 'react';
import { CustomizationContext, type CustomizationContextValue } from './customizationContext';

export function useCustomization(): CustomizationContextValue {
  const ctx = useContext(CustomizationContext);
  if (!ctx) {
    throw new Error('useCustomization must be used within CustomizationProvider');
  }
  return ctx;
}
