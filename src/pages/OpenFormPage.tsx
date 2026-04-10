import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { readPreviewHandoff } from '../domain/previewPayload';
import {
  PAYMENT_STATUS_KINDS,
  PAYMENT_STATUS_LABEL,
  type AppearanceMode,
  type PreviewContentScreen,
} from '../types/customization';
import { buildPreviewTheme } from '../state/previewTheme';
import { PageGradientBlobs } from '../preview/PageGradientBlobs';
import { MockPaymentForm } from '../preview/payment/MockPaymentForm';
import styles from './OpenFormPage.module.css';

function useResolvedAppearance(handoff?: AppearanceMode): AppearanceMode {
  const [systemMode, setSystemMode] = useState<AppearanceMode>(() => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSystemMode(mq.matches ? 'dark' : 'light');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return handoff ?? systemMode;
}

export function OpenFormPage() {
  const [payload] = useState(() => readPreviewHandoff());
  const [viewScreen, setViewScreen] = useState<PreviewContentScreen>(() => {
    const p = readPreviewHandoff();
    return p?.previewScreen ?? 'form';
  });
  const appearance = useResolvedAppearance(payload?.previewAppearance);

  const themeAndConfig = useMemo(() => {
    if (!payload) return null;
    const { config, device } = payload;
    const theme = buildPreviewTheme(config, config, appearance);
    return { theme, config, device };
  }, [payload, appearance]);

  if (!themeAndConfig) {
    return (
      <div className={styles.fallback}>
        <p>Не удалось открыть предпросмотр: нет переданных настроек.</p>
        <p className={styles.muted}>
          Нажмите «Открыть форму» в редакторе — подставятся текущие правки, в том числе без сохранения —
          или вернитесь в <Link to="/">редактор</Link>.
        </p>
      </div>
    );
  }

  const { theme, config, device } = themeAndConfig;

  const pageBg = theme.effectiveBgColor;

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById('root');
    const prev = {
      html: html.style.backgroundColor,
      body: body.style.backgroundColor,
      root: root?.style.backgroundColor ?? '',
    };
    html.style.backgroundColor = pageBg;
    body.style.backgroundColor = pageBg;
    if (root) root.style.backgroundColor = pageBg;
    return () => {
      html.style.backgroundColor = prev.html;
      body.style.backgroundColor = prev.body;
      if (root) root.style.backgroundColor = prev.root;
    };
  }, [pageBg]);

  return (
    <div className={styles.page} style={{ backgroundColor: pageBg }}>
      <PageGradientBlobs
        variant="viewport"
        gradientStart={theme.effectiveGradientStart}
        gradientEnd={theme.effectiveGradientEnd}
      />
      <div className={styles.banner}>
        <div className={styles.bannerTop}>
          <span>Предпросмотр с текущими настройками (включая несохранённые)</span>
          <Link to="/" className={styles.back}>
            В редактор
          </Link>
        </div>
        <div
          className={styles.demoToolbar}
          role="toolbar"
          aria-label="Демо: выбор экрана предпросмотра"
        >
          <span className={styles.demoToolbarLabel}>Экран</span>
          <div className={styles.demoSeg}>
            <button
              type="button"
              className={
                viewScreen === 'form'
                  ? `${styles.demoBtn} ${styles.demoBtnActive}`
                  : styles.demoBtn
              }
              onClick={() => setViewScreen('form')}
            >
              Форма
            </button>
            {PAYMENT_STATUS_KINDS.map((k) => (
              <button
                key={k}
                type="button"
                className={
                  viewScreen === k
                    ? `${styles.demoBtn} ${styles.demoBtnActive}`
                    : styles.demoBtn
                }
                onClick={() => setViewScreen(k)}
              >
                {PAYMENT_STATUS_LABEL[k]}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.formWrap}>
        <MockPaymentForm
          theme={theme}
          config={config}
          device={device}
          previewScreen={viewScreen}
          interactive
          onDemoPay={() => setViewScreen('success')}
          onDemoNavigateToForm={() => setViewScreen('form')}
        />
      </div>
    </div>
  );
}
