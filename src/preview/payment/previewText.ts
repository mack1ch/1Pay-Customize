import type { AppearanceMode, FormCustomizationConfig } from '../../types/customization';
import { mockPaymentContext } from '../../domain/defaults';

export function headerTitle(
  cfg: FormCustomizationConfig,
  mode: AppearanceMode,
): string {
  const t = cfg.variants[mode].formName.trim();
  return t || mockPaymentContext.merchantName;
}

export function headerDescription(
  cfg: FormCustomizationConfig,
  mode: AppearanceMode,
): string {
  const t = cfg.variants[mode].description.trim();
  return t || mockPaymentContext.purchaseDescription;
}
