import { useState } from 'react';
import { Plus, RefreshCcw } from 'lucide-react';
import DashboardCards from '../components/DashboardCards.jsx';
import MonitorTable from '../components/MonitorTable.jsx';
import LogsView from '../components/LogsView.jsx';
import AddMonitorModal from '../components/AddMonitorModal.jsx';
import { createMonitor, deleteMonitor, updateMonitor } from '../services/api';

export default function Dashboard({ monitorState, pushToast }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    monitors,
    logs,
    selectedId,
    selectedMonitor,
    isLoading,
    isRefreshing,
    error,
    loadDashboard,
    selectMonitor
  } = monitorState;

  async function handleCreateMonitor(data) {
    setIsSubmitting(true);
    try {
      await createMonitor(data);
      setIsModalOpen(false);
      pushToast({ title: 'Monitor added', message: 'PulseCheck will begin collecting checks shortly.' });
      await loadDashboard();
    } catch (err) {
      pushToast({ type: 'error', title: 'Could not add monitor', message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteMonitor(id) {
    try {
      await deleteMonitor(id);
      pushToast({ title: 'Monitor deleted', message: 'The monitor and its logs were removed.' });
      await loadDashboard();
    } catch (err) {
      pushToast({ type: 'error', title: 'Delete failed', message: err.message });
    }
  }

  async function handleToggleMonitor(monitor) {
    try {
      await updateMonitor(monitor.id, { isActive: !monitor.isActive });
      pushToast({
        title: monitor.isActive ? 'Monitor paused' : 'Monitor resumed',
        message: monitor.url
      });
      await loadDashboard({ silent: true });
    } catch (err) {
      pushToast({ type: 'error', title: 'Update failed', message: err.message });
    }
  }

  return (
    <main id="dashboard" className="min-w-0 flex-1 px-4 pb-6 pt-16 lg:ml-[284px] lg:pl-1 lg:pr-6 lg:pt-6">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold text-teal-700 dark:text-teal-300">Real-time operations</p>
            <h1 className="mt-1.5 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Uptime Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">Monitor services in real-time with clean status signals, latency history, and fast controls.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => loadDashboard({ silent: true })}
              className="focus-ring inline-flex items-center gap-2 rounded-xl border border-slate-900/5 bg-white/70 px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-soft transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
            >
              <RefreshCcw className={isRefreshing ? 'animate-spin' : ''} size={15} />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="focus-ring inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-slate-800 to-teal-700 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 dark:from-slate-200 dark:to-teal-200 dark:text-slate-950"
            >
              <Plus size={16} />
              Add Monitor
            </button>
          </div>
        </header>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="mt-6">
          <DashboardCards monitors={monitors} isLoading={isLoading} />
        </div>

        <div className="mt-5 grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(330px,0.75fr)]">
          <MonitorTable
            monitors={monitors}
            selectedId={selectedId}
            onSelect={selectMonitor}
            onDelete={handleDeleteMonitor}
            onToggle={handleToggleMonitor}
            isLoading={isLoading}
          />
          <LogsView monitor={selectedMonitor} logs={logs} isLoading={isLoading} />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="focus-ring fixed bottom-5 right-5 z-30 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-slate-800 to-teal-700 text-white shadow-xl shadow-slate-900/20 transition hover:-translate-y-1 sm:hidden"
        aria-label="Add monitor"
      >
        <Plus size={21} />
      </button>

      <AddMonitorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateMonitor}
        isSubmitting={isSubmitting}
      />
    </main>
  );
}
