import { useEffect, useState } from 'react';
import { writePreviewTransfer } from '../domain/previewPayload';
import { useCustomization } from '../state/useCustomization';
import type { PreviewContentScreen } from '../types/customization';
import { PageGradientBlobs } from './PageGradientBlobs';
import { MockPaymentForm } from './payment/MockPaymentForm';
import {
  readPreviewDevice,
  writePreviewDevice,
  type PreviewDevice,
} from './previewDevice';
import styles from './PreviewPanel.module.css';

export function PreviewPanel() {
  const { draft, previewTheme, appearanceMode, previewScreen } =
    useCustomization();
  const [device, setDevice] = useState<PreviewDevice>(() => readPreviewDevice());
  const [demoScreen, setDemoScreen] = useState<PreviewContentScreen | null>(null);

  useEffect(() => {
    writePreviewDevice(device);
  }, [device]);

  useEffect(() => {
    setDemoScreen(null);
  }, [previewScreen]);

  const effectivePreviewScreen = demoScreen ?? previewScreen;

  const openForm = () => {
    writePreviewTransfer(draft, device, appearanceMode, previewScreen);
    window.open(`${import.meta.env.BASE_URL}open-form`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={styles.root}>
      <div className={styles.head}>
        <div className={styles.headLeft}>
          <h2 className={styles.title}>Предпросмотр</h2>
          <div className={styles.toggle} role="group" aria-label="Устройство предпросмотра">
            <button
              type="button"
              className={device === 'desktop' ? `${styles.togBtn} ${styles.togActive}` : styles.togBtn}
              onClick={() => setDevice('desktop')}
            >
              Desktop
            </button>
            <button
              type="button"
              className={device === 'mobile' ? `${styles.togBtn} ${styles.togActive}` : styles.togBtn}
              onClick={() => setDevice('mobile')}
            >
              Mobile
            </button>
          </div>
        </div>
        <button type="button" className={styles.openLink} onClick={openForm}>
          Открыть форму
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M14 3h7v7M10 14L21 3M21 14v6a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div
        className={styles.canvasShell}
        style={{ backgroundColor: previewTheme.effectiveBgColor }}
      >
        <PageGradientBlobs
          variant="canvas"
          gradientStart={previewTheme.effectiveGradientStart}
          gradientEnd={previewTheme.effectiveGradientEnd}
        />
        <div className={styles.canvasScroll}>
          <div className={styles.previewContent}>
            <MockPaymentForm
              theme={previewTheme}
              config={draft}
              device={device}
              embedded
              previewScreen={effectivePreviewScreen}
              interactive
              onDemoPay={() => setDemoScreen('success')}
              onDemoNavigateToForm={() => setDemoScreen(null)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
