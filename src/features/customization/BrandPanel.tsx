import { useRef } from 'react';
import { validateLogoFile, errorsForAppearance } from '../../domain/validation';
import { clampFormBaseRadius, FORM_RADIUS_MAX } from '../../domain/formRadiusModel';
import { resolveDraftBorderRadius } from '../../state/previewTheme';
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
        <input
          type="color"
          className={styles.colorBarWell}
          value={swatch}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          aria-label={`${label}, палитра`}
        />
        <input
          type="text"
          className={`${styles.colorBarHex} ${error ? styles.inputError : ''}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          maxLength={7}
          aria-label={label}
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
      <span className={styles.label}>Градиент боковых засветов</span>
      <div className={styles.gradientBar}>
        <div className={styles.gradientChunk}>
          <input
            type="color"
            className={styles.colorBarWell}
            value={s1}
            onChange={(e) => onStart(e.target.value.toUpperCase())}
            aria-label="Градиент, начало, палитра"
          />
          <input
            type="text"
            className={`${styles.colorBarHex} ${styles.gradientHex} ${errStart ? styles.inputError : ''}`}
            value={start}
            onChange={(e) => onStart(e.target.value)}
            spellCheck={false}
            maxLength={7}
            aria-label="Градиент, начало"
          />
        </div>
        <span className={styles.gradientArrow} aria-hidden>
          →
        </span>
        <div className={styles.gradientChunk}>
          <input
            type="color"
            className={styles.colorBarWell}
            value={s2}
            onChange={(e) => onEnd(e.target.value.toUpperCase())}
            aria-label="Градиент, конец, палитра"
          />
          <input
            type="text"
            className={`${styles.colorBarHex} ${styles.gradientHex} ${errEnd ? styles.inputError : ''}`}
            value={end}
            onChange={(e) => onEnd(e.target.value)}
            spellCheck={false}
            maxLength={7}
            aria-label="Градиент, конец"
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
    draftVariant,
    appearanceMode,
    setAppearanceMode,
    editingFormType,
    setEditingFormType,
    updateDraft,
    updateVariant,
    updateSbpCustomization,
    setLogo,
    setLogoError,
    logoError,
    fieldErrors,
    save,
    reset,
    isSaveEnabled,
    isResetEnabled,
  } = useCustomization();

  const variantErrors = errorsForAppearance(fieldErrors, appearanceMode);
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

  const r = resolveDraftBorderRadius(draft.borderRadius);
  const sbp = draftVariant.sbp;

  const applyRadiusFromRange = (el: HTMLInputElement) => {
    const v = el.valueAsNumber;
    const n = Number.isFinite(v) ? v : Number(el.value);
    updateDraft({ borderRadius: clampFormBaseRadius(n) });
  };

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
        <h2 className={styles.cardTitle}>Тема на устройстве</h2>
        <p className={styles.cardLead}>
          Настройте отдельно светлое и тёмное оформление — на устройстве пользователя
          будет применяться вариант, соответствующий системной теме.
        </p>
        <div
          className={styles.formVariantToggle}
          role="group"
          aria-label="Светлая или тёмная тема"
        >
          <button
            type="button"
            className={
              appearanceMode === 'light'
                ? `${styles.formVariantBtn} ${styles.formVariantBtnActive}`
                : styles.formVariantBtn
            }
            onClick={() => setAppearanceMode('light')}
          >
            Светлая
          </button>
          <button
            type="button"
            className={
              appearanceMode === 'dark'
                ? `${styles.formVariantBtn} ${styles.formVariantBtnActive}`
                : styles.formVariantBtn
            }
            onClick={() => setAppearanceMode('dark')}
          >
            Тёмная
          </button>
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Основное</h2>

        <div className={styles.row2}>
          <div className={styles.colName}>
            <label className={styles.label} htmlFor="formName">
              Название формы
            </label>
            <textarea
              id="formName"
              className={`${styles.textArea} ${variantErrors.formName ? styles.inputError : ''}`}
              rows={2}
              value={draftVariant.formName}
              onChange={(e) => updateVariant({ formName: e.target.value })}
            />
            {variantErrors.formName ? (
              <span className={styles.fieldError}>{variantErrors.formName}</span>
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
                      <span style={{ color: draftVariant.textColor }}>1</span>
                      <span style={{ color: draftVariant.primaryColor }}>P</span>
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
          <textarea
            id="desc"
            className={`${styles.textArea} ${variantErrors.description ? styles.inputError : ''}`}
            rows={3}
            value={draftVariant.description}
            onChange={(e) => updateVariant({ description: e.target.value })}
          />
          {variantErrors.description ? (
            <span className={styles.fieldError}>{variantErrors.description}</span>
          ) : null}
        </div>

        <p className={styles.help}>
          Если название или описание не переданы в кастомизации (пустые строки), на форме
          будут показаны значения из ответа API — поля title и description.
        </p>

        <div className={styles.fieldBlock}>
          <label className={styles.label} htmlFor="btn">
            Текст кнопки
          </label>
          <textarea
            id="btn"
            className={`${styles.textArea} ${variantErrors.buttonText ? styles.inputError : ''}`}
            rows={2}
            value={draftVariant.buttonText}
            onChange={(e) => updateVariant({ buttonText: e.target.value })}
          />
          <p className={styles.help}>Доступна переменная {'{amount}'} — сумма платежа</p>
          {variantErrors.buttonText ? (
            <span className={styles.fieldError}>{variantErrors.buttonText}</span>
          ) : null}
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Цвета и стиль</h2>
        <p className={styles.cardLead}>
          Цвета относятся к выбранной теме на устройстве (светлой или тёмной). Ниже они
          сгруппированы по назначению.
        </p>

        <div className={styles.colorGroups}>
          <section
            className={styles.colorGroup}
            aria-labelledby="color-group-text"
          >
            <h3 className={styles.colorGroupTitle} id="color-group-text">
              Текст
            </h3>
            <p className={styles.colorGroupLead}>
              Основной — суммы и заголовки; дополнительный — описания, подписи к полям,
              юридический текст и футер; подсказки — плейсхолдеры и поиск в СБП; последний
              — надпись на зелёной кнопке «Оплатить».
            </p>
        <div className={styles.colorGrid}>
          <ColorBar
            label="Основной текст"
                value={draftVariant.textColor}
                error={variantErrors.textColor}
                onChange={(v) => updateVariant({ textColor: v })}
              />
              <ColorBar
                label="Дополнительный текст"
                value={draftVariant.mutedTextColor}
                error={variantErrors.mutedTextColor}
                onChange={(v) => updateVariant({ mutedTextColor: v })}
              />
              <ColorBar
                label="Приглушённые подсказки"
                value={draftVariant.subtleTextColor}
                error={variantErrors.subtleTextColor}
                onChange={(v) => updateVariant({ subtleTextColor: v })}
              />
              <ColorBar
                label="Текст на кнопке оплаты"
                value={draftVariant.onPrimaryTextColor}
                error={variantErrors.onPrimaryTextColor}
                onChange={(v) => updateVariant({ onPrimaryTextColor: v })}
              />
            </div>
          </section>

          <section
            className={styles.colorGroup}
            aria-labelledby="color-group-accent"
          >
            <h3 className={styles.colorGroupTitle} id="color-group-accent">
              Акцент и кнопка
            </h3>
            <p className={styles.colorGroupLead}>
              Заливка кнопки «Оплатить» и связанные оттенки при наведении и нажатии.
            </p>
            <div className={styles.colorGrid}>
          <ColorBar
            label="Основной цвет"
                value={draftVariant.primaryColor}
                error={variantErrors.primaryColor}
                onChange={(v) => updateVariant({ primaryColor: v })}
          />
          <ColorBar
            label="Цвет при наведении"
                value={draftVariant.hoverColor}
                error={variantErrors.hoverColor}
                onChange={(v) => updateVariant({ hoverColor: v })}
          />
          <ColorBar
            label="Цвет при нажатии"
                value={draftVariant.activeColor}
                error={variantErrors.activeColor}
                onChange={(v) => updateVariant({ activeColor: v })}
              />
            </div>
          </section>

          <section
            className={styles.colorGroup}
            aria-labelledby="color-group-page-bg"
          >
            <h3 className={styles.colorGroupTitle} id="color-group-page-bg">
              Фон страницы
            </h3>
            <p className={styles.colorGroupLead}>
              Заливка за карточкой и цвета боковых градиентных пятен на превью.
            </p>
            <div className={styles.colorGrid}>
          <ColorBar
            label="Цвет фона"
                value={draftVariant.bgColor}
                error={variantErrors.bgColor}
                onChange={(v) => updateVariant({ bgColor: v })}
          />
          <GradientBar
                start={draftVariant.gradientStart}
                end={draftVariant.gradientEnd}
                errStart={variantErrors.gradientStart}
                errEnd={variantErrors.gradientEnd}
                onStart={(v) => updateVariant({ gradientStart: v })}
                onEnd={(v) => updateVariant({ gradientEnd: v })}
              />
            </div>
          </section>

          <section
            className={styles.colorGroup}
            aria-labelledby="color-group-card"
          >
            <h3 className={styles.colorGroupTitle} id="color-group-card">
              Карточка формы
            </h3>
            <p className={styles.colorGroupLead}>
              Белая (или тёмная) подложка с полями и обводка вокруг неё.
            </p>
            <div className={styles.colorGrid}>
              <ColorBar
                label="Фон карточки"
                value={draftVariant.cardBackground}
                error={variantErrors.cardBackground}
                onChange={(v) => updateVariant({ cardBackground: v })}
              />
              <ColorBar
                label="Обводка карточки"
                value={draftVariant.cardBorderColor}
                error={variantErrors.cardBorderColor}
                onChange={(v) => updateVariant({ cardBorderColor: v })}
              />
            </div>
          </section>

          <section
            className={styles.colorGroup}
            aria-labelledby="color-group-inputs"
          >
            <h3 className={styles.colorGroupTitle} id="color-group-inputs">
              Поля ввода
            </h3>
            <p className={styles.colorGroupLead}>
              Рамка и фон полей номера карты, срока и CVV.
            </p>
            <div className={styles.colorGrid}>
              <ColorBar
                label="Обводка полей ввода"
                value={draftVariant.inputBorderColor}
                error={variantErrors.inputBorderColor}
                onChange={(v) => updateVariant({ inputBorderColor: v })}
              />
              <ColorBar
                label="Фон полей ввода"
                value={draftVariant.inputFillColor}
                error={variantErrors.inputFillColor}
                onChange={(v) => updateVariant({ inputFillColor: v })}
              />
            </div>
          </section>
        </div>
      </div>

      {editingFormType === 'sbp' ? (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>СБП и QR-код</h2>
          <p className={styles.cardLead}>
            Тексты и цвета, специфичные для экрана оплаты по СБП и QR (отдельно от карты).
            Настраиваются для текущей темы (светлой / тёмной).
          </p>

          <div className={styles.fieldBlock}>
            <label className={styles.label} htmlFor="sbpQrTitle">
              Заголовок у QR
            </label>
            <textarea
              id="sbpQrTitle"
              className={`${styles.textArea} ${variantErrors.sbp?.instructionTitle ? styles.inputError : ''}`}
              rows={2}
              value={sbp.instructionTitle}
              onChange={(e) =>
                updateSbpCustomization({ instructionTitle: e.target.value })
              }
            />
            {variantErrors.sbp?.instructionTitle ? (
              <span className={styles.fieldError}>
                {variantErrors.sbp.instructionTitle}
              </span>
            ) : null}
          </div>

          <div className={styles.fieldBlock}>
            <label className={styles.label} htmlFor="sbpQrText">
              Текст у QR
            </label>
            <textarea
              id="sbpQrText"
              className={`${styles.textArea} ${variantErrors.sbp?.instructionText ? styles.inputError : ''}`}
              rows={3}
              value={sbp.instructionText}
              onChange={(e) =>
                updateSbpCustomization({ instructionText: e.target.value })
              }
            />
            {variantErrors.sbp?.instructionText ? (
              <span className={styles.fieldError}>
                {variantErrors.sbp.instructionText}
              </span>
            ) : null}
          </div>

          <div className={styles.fieldBlock}>
            <label className={styles.label} htmlFor="sbpSearchPh">
              Плейсхолдер поиска банка
            </label>
            <textarea
              id="sbpSearchPh"
              className={`${styles.textArea} ${variantErrors.sbp?.bankSearchPlaceholder ? styles.inputError : ''}`}
              rows={2}
              value={sbp.bankSearchPlaceholder}
              onChange={(e) =>
                updateSbpCustomization({ bankSearchPlaceholder: e.target.value })
              }
            />
            {variantErrors.sbp?.bankSearchPlaceholder ? (
              <span className={styles.fieldError}>
                {variantErrors.sbp.bankSearchPlaceholder}
              </span>
            ) : null}
          </div>

          <div className={styles.colorGrid}>
            <ColorBar
              label="Фон поля поиска"
              value={sbp.searchFieldBg}
              error={variantErrors.sbp?.searchFieldBg}
              onChange={(v) => updateSbpCustomization({ searchFieldBg: v })}
            />
            <ColorBar
              label="Фон строки банка"
              value={sbp.bankRowBg}
              error={variantErrors.sbp?.bankRowBg}
              onChange={(v) => updateSbpCustomization({ bankRowBg: v })}
            />
            <ColorBar
              label="Рамка строки банка"
              value={sbp.bankRowBorder}
              error={variantErrors.sbp?.bankRowBorder}
              onChange={(v) => updateSbpCustomization({ bankRowBorder: v })}
            />
            <ColorBar
              label="QR: тёмные модули"
              value={sbp.qrDarkModule}
              error={variantErrors.sbp?.qrDarkModule}
              onChange={(v) => updateSbpCustomization({ qrDarkModule: v })}
            />
            <ColorBar
              label="QR: светлые модули"
              value={sbp.qrLightModule}
              error={variantErrors.sbp?.qrLightModule}
              onChange={(v) => updateSbpCustomization({ qrLightModule: v })}
            />
          </div>
        </div>
      ) : null}

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
                onInput={(e) => applyRadiusFromRange(e.currentTarget)}
                onChange={(e) => applyRadiusFromRange(e.currentTarget)}
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
