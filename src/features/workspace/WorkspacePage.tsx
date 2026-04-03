import { useCustomization } from '../../state/useCustomization';
import { useUnsavedChangesWarning } from '../../hooks/useUnsavedChangesWarning';
import { BrandPanel } from '../customization/BrandPanel';
import { PreviewPanel } from '../../preview/PreviewPanel';
import { LkShell } from './LkShell';
import { WorkspaceEditorSkeleton } from './WorkspaceEditorSkeleton';
import styles from './WorkspacePage.module.css';

export function WorkspacePage() {
  const { isDirty, isLoading, toast } = useCustomization();

  useUnsavedChangesWarning(
    isDirty,
    'Есть несохранённые изменения. Выйти со страницы?',
  );

  return (
    <LkShell>
      <div className={styles.workspace}>
        {toast ? (
          <div className={styles.toast} role="status">
            {toast}
          </div>
        ) : null}

        {isLoading ? <WorkspaceEditorSkeleton /> : (
          <div className={styles.split}>
            <div className={styles.left}>
              <BrandPanel />
            </div>
            <div className={styles.right}>
              <PreviewPanel />
            </div>
          </div>
        )}
      </div>
    </LkShell>
  );
}
