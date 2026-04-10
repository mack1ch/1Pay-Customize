import { useCustomization } from '../../state/useCustomization';
import { useUnsavedChangesWarning } from '../../hooks/useUnsavedChangesWarning';
import { BrandPanel } from '../customization/BrandPanel';
import { StatusPanel } from '../customization/StatusPanel';
import { PreviewPanel } from '../../preview/PreviewPanel';
import { LkShell } from './LkShell';
import { WorkspaceEditorSkeleton } from './WorkspaceEditorSkeleton';
import type { CustomizationEditorTab } from '../../types/customization';
import styles from './WorkspacePage.module.css';

const TAB_LABEL: Record<CustomizationEditorTab, string> = {
  brand: 'Бренд и форма',
  statuses: 'Статусы',
};

const EDITOR_TABS: CustomizationEditorTab[] = ['brand', 'statuses'];

export function WorkspacePage() {
  const { isDirty, isLoading, toast, editorTab, setEditorTab } =
    useCustomization();

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

        {isLoading ? (
          <WorkspaceEditorSkeleton />
        ) : (
          <div className={styles.split}>
            <div className={styles.left}>
              <div
                className={styles.editorTabs}
                role="tablist"
                aria-label="Разделы кастомизации"
              >
                {EDITOR_TABS.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={editorTab === tab}
                    className={
                      editorTab === tab
                        ? `${styles.editorTab} ${styles.editorTabActive}`
                        : styles.editorTab
                    }
                    onClick={() => setEditorTab(tab)}
                  >
                    {TAB_LABEL[tab]}
                  </button>
                ))}
              </div>
              {editorTab === 'brand' ? <BrandPanel /> : null}
              {editorTab === 'statuses' ? <StatusPanel /> : null}
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
