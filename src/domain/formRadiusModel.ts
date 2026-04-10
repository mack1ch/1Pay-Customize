import { innerRadius } from './radii';

/** Максимум слайдера «Скругление элементов» (ТЗ) */
export const FORM_RADIUS_MAX = 16;

/**
 * Два шага вложенности: R_inner = max(0, round(R_outer − D)) (ТЗ).
 * Рабочий пример: R = 16, D₁ = 4, D₂ = 4 → секция 12px, контрол 8px.
 * Как в исходном репозитории 1Pay-Customize — стабильно реагирует на слайдер.
 */
export const D_NEST_FORM_TO_SECTION = 4;

export const D_NEST_SECTION_TO_CONTROL = 4;

/**
 * .sbpNewBankRow: padding по горизонтали — зазор от скруглённой кромки строки до слота иконки
 * (вложенное скругление: R_inner ≈ R_row − gap; см. vc.ru/design/218103-…).
 */
export const GAP_SBP_MOBILE_BANK_ROW_PAD_H_PX = 10;

/** Padding контента одиночной карты (только вёрстка, не формула скругления) */
export const D_SINGLE_CARD_CONTENT_PAD = 24;

/**
 * Нормализация 0…FORM_RADIUS_MAX. Принимает число или строку после JSON.parse.
 */
export function clampFormBaseRadius(value: unknown): number {
  let n: number;
  if (typeof value === 'number') {
    n = value;
  } else if (typeof value === 'string') {
    n = Number(value.trim());
  } else if (value === null || value === undefined || value === '') {
    return 0;
  } else {
    n = Number(value);
  }
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(FORM_RADIUS_MAX, Math.round(n)));
}

export type FormRadiusCssVars = {
  '--form-radius': string;
  '--form-radius-section': string;
  '--form-radius-control': string;
};

function cssVars(
  rForm: number,
  rSection: number,
  rControl: number,
): FormRadiusCssVars {
  return {
    '--form-radius': `${rForm}px`,
    '--form-radius-section': `${rSection}px`,
    '--form-radius-control': `${rControl}px`,
  };
}

/**
 * Одна белая карточка: внешний R, два шага по 4px до контролов.
 */
export function computeSingleCardFormRadii(baseR: number) {
  const R = clampFormBaseRadius(baseR);
  const rAfterFirst = innerRadius(R, D_NEST_FORM_TO_SECTION);
  const rControl = innerRadius(rAfterFirst, D_NEST_SECTION_TO_CONTROL);
  return {
    R,
    rForm: R,
    rSection: R,
    rControl,
    cssVars: cssVars(R, R, rControl),
  };
}

export type SingleCardFormRadii = ReturnType<typeof computeSingleCardFormRadii>;

/**
 * Колонка: rForm = R → белые секции → поля; два шага по 4px.
 */
export function computeStackedCanvasFormRadii(baseR: number) {
  const R = clampFormBaseRadius(baseR);
  const rSection = innerRadius(R, D_NEST_FORM_TO_SECTION);
  const rControl = innerRadius(rSection, D_NEST_SECTION_TO_CONTROL);
  return {
    R,
    rForm: R,
    rSection,
    rControlPad24: rControl,
    rControlPad14: rControl,
    cssVars: cssVars(R, rSection, rControl),
  };
}

/**
 * СБП desktop: страница → карточка → бейдж QR; два шага по 4px.
 */
export function computeSbpDesktopFormRadii(baseR: number) {
  const R = clampFormBaseRadius(baseR);
  const rSection = innerRadius(R, D_NEST_FORM_TO_SECTION);
  const rQrBadge = innerRadius(rSection, D_NEST_SECTION_TO_CONTROL);
  return {
    R,
    rForm: R,
    rSection,
    rQrBadge,
    cssVars: cssVars(R, rSection, rQrBadge),
  };
}

/**
 * СБП mobile: слот иконки банка внутри строки со скруглением `bankRowOuterRadiusPx`.
 * Сначала вычитаем фактический padding строки; если получается 0 — шаг D как у остальной цепочки.
 */
export function sbpMobileBankLogoSlotRadiusPx(bankRowOuterRadiusPx: number): number {
  if (bankRowOuterRadiusPx <= 0) return 0;
  const fromPad = innerRadius(
    bankRowOuterRadiusPx,
    GAP_SBP_MOBILE_BANK_ROW_PAD_H_PX,
  );
  if (fromPad > 0) return fromPad;
  return innerRadius(bankRowOuterRadiusPx, D_NEST_SECTION_TO_CONTROL);
}
