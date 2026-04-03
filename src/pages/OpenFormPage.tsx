import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { readPreviewHandoff } from '../domain/previewPayload';
import { buildPreviewTheme } from '../state/previewTheme';
import { PageGradientBlobs } from '../preview/PageGradientBlobs';
import { MockPaymentForm } from '../preview/payment/MockPaymentForm';
import styles from './OpenFormPage.module.css';

export function OpenFormPage() {
  const [payload] = useState(() => readPreviewHandoff());

  const themeAndConfig = useMemo(() => {
    if (!payload) return null;
    const { config, device } = payload;
    const theme = buildPreviewTheme(config, config);
    return { theme, config, device };
  }, [payload]);

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
        <span>Предпросмотр с текущими настройками (включая несохранённые)</span>
        <Link to="/" className={styles.back}>
          В редактор
        </Link>
      </div>
      <div className={styles.formWrap}>
        <MockPaymentForm theme={theme} config={config} device={device} />
      </div>
    </div>
  );
}
