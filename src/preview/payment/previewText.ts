import type { FormCustomizationConfig } from '../../types/customization';
import { mockPaymentContext } from '../../domain/defaults';

export function headerTitle(cfg: FormCustomizationConfig): string {
  const t = cfg.formName.trim();
  return t || mockPaymentContext.merchantName;
}

export function headerDescription(cfg: FormCustomizationConfig): string {
  const t = cfg.description.trim();
  return t || mockPaymentContext.purchaseDescription;
}
