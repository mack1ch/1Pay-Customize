import { rgbaFromHex } from "../domain/colorUtils";
import styles from "./PageGradientBlobs.module.css";

type Variant = "viewport" | "canvas";

interface Props {
  /** viewport — углы окна браузера (open-form); canvas — углы области предпросмотра */
  variant: Variant;
  gradientStart: string;
  gradientEnd: string;
}

export function PageGradientBlobs({
  variant,
  gradientStart,
  gradientEnd,
}: Props) {
  const layerClass =
    variant === "viewport" ? styles.layerViewport : styles.layerCanvas;

  return (
    <div className={layerClass} aria-hidden>
      <div
        className={`${styles.blob} ${styles.blobBl}`}
        style={{ background: rgbaFromHex(gradientStart, 0.2) }}
      />
      <div
        className={`${styles.blob} ${styles.blobTr}`}
        style={{ background: rgbaFromHex(gradientEnd, 0.2) }}
      />
    </div>
  );
}
