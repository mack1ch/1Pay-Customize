import type { ReactNode } from 'react';
import { SkBlock, SkCircle } from '../../ui/skeleton/Skeleton';
import styles from './LkShell.module.css';

const NAV_TEXT_WIDTHS = [118, 96, 78, 88, 88, 96, 102, 88, 96, 110] as const;
const FOOTER_WIDTHS = ['88%', '92%', '62%', '48%'] as const;

export function LkShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar} aria-hidden>
        <div className={styles.brand}>
          <SkCircle size={32} />
          <SkBlock width={108} height={14} className={styles.brandTextSk} />
        </div>
        <nav className={styles.nav}>
          {NAV_TEXT_WIDTHS.map((w, i) => (
            <div
              key={i}
              className={i === 2 ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem}
            >
              <SkCircle size={18} />
              <SkBlock width={w} height={14} className={styles.navLine} />
            </div>
          ))}
        </nav>
        <div className={styles.sidebarFoot}>
          {FOOTER_WIDTHS.map((w, i) => (
            <div key={i} className={styles.footLine}>
              <SkBlock width={w} height={11} radius={4} />
            </div>
          ))}
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.topbarSpacer} />
          <div className={styles.topbarActions}>
            <span className={styles.topIconSlot}>
              <SkCircle size={20} />
            </span>
            <span className={styles.topIconSlot}>
              <SkCircle size={20} />
            </span>
            <span className={styles.topIconSlot}>
              <SkCircle size={20} />
            </span>
            <SkBlock width={72} height={32} radius={8} className={styles.balanceSk} />
          </div>
        </header>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
