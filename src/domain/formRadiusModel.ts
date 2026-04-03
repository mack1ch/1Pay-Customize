import { innerRadius } from './radii';

/** Максимум слайдера «Скругление элементов» (ТЗ) */
export const FORM_RADIUS_MAX = 16;

export function clampFormBaseRadius(r: number): number {
  if (!Number.isFinite(r)) return 0;
  return Math.max(0, Math.min(FORM_RADIUS_MAX, Math.round(r)));
}

/**
 * Шаги вложенности для формулы R_inner = max(0, round(R_parent − D)) (ТЗ).
 *
 * В макете padding колонки/карточки (16px, 24px) задаёт отступы контента, но при
 * R_max = 16 и D = 16 получается r_section = 0 и r_control = 0 — слайдер не меняет вид.
 * Рабочий пример из ТЗ: R = 16, D₁ = 4, D₂ = 4 → секция 12px, контрол 8px.
 * Здесь D — именно шаг для цепочки скруглений, согласованный с этим примером.
 */
export const D_NEST_FORM_TO_SECTION = 4;

export const D_NEST_SECTION_TO_CONTROL = 4;

/** Padding внутри одиночной карточной формы (только вёрстка, не формула скругления) */
export const D_SINGLE_CARD_CONTENT_PAD = 20;

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
 * Одна белая карточка: внешний R, затем два шага 4px до контролов (как в примере ТЗ).
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

/**
 * Колонка (rForm = R) → белые секции → контролы; два шага по 4px.
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
 * СБП desktop: колонка → карточка → бейдж QR; два шага по 4px.
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
