import { Pause, Play, Trash2 } from 'lucide-react';
import clsx from 'clsx';

function getStatus(monitor) {
  if (!monitor.isActive) return { label: 'PAUSED', tone: 'muted' };
  if (monitor.latestCheck?.status === 'UP') return { label: 'UP', tone: 'up' };
  if (monitor.latestCheck?.status === 'DOWN') return { label: 'DOWN', tone: 'down' };
  return { label: 'WAITING', tone: 'muted' };
}

function StatusBadge({ status }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
        status.tone === 'up' && 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-300',
        status.tone === 'down' && 'bg-red-500/12 text-red-600 dark:text-red-300',
        status.tone === 'muted' && 'bg-slate-500/10 text-slate-500 dark:text-slate-300'
      )}
    >
      <span
        className={clsx(
          'h-1.5 w-1.5 rounded-full',
          status.tone === 'up' && 'bg-emerald-500',
          status.tone === 'down' && 'bg-red-500',
          status.tone === 'muted' && 'bg-slate-400'
        )}
      />
      {status.label}
    </span>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-2.5 p-3.5">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-12 animate-pulse rounded-xl bg-slate-300/40 dark:bg-white/10" />
      ))}
    </div>
  );
}

export default function MonitorTable({ monitors, selectedId, onSelect, onDelete, onToggle, isLoading }) {
  return (
    <section id="monitors" className="glass-panel-strong overflow-hidden rounded-2xl">
      <div className="flex flex-col gap-1.5 border-b border-slate-900/5 px-4 py-3.5 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950 dark:text-white">Monitors</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Live endpoint health and controls.</p>
        </div>
      </div>

      {isLoading ? (
        <SkeletonRows />
      ) : monitors.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">No monitors yet</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Add an endpoint to begin collecting uptime checks.</p>
        </div>
      ) : (
        <>
          <div className="hidden lg:block">
            <div className="min-w-[740px]">
              <div className="grid grid-cols-[minmax(220px,1.4fr)_90px_90px_120px_130px] gap-1 px-4 py-2.5 text-[11px] font-semibold uppercase text-slate-400">
                <span>URL</span>
                <span>Status</span>
                <span>Uptime</span>
                <span>Response</span>
                <span>Actions</span>
              </div>
              <div className="divide-y divide-slate-900/5 dark:divide-white/10">
                {monitors.map((monitor) => {
                  const status = getStatus(monitor);
                  return (
                    <div
                      key={monitor.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => onSelect(monitor.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          onSelect(monitor.id);
                        }
                      }}
                      className={clsx(
                        'grid w-full cursor-pointer grid-cols-[minmax(210px,1.2fr)_90px_90px_110px_130px] items-center gap-1 px-6 py-3 text-left transition hover:bg-white/50 focus:outline-none focus:ring-4 focus:ring-teal-600/10 dark:hover:bg-white/[0.06]',
                        selectedId === monitor.id && 'bg-teal-700/[0.07] dark:bg-teal-300/10'
                      )}
                    >
                      <span className="min-w-0 break-words text-xs font-medium text-slate-900 dark:text-white">{monitor.url}</span>
                      <StatusBadge status={status} />
                      <span className="text-xs text-slate-600 dark:text-slate-300">{monitor.stats?.uptimePercentage ?? '--'}%</span>
                      <span className="text-xs text-slate-600 dark:text-slate-300">{monitor.latestCheck?.responseTime ?? monitor.stats?.avgResponseTime ?? '--'} ms</span>
                      <span className="flex items-center gap-1.5" onClick={(event) => event.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onToggle(monitor)}
                          className="focus-ring grid h-8 w-8 place-items-center rounded-lg bg-slate-950/5 text-slate-600 transition hover:bg-slate-950/10 dark:bg-white/10 dark:text-slate-200"
                          aria-label={monitor.isActive ? 'Pause monitor' : 'Resume monitor'}
                        >
                          {monitor.isActive ? <Pause size={14} /> : <Play size={14} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(monitor.id)}
                          className="focus-ring grid h-8 w-8 place-items-center rounded-lg bg-red-500/10 text-red-600 transition hover:bg-red-500/15 dark:text-red-300"
                          aria-label="Delete monitor"
                        >
                          <Trash2 size={14} />
                        </button>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid gap-2.5 p-3.5 lg:hidden">
            {monitors.map((monitor) => {
              const status = getStatus(monitor);
              return (
                <article
                  key={monitor.id}
                  className={clsx(
                    'rounded-xl border border-slate-900/5 bg-white/55 p-3.5 dark:border-white/10 dark:bg-white/[0.06]',
                    selectedId === monitor.id && 'ring-2 ring-teal-600/20 dark:ring-teal-300/20'
                  )}
                >
                  <button type="button" onClick={() => onSelect(monitor.id)} className="block w-full text-left">
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 break-words text-xs font-medium text-slate-950 dark:text-white">{monitor.url}</p>
                      <StatusBadge status={status} />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>Uptime: <b className="font-semibold text-slate-800 dark:text-slate-200">{monitor.stats?.uptimePercentage ?? '--'}%</b></span>
                      <span>Latency: <b className="font-semibold text-slate-800 dark:text-slate-200">{monitor.latestCheck?.responseTime ?? monitor.stats?.avgResponseTime ?? '--'} ms</b></span>
                    </div>
                  </button>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => onToggle(monitor)}
                      className="focus-ring flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-950/5 px-3 py-2 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200"
                    >
                      {monitor.isActive ? <Pause size={14} /> : <Play size={14} />}
                      {monitor.isActive ? 'Pause' : 'Resume'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(monitor.id)}
                      className="focus-ring flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-300"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
