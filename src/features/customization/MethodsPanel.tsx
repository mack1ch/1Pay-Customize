import { useCustomization } from '../../state/useCustomization';
import styles from './Panels.module.css';

export function MethodsPanel() {
  const { draft, updateDraft } = useCustomization();

  if (draft.formType !== 'multi') {
    return (
      <div className={`${styles.panelCard} ${styles.placeholder}`}>
        <p className={styles.phTitle}>Методы оплаты</p>
        <p className={styles.phText}>
          Переключение блоков быстрой оплаты доступно для типа формы «Мультиформа».
          Выберите «Мультиформа» в разделе «Бренд».
        </p>
      </div>
    );
  }

  const m = draft.multiformMethods;

  return (
    <div className={styles.panelCard}>
      <h2 className={styles.sectionTitle}>Методы в мультиформе</h2>
      <p className={styles.hint}>
        Отключённые методы скрываются в предпросмотре (ТЗ п. 7.3.3).
      </p>
      <div className={styles.checkList}>
        <label className={styles.checkRow}>
          <input
            type="checkbox"
            checked={m.sbpQuick}
            onChange={(e) =>
              updateDraft({
                multiformMethods: { ...m, sbpQuick: e.target.checked },
              })
            }
          />
          <span>Быстрая оплата — СБП</span>
        </label>
        <label className={styles.checkRow}>
          <input
            type="checkbox"
            checked={m.payQuick}
            onChange={(e) =>
              updateDraft({
                multiformMethods: { ...m, payQuick: e.target.checked },
              })
            }
          />
          <span>Быстрая оплата — Pay</span>
        </label>
        <label className={styles.checkRow}>
          <input
            type="checkbox"
            checked={m.card}
            onChange={(e) =>
              updateDraft({
                multiformMethods: { ...m, card: e.target.checked },
              })
            }
          />
          <span>Оплата картой</span>
        </label>
      </div>
    </div>
  );
}
