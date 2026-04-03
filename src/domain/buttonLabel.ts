import { DEFAULT_BUTTON_TEXT } from '../types/customization';

const AMOUNT_TOKEN = '{amount}';

export function resolveButtonLabel(
  raw: string,
  amountDisplay: string,
): string {
  const base = raw.trim() === '' ? DEFAULT_BUTTON_TEXT : raw;
  if (base.includes(AMOUNT_TOKEN)) {
    return base.split(AMOUNT_TOKEN).join(amountDisplay);
  }
  return base;
}
