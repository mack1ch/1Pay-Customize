import { describe, expect, it } from 'vitest';
import {
  clampFormBaseRadius,
  computeStackedCanvasFormRadii,
  FORM_RADIUS_MAX,
  sbpMobileBankLogoSlotRadiusPx,
} from './formRadiusModel';
import { resolveDraftBorderRadius } from '../state/previewTheme';

describe('clampFormBaseRadius', () => {
  it('коэрцирует строку (после JSON.parse)', () => {
    expect(clampFormBaseRadius('16')).toBe(16);
    expect(clampFormBaseRadius(' 10 ')).toBe(10);
  });

  it('сохраняет явный ноль', () => {
    expect(clampFormBaseRadius(0)).toBe(0);
    expect(clampFormBaseRadius('0')).toBe(0);
  });

  it('ограничивает диапазон', () => {
    expect(clampFormBaseRadius(99)).toBe(FORM_RADIUS_MAX);
    expect(clampFormBaseRadius(-3)).toBe(0);
  });

  it('битое значение → 0', () => {
    expect(clampFormBaseRadius('abc')).toBe(0);
    expect(clampFormBaseRadius(Number.NaN)).toBe(0);
  });
});

describe('resolveDraftBorderRadius', () => {
  it('пустое / null / undefined → дефолт 16', () => {
    expect(resolveDraftBorderRadius(undefined)).toBe(16);
    expect(resolveDraftBorderRadius(null)).toBe(16);
    expect(resolveDraftBorderRadius('')).toBe(16);
  });

  it('строка и число как в черновике', () => {
    expect(resolveDraftBorderRadius('8')).toBe(8);
    expect(resolveDraftBorderRadius(12)).toBe(12);
  });

  it('явный ноль в черновике — ноль', () => {
    expect(resolveDraftBorderRadius(0)).toBe(0);
    expect(resolveDraftBorderRadius('0')).toBe(0);
  });
});

/** Цепочка 4+4 как в 1Pay-Customize: 16 → 12 → 8 */
describe('computeStackedCanvasFormRadii', () => {
  it('при R=16: rSection=12, rControl=8', () => {
    const r = computeStackedCanvasFormRadii(16);
    expect(r.rForm).toBe(16);
    expect(r.rSection).toBe(12);
    expect(r.rControlPad24).toBe(8);
  });

  it('при R=0 всё нули', () => {
    const r = computeStackedCanvasFormRadii(0);
    expect(r.rForm).toBe(0);
    expect(r.rSection).toBe(0);
    expect(r.rControlPad24).toBe(0);
  });
});

/** СБП mobile: слот иконки внутри строки банка */
describe('sbpMobileBankLogoSlotRadiusPx', () => {
  it('0 при нулевом радиусе строки', () => {
    expect(sbpMobileBankLogoSlotRadiusPx(0)).toBe(0);
  });

  it('при rRow=8 и gap 10>8 — fallback шаг 4 → 4', () => {
    expect(sbpMobileBankLogoSlotRadiusPx(8)).toBe(4);
  });

  it('при rRow=12 и gap 10 — innerRadius(12,10)=2', () => {
    expect(sbpMobileBankLogoSlotRadiusPx(12)).toBe(2);
  });

  it('при rRow=16 — innerRadius(16,10)=6', () => {
    expect(sbpMobileBankLogoSlotRadiusPx(16)).toBe(6);
  });
});
