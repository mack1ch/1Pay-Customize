import type { ReactNode } from 'react';
import { SkBlock, SkCircle } from '../../ui/skeleton/Skeleton';
import styles from './WorkspaceEditorSkeleton.module.css';

function CardShell({ children }: { children: ReactNode }) {
  return <div className={styles.card}>{children}</div>;
}

export function WorkspaceEditorSkeleton() {
  return (
    <div className={styles.split}>
      <div className={styles.left}>
        <CardShell>
          <SkBlock width={140} height={20} radius={4} className={styles.cardTitle} />
          <div className={styles.row2}>
            <div className={styles.stack}>
              <SkBlock width={96} height={13} />
              <SkBlock width="100%" height={40} radius={4} />
            </div>
            <div className={styles.stack}>
              <SkBlock width={72} height={13} />
              <div className={styles.logoRow}>
                <SkBlock width={88} height={36} radius={4} />
                <SkBlock width={88} height={36} radius={4} />
              </div>
              <SkBlock width="85%" height={12} />
            </div>
          </div>
          <div className={styles.stackGap}>
            <SkBlock width={110} height={13} />
            <SkBlock width="100%" height={40} radius={4} />
          </div>
          <div className={styles.stackGap}>
            <SkBlock width={96} height={13} />
            <SkBlock width="100%" height={40} radius={4} />
            <SkBlock width="72%" height={12} />
          </div>
        </CardShell>

        <CardShell>
          <SkBlock width={160} height={20} radius={4} className={styles.cardTitle} />
          <SkBlock width="92%" height={14} className={styles.cardLead} />
          <div className={styles.colorGrid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.colorCell}>
                <SkBlock width={110} height={13} />
                <SkBlock width="100%" height={40} radius={4} />
              </div>
            ))}
          </div>
        </CardShell>

        <CardShell>
          <SkBlock width={140} height={20} radius={4} className={styles.cardTitle} />
          <div className={styles.typoRow}>
            <div className={styles.stack}>
              <SkBlock width={56} height={13} />
              <SkBlock width="100%" height={40} radius={4} />
            </div>
            <div className={styles.stack}>
              <div className={styles.radiusHead}>
                <SkBlock width={168} height={13} />
                <SkBlock width={36} height={14} />
              </div>
              <div className={styles.sliderRow}>
                <SkBlock width={28} height={14} />
                <SkBlock width="100%" height={8} radius={4} className={styles.sliderBar} />
                <SkBlock width={32} height={14} />
              </div>
              <div className={styles.sliderTicks}>
                <SkBlock width={24} height={10} />
                <SkBlock width={28} height={10} />
              </div>
            </div>
          </div>
        </CardShell>

        <div className={styles.actions}>
          <SkBlock width={112} height={40} radius={4} />
          <SkBlock width={100} height={40} radius={4} />
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.previewHead}>
          <div className={styles.previewHeadLeft}>
            <SkBlock width={118} height={18} />
            <div className={styles.toggle}>
              <SkBlock width={76} height={32} radius={6} />
              <SkBlock width={76} height={32} radius={6} />
            </div>
          </div>
          <SkBlock width={124} height={18} />
        </div>
        <div className={styles.previewCanvas}>
          <div className={styles.phone}>
            <div className={styles.phoneRow}>
              <SkBlock width={96} height={14} />
              <SkBlock width={56} height={14} />
              <SkCircle size={28} />
            </div>
            <SkBlock width="100%" height={120} radius={8} className={styles.phoneCard} />
            <SkBlock width="100%" height={100} radius={8} className={styles.phoneCard} />
            <SkBlock width="100%" height={180} radius={8} className={styles.phoneCard} />
          </div>
        </div>
      </div>
    </div>
  );
}
