/** R_inner = R_outer − D; clamp to 0, round to integer (ТЗ). */
export function innerRadius(outerPx: number, paddingPx: number): number {
  return Math.max(0, Math.round(outerPx - paddingPx));
}
