import type { CSSProperties } from 'react';
import styles from './Skeleton.module.css';

type SkBase = {
  active?: boolean;
  className?: string;
  style?: CSSProperties;
};

export function SkCircle({ size, active = true, className, style }: SkBase & { size: number }) {
  return (
    <span
      className={[styles.sk, styles.circle, active && styles.skActive, className].filter(Boolean).join(' ')}
      style={{ width: size, height: size, ...style }}
      aria-hidden
    />
  );
}

export function SkBlock({
  width,
  height = 16,
  radius = 4,
  active = true,
  className,
  style,
}: SkBase & {
  width: number | string;
  height?: number;
  radius?: number;
}) {
  return (
    <span
      className={[styles.sk, styles.block, active && styles.skActive, className].filter(Boolean).join(' ')}
      style={{
        width,
        height,
        borderRadius: radius,
        ...style,
      }}
      aria-hidden
    />
  );
}

export function SkPill({
  width,
  height = 24,
  active = true,
  className,
  style,
}: SkBase & { width: number | string; height?: number }) {
  return (
    <span
      className={[styles.sk, styles.pill, active && styles.skActive, className].filter(Boolean).join(' ')}
      style={{ width, height, ...style }}
      aria-hidden
    />
  );
}
