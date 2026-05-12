import { useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Toasts from './components/Toasts.jsx';
import Dashboard from './pages/Dashboard.jsx';
import { useMonitors } from './hooks/useMonitors.js';
import { useTheme } from './hooks/useTheme.js';
import { useToast } from './hooks/useToast.js';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const themeState = useTheme();
  const monitorState = useMonitors();
  const toastState = useToast();

  return (
    <div className="soft-grid relative min-h-screen overflow-x-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen((value) => !value)}
        theme={themeState.theme}
        onToggleTheme={themeState.toggleTheme}
      />
      <Dashboard monitorState={monitorState} pushToast={toastState.pushToast} />
      <Toasts toasts={toastState.toasts} onDismiss={toastState.dismissToast} />
    </div>
  );
}
