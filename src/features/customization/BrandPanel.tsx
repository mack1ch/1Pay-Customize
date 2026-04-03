import { useRef } from 'react';
import { validateLogoFile } from '../../domain/validation';
import { clampFormBaseRadius, FORM_RADIUS_MAX } from '../../domain/formRadiusModel';
import { FONT_OPTIONS } from '../../domain/fonts';
import {
  PAYMENT_FORM_TYPES,
  type PaymentFormType,
} from '../../types/customization';
import { useCustomization } from '../../state/useCustomization';
import styles from './BrandPanel.module.css';

const FORM_VARIANT_LABEL: Record<PaymentFormType, string> = {
  card: 'Карта',
  sbp: 'СБП',
  multi: 'Мультиформа',
};

function normalizePickerHex(v: string) {
  if (v.startsWith('#') && v.length >= 4) return v.slice(0, 7);
  return '#000000';
}

function ColorBar({
  label,
  value,
  error,
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (v: string) => void;
}) {
  const swatch = normalizePickerHex(value);
  return (
    <div className={styles.colorCell}>
      <span className={styles.label}>{label}</span>
      <div className={styles.colorBar}>
        <span className={styles.colorBarSwatch} style={{ background: swatch }} aria-hidden />
        <input
          type="text"
          className={`${styles.colorBarHex} ${error ? styles.inputError : ''}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          maxLength={7}
          aria-label={label}
        />
        <input
          type="color"
          className={styles.colorBarWell}
          value={swatch}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          aria-label={`${label}, палитра`}
        />
      </div>
      {error ? <span className={styles.fieldError}>{error}</span> : null}
    </div>
  );
}

function GradientBar({
  start,
  end,
  errStart,
  errEnd,
  onStart,
  onEnd,
}: {
  start: string;
  end: string;
  errStart?: string;
  errEnd?: string;
  onStart: (v: string) => void;
  onEnd: (v: string) => void;
}) {
  const s1 = normalizePickerHex(start);
  const s2 = normalizePickerHex(end);
  return (
    <div className={styles.colorCell}>
      <span className={styles.label}>Градиент фона</span>
      <div className={styles.gradientBar}>
        <div className={styles.gradientChunk}>
          <span className={styles.colorBarSwatch} style={{ background: s1 }} aria-hidden />
          <input
            type="text"
            className={`${styles.colorBarHex} ${styles.gradientHex} ${errStart ? styles.inputError : ''}`}
            value={start}
            onChange={(e) => onStart(e.target.value)}
            spellCheck={false}
            maxLength={7}
            aria-label="Градиент, начало"
          />
          <input
            type="color"
            className={styles.colorBarWell}
            value={s1}
            onChange={(e) => onStart(e.target.value.toUpperCase())}
            aria-label="Градиент, начало, палитра"
          />
        </div>
        <span className={styles.gradientArrow} aria-hidden>
          →
        </span>
        <div className={styles.gradientChunk}>
          <span className={styles.colorBarSwatch} style={{ background: s2 }} aria-hidden />
          <input
            type="text"
            className={`${styles.colorBarHex} ${styles.gradientHex} ${errEnd ? styles.inputError : ''}`}
            value={end}
            onChange={(e) => onEnd(e.target.value)}
            spellCheck={false}
            maxLength={7}
            aria-label="Градиент, конец"
          />
          <input
            type="color"
            className={styles.colorBarWell}
            value={s2}
            onChange={(e) => onEnd(e.target.value.toUpperCase())}
            aria-label="Градиент, конец, палитра"
          />
        </div>
      </div>
      {errStart || errEnd ? (
        <span className={styles.fieldError}>{errStart ?? errEnd}</span>
      ) : null}
    </div>
  );
}

export function BrandPanel() {
  const {
    draft,
    editingFormType,
    setEditingFormType,
    updateDraft,
    setLogo,
    setLogoError,
    logoError,
    fieldErrors,
    save,
    reset,
    isSaveEnabled,
    isResetEnabled,
  } = useCustomization();

  const fileRef = useRef<HTMLInputElement>(null);

  const onPickLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setLogoError(null);
    const err = await validateLogoFile(file);
    if (err) {
      setLogoError(err);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result;
      if (typeof res === 'string') setLogo(res);
    };
    reader.readAsDataURL(file);
  };

  const r = clampFormBaseRadius(draft.borderRadius);

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Вариант формы</h2>
        <p className={styles.cardLead}>
          Отдельные настройки для оплаты картой, СБП и мультиформы. Предпросмотр и
          «Открыть форму» показывают выбранный вариант.
        </p>
        <div
          className={styles.formVariantToggle}
          role="group"
          aria-label="Какую форму настраивать"
        >
          {PAYMENT_FORM_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              className={
                editingFormType === t
                  ? `${styles.formVariantBtn} ${styles.formVariantBtnActive}`
                  : styles.formVariantBtn
              }
              onClick={() => setEditingFormType(t)}
            >
              {FORM_VARIANT_LABEL[t]}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Основное</h2>

        <div className={styles.row2}>
          <div className={styles.colName}>
            <label className={styles.label} htmlFor="formName">
              Название формы
            </label>
            <input
              id="formName"
              className={`${styles.textInput} ${fieldErrors.formName ? styles.inputError : ''}`}
              value={draft.formName}
              onChange={(e) => updateDraft({ formName: e.target.value })}
            />
            {fieldErrors.formName ? (
              <span className={styles.fieldError}>{fieldErrors.formName}</span>
            ) : null}
          </div>
          <div className={styles.colLogo}>
            <span className={styles.label}>Логотип</span>
            <div className={styles.logoRow}>
              <button
                type="button"
                className={styles.logoPick}
                onClick={() => fileRef.current?.click()}
                aria-label={
                  draft.logoDataUrl
                    ? 'Заменить логотип'
                    : 'Загрузить логотип'
                }
              >
                {draft.logoDataUrl ? (
                  <img src={draft.logoDataUrl} alt="" className={styles.logoPreview} />
                ) : draft.logoShowPlaceholder !== false ? (
                  <div className={styles.logoDefaultWrap} aria-hidden>
                    <span className={styles.logoDefaultMark}>
                      <span style={{ color: draft.textColor }}>1</span>
                      <span style={{ color: draft.primaryColor }}>P</span>
                    </span>
                  </div>
                ) : (
                  <div className={styles.logoEmptyWrap} aria-hidden />
                )}
              </button>
              {draft.logoDataUrl ? (
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => {
                    updateDraft({
                      logoDataUrl: null,
                      logoShowPlaceholder: false,
                    });
                    setLogoError(null);
                  }}
                >
                  Удалить
                </button>
              ) : draft.logoShowPlaceholder === false ? (
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => updateDraft({ logoShowPlaceholder: true })}
                >
                  Показать 1P
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => updateDraft({ logoShowPlaceholder: false })}
                >
                  Без логотипа
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept=".png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml"
                className={styles.hiddenFile}
                onChange={onPickLogo}
              />
            </div>
            <p className={styles.help}>
              «Удалить» убирает файл и место под логотип остаётся пустым. «Показать 1P» — снова заглушка.
              PNG, JPG, SVG до 1 МБ, рекомендуемый размер 36×150px.
            </p>
            {logoError ? <span className={styles.fieldError}>{logoError}</span> : null}
          </div>
        </div>

        <div className={styles.fieldBlock}>
          <label className={styles.label} htmlFor="desc">
            Описание формы
          </label>
          <input
            id="desc"
            className={`${styles.textInput} ${fieldErrors.description ? styles.inputError : ''}`}
            value={draft.description}
            onChange={(e) => updateDraft({ description: e.target.value })}
          />
          {fieldErrors.description ? (
            <span className={styles.fieldError}>{fieldErrors.description}</span>
          ) : null}
        </div>

        <div className={styles.fieldBlock}>
          <label className={styles.label} htmlFor="btn">
            Текст кнопки
          </label>
          <input
            id="btn"
            className={`${styles.textInput} ${fieldErrors.buttonText ? styles.inputError : ''}`}
            value={draft.buttonText}
            onChange={(e) => updateDraft({ buttonText: e.target.value })}
          />
          <p className={styles.help}>Доступна переменная {'{amount}'} — сумма платежа</p>
          {fieldErrors.buttonText ? (
            <span className={styles.fieldError}>{fieldErrors.buttonText}</span>
          ) : null}
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Цвета и стиль</h2>
        <p className={styles.cardLead}>
          Перекрасьте и поставьте чтобы изменить их будущее в форме.
        </p>

        <div className={styles.colorGrid}>
          <ColorBar
            label="Основной текст"
            value={draft.textColor}
            error={fieldErrors.textColor}
            onChange={(v) => updateDraft({ textColor: v })}
          />
          <ColorBar
            label="Основной цвет"
            value={draft.primaryColor}
            error={fieldErrors.primaryColor}
            onChange={(v) => updateDraft({ primaryColor: v })}
          />
          <ColorBar
            label="Цвет при наведении"
            value={draft.hoverColor}
            error={fieldErrors.hoverColor}
            onChange={(v) => updateDraft({ hoverColor: v })}
          />
          <ColorBar
            label="Цвет при нажатии"
            value={draft.activeColor}
            error={fieldErrors.activeColor}
            onChange={(v) => updateDraft({ activeColor: v })}
          />
          <ColorBar
            label="Цвет фона"
            value={draft.bgColor}
            error={fieldErrors.bgColor}
            onChange={(v) => updateDraft({ bgColor: v })}
          />
          <GradientBar
            start={draft.gradientStart}
            end={draft.gradientEnd}
            errStart={fieldErrors.gradientStart}
            errEnd={fieldErrors.gradientEnd}
            onStart={(v) => updateDraft({ gradientStart: v })}
            onEnd={(v) => updateDraft({ gradientEnd: v })}
          />
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Типографика</h2>
        <div className={styles.typoRow}>
          <div className={styles.typoCol}>
            <label className={styles.label} htmlFor="font">
              Шрифт
            </label>
            <select
              id="font"
              className={styles.select}
              value={draft.fontFamily}
              onChange={(e) => updateDraft({ fontFamily: e.target.value })}
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.typoCol}>
            <div className={styles.radiusLabelRow}>
              <label className={styles.label} htmlFor="radius">
                Скругление элементов
              </label>
              <span className={styles.radiusValBadge}>{r}px</span>
            </div>
            <div className={styles.radiusSliderRow}>
              <span className={styles.radiusEnd}>0px</span>
              <input
                id="radius"
                type="range"
                min={0}
                max={FORM_RADIUS_MAX}
                step={1}
                value={r}
                onChange={(e) =>
                  updateDraft({
                    borderRadius: clampFormBaseRadius(Number(e.target.value)),
                  })
                }
                className={styles.radiusRange}
              />
              <span className={styles.radiusEndMuted}>{FORM_RADIUS_MAX}px</span>
            </div>
            <div className={styles.radiusTicks}>
              <span>0px</span>
              <span>{FORM_RADIUS_MAX}px</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.save} disabled={!isSaveEnabled} onClick={() => void save()}>
          Сохранить
        </button>
        <button type="button" className={styles.reset} disabled={!isResetEnabled} onClick={reset}>
          Сбросить
        </button>
      </div>
    </div>
  );
}
