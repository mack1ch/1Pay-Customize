import {
  PAYMENT_STATUS_KINDS,
  PAYMENT_STATUS_LABEL,
} from '../../types/customization';
import { useCustomization } from '../../state/useCustomization';
import { errorsForAppearance } from '../../domain/validation';
import brandStyles from './BrandPanel.module.css';
import styles from './StatusPanel.module.css';

/** Для type=color: только RRGGBB (альфа отбрасывается). */
function swatchOnly(v: string) {
  const t = v.trim();
  if (t.startsWith('#') && t.length === 9) return `#${t.slice(1, 7)}`;
  if (t.startsWith('#') && t.length >= 4) return t.slice(0, 7);
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
  const swatch = swatchOnly(value);
  return (
    <div className={brandStyles.colorCell}>
      <span className={brandStyles.label}>{label}</span>
      <div className={brandStyles.colorBar}>
        <input
          type="color"
          className={brandStyles.colorBarWell}
          value={swatch}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          aria-label={`${label}, палитра`}
        />
        <input
          type="text"
          className={`${brandStyles.colorBarHex} ${error ? brandStyles.inputError : ''}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          maxLength={9}
          aria-label={label}
        />
      </div>
      {error ? (
        <span className={brandStyles.fieldError}>{error}</span>
      ) : null}
    </div>
  );
}

export function StatusPanel() {
  const {
    appearanceMode,
    setAppearanceMode,
    editingStatusKind: kind,
    setEditingStatusKind: setKind,
    draftVariant,
    updateStatusCustomization,
    fieldErrors,
    save,
    reset,
    isSaveEnabled,
    isResetEnabled,
  } = useCustomization();

  const st = draftVariant.statuses[kind];
  const sliceErrors = errorsForAppearance(fieldErrors, appearanceMode);
  const se = sliceErrors.statuses?.[kind] ?? {};

  return (
    <div className={brandStyles.root}>
      <div className={brandStyles.card}>
        <h2 className={brandStyles.cardTitle}>Тема оформления</h2>
        <p className={brandStyles.cardLead}>
          Отдельные настройки для светлой и тёмной темы на устройстве пользователя.
          Предпросмотр справа переключается вместе с выбранной темой.
        </p>
        <div
          className={brandStyles.formVariantToggle}
          role="group"
          aria-label="Какую тему настраивать"
        >
          <button
            type="button"
            className={
              appearanceMode === 'light'
                ? `${brandStyles.formVariantBtn} ${brandStyles.formVariantBtnActive}`
                : brandStyles.formVariantBtn
            }
            onClick={() => setAppearanceMode('light')}
          >
            Светлая
          </button>
          <button
            type="button"
            className={
              appearanceMode === 'dark'
                ? `${brandStyles.formVariantBtn} ${brandStyles.formVariantBtnActive}`
                : brandStyles.formVariantBtn
            }
            onClick={() => setAppearanceMode('dark')}
          >
            Тёмная
          </button>
        </div>
      </div>

      <div className={brandStyles.card}>
        <h2 className={brandStyles.cardTitle}>Вид статуса</h2>
        <p className={brandStyles.cardLead}>
          Четыре состояния: успех, ошибка, обработка, истечение срока формы.
        </p>
        <div className={styles.statusKindRow} role="tablist" aria-label="Статус">
          {PAYMENT_STATUS_KINDS.map((k) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={kind === k}
              className={
                kind === k ? `${styles.kindBtn} ${styles.kindBtnActive}` : styles.kindBtn
              }
              onClick={() => setKind(k)}
            >
              {PAYMENT_STATUS_LABEL[k]}
            </button>
          ))}
        </div>

        <div className={brandStyles.colorGroups}>
          <section
            className={brandStyles.colorGroup}
            aria-labelledby={`st-group-copy-${kind}`}
          >
            <h3 className={brandStyles.colorGroupTitle} id={`st-group-copy-${kind}`}>
              Тексты
            </h3>
            <p className={brandStyles.colorGroupLead}>
              Содержимое экрана статуса. Если поля пустые, подставятся title и
              description из ответа API.
            </p>
            <div className={styles.fieldBlock}>
              <label className={brandStyles.label} htmlFor={`st-title-${kind}`}>
                Заголовок
              </label>
              <textarea
                id={`st-title-${kind}`}
                className={`${styles.textArea} ${se.title ? brandStyles.inputError : ''}`}
                rows={2}
                value={st.title}
                onChange={(e) =>
                  updateStatusCustomization(kind, { title: e.target.value })
                }
              />
              {se.title ? (
                <span className={brandStyles.fieldError}>{se.title}</span>
              ) : null}
            </div>

            <div className={styles.fieldBlock}>
              <label className={brandStyles.label} htmlFor={`st-desc-${kind}`}>
                Описание
              </label>
              <textarea
                id={`st-desc-${kind}`}
                className={`${styles.textArea} ${se.description ? brandStyles.inputError : ''}`}
                rows={3}
                value={st.description}
                onChange={(e) =>
                  updateStatusCustomization(kind, { description: e.target.value })
                }
              />
              {se.description ? (
                <span className={brandStyles.fieldError}>{se.description}</span>
              ) : null}
            </div>

            <div className={styles.fieldBlock}>
              <label className={brandStyles.label} htmlFor={`st-cta-${kind}`}>
                Текст кнопки возврата
              </label>
              <textarea
                id={`st-cta-${kind}`}
                className={`${styles.textArea} ${se.ctaLabel ? brandStyles.inputError : ''}`}
                rows={2}
                value={st.ctaLabel}
                onChange={(e) =>
                  updateStatusCustomization(kind, { ctaLabel: e.target.value })
                }
              />
              {se.ctaLabel ? (
                <span className={brandStyles.fieldError}>{se.ctaLabel}</span>
              ) : null}
            </div>
          </section>

          <section
            className={brandStyles.colorGroup}
            aria-labelledby={`st-group-icon-${kind}`}
          >
            <h3 className={brandStyles.colorGroupTitle} id={`st-group-icon-${kind}`}>
              Иконка статуса
            </h3>
            <div className={brandStyles.colorGrid}>
              <ColorBar
                label="Фон вокруг иконки"
                value={st.iconBackdropColor}
                error={se.iconBackdropColor}
                onChange={(v) =>
                  updateStatusCustomization(kind, { iconBackdropColor: v })
                }
              />
              <ColorBar
                label="Цвет иконки"
                value={st.iconColor}
                error={se.iconColor}
                onChange={(v) => updateStatusCustomization(kind, { iconColor: v })}
              />
            </div>
          </section>

          <section
            className={brandStyles.colorGroup}
            aria-labelledby={`st-group-type-${kind}`}
          >
            <h3 className={brandStyles.colorGroupTitle} id={`st-group-type-${kind}`}>
              Заголовок и описание
            </h3>
            <div className={brandStyles.colorGrid}>
              <ColorBar
                label="Цвет заголовка"
                value={st.titleColor}
                error={se.titleColor}
                onChange={(v) =>
                  updateStatusCustomization(kind, { titleColor: v })
                }
              />
              <ColorBar
                label="Цвет описания"
                value={st.descriptionColor}
                error={se.descriptionColor}
                onChange={(v) =>
                  updateStatusCustomization(kind, { descriptionColor: v })
                }
              />
            </div>
          </section>

          <section
            className={brandStyles.colorGroup}
            aria-labelledby={`st-group-details-${kind}`}
          >
            <h3 className={brandStyles.colorGroupTitle} id={`st-group-details-${kind}`}>
              Блок деталей платежа
            </h3>
            <div className={brandStyles.colorGrid}>
              <ColorBar
                label="Фон карточки"
                value={st.detailsCardBg}
                error={se.detailsCardBg}
                onChange={(v) =>
                  updateStatusCustomization(kind, { detailsCardBg: v })
                }
              />
              <ColorBar
                label="Подписи полей"
                value={st.detailsLabelColor}
                error={se.detailsLabelColor}
                onChange={(v) =>
                  updateStatusCustomization(kind, { detailsLabelColor: v })
                }
              />
              <ColorBar
                label="Значения полей"
                value={st.detailsValueColor}
                error={se.detailsValueColor}
                onChange={(v) =>
                  updateStatusCustomization(kind, { detailsValueColor: v })
                }
              />
            </div>
          </section>

          <section
            className={brandStyles.colorGroup}
            aria-labelledby={`st-group-cta-${kind}`}
          >
            <h3 className={brandStyles.colorGroupTitle} id={`st-group-cta-${kind}`}>
              Кнопка возврата
            </h3>
            <div className={brandStyles.colorGrid}>
              <ColorBar
                label="Фон кнопки"
                value={st.ctaBackground}
                error={se.ctaBackground}
                onChange={(v) =>
                  updateStatusCustomization(kind, { ctaBackground: v })
                }
              />
              <ColorBar
                label="Основной текст"
                value={st.ctaTextColor}
                error={se.ctaTextColor}
                onChange={(v) =>
                  updateStatusCustomization(kind, { ctaTextColor: v })
                }
              />
              <ColorBar
                label="Дополнительный текст"
                value={st.ctaMutedColor}
                error={se.ctaMutedColor}
                onChange={(v) =>
                  updateStatusCustomization(kind, { ctaMutedColor: v })
                }
              />
            </div>
          </section>
        </div>
      </div>

      <div className={brandStyles.actions}>
        <button
          type="button"
          className={brandStyles.save}
          disabled={!isSaveEnabled}
          onClick={() => void save()}
        >
          Сохранить
        </button>
        <button
          type="button"
          className={brandStyles.reset}
          disabled={!isResetEnabled}
          onClick={reset}
        >
          Сбросить
        </button>
      </div>
    </div>
  );
}
