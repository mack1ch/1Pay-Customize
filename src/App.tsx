import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { WorkspacePage } from './features/workspace/WorkspacePage';
import { OpenFormPage } from './pages/OpenFormPage';
import { CustomizationProvider } from './state/CustomizationProvider';
import styles from './App.module.css';

function EditorRoute() {
  return (
    <CustomizationProvider>
      <WorkspacePage />
    </CustomizationProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className={styles.layout}>
        <Routes>
          <Route path="/" element={<EditorRoute />} />
          <Route path="/open-form" element={<OpenFormPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
