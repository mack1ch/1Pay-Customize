import type { FieldErrors, FormCustomizationConfig } from '../types/customization';

const HEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

export function isValidHex(value: string): boolean {
  return HEX.test(value.trim());
}

const MAX_NAME = 120;
const MAX_DESCRIPTION = 500;
const MAX_BUTTON = 200;
const LOGO_MAX_BYTES = 1024 * 1024;
const LOGO_MIME = new Set(['image/png', 'image/jpeg', 'image/svg+xml']);

export function validateConfig(config: FormCustomizationConfig): FieldErrors {
  const errors: FieldErrors = {};

  if (config.formName.length > MAX_NAME) {
    errors.formName = `Не более ${MAX_NAME} символов`;
  }

  if (config.description.length > MAX_DESCRIPTION) {
    errors.description = `Не более ${MAX_DESCRIPTION} символов`;
  }

  if (config.buttonText.length > MAX_BUTTON) {
    errors.buttonText = `Не более ${MAX_BUTTON} символов`;
  }

  if (!isValidHex(config.textColor)) {
    errors.textColor = 'Некорректный формат HEX';
  }
  if (!isValidHex(config.primaryColor)) {
    errors.primaryColor = 'Некорректный формат HEX';
  }
  if (!isValidHex(config.hoverColor)) {
    errors.hoverColor = 'Некорректный формат HEX';
  }
  if (!isValidHex(config.activeColor)) {
    errors.activeColor = 'Некорректный формат HEX';
  }
  if (!isValidHex(config.bgColor)) {
    errors.bgColor = 'Некорректный формат HEX';
  }
  if (!isValidHex(config.gradientStart)) {
    errors.gradientStart = 'Некорректный формат HEX';
  }
  if (!isValidHex(config.gradientEnd)) {
    errors.gradientEnd = 'Некорректный формат HEX';
  }

  return errors;
}

export function hasValidationErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

export async function validateLogoFile(file: File): Promise<string | null> {
  if (!LOGO_MIME.has(file.type)) {
    return 'Допустимы только PNG, JPG или SVG';
  }
  if (file.size > LOGO_MAX_BYTES) {
    return 'Размер файла не должен превышать 1 МБ';
  }
  return null;
}

export function normalizeHexForPreview(value: string, fallback: string): string {
  const v = value.trim();
  return isValidHex(v) ? v : fallback;
}
