import { Clock3, ServerCrash } from 'lucide-react';

function StatusDot({ status }) {
  const isUp = status === 'UP';
  return (
    <span className={`mt-1 h-2.5 w-2.5 rounded-full ${isUp ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-red-500 shadow-red-500/30'} shadow-lg`} />
  );
}

export default function LogsView({ monitor, logs, isLoading }) {
  const latest = logs[0];
  const orderedLogs = [...logs].slice(0, 12);
  const maxLatency = Math.max(100, ...orderedLogs.map((log) => log.responseTime || 0));

  return (
    <section className="glass-panel-strong rounded-2xl p-4">
      <div className="flex flex-col gap-3 border-b border-slate-900/5 pb-4 dark:border-white/10 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-teal-700 dark:text-teal-300">Details</p>
          <h2 className="mt-1 break-words text-lg font-semibold text-slate-950 dark:text-white">
            {monitor ? new URL(monitor.url).hostname : 'Select a monitor'}
          </h2>
          <p className="mt-1 break-words text-xs text-slate-500 dark:text-slate-400">
            {monitor?.url || 'Choose a monitor to inspect recent checks.'}
          </p>
        </div>
        {monitor && (
          <div className="rounded-xl border border-slate-900/5 bg-white/55 px-3 py-2.5 text-xs dark:border-white/10 dark:bg-white/[0.06]">
            <p className="text-slate-500 dark:text-slate-400">Last response</p>
            <p className="mt-1 text-base font-semibold text-slate-950 dark:text-white">{latest?.responseTime ?? '--'} ms</p>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="mt-4 space-y-2.5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-11 animate-pulse rounded-xl bg-slate-300/40 dark:bg-white/10" />
          ))}
        </div>
      ) : !monitor ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white/40 p-6 text-center dark:border-white/15 dark:bg-white/[0.04]">
          <ServerCrash className="mx-auto text-slate-400" size={26} />
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">No monitor selected.</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white/40 p-6 text-center dark:border-white/15 dark:bg-white/[0.04]">
          <Clock3 className="mx-auto text-slate-400" size={26} />
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Checks will appear after the next scheduled run.</p>
        </div>
      ) : (
        <div className="mt-4 space-y-2.5">
          <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-900/5 bg-white/45 p-3.5 dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex h-20 w-full min-w-0 items-end gap-1 overflow-hidden">
              {[...logs].reverse().slice(-24).map((log) => (
                <div
                  key={log.id}
                  className={`min-w-0 flex-1 rounded-t-md ${log.status === 'UP' ? 'bg-teal-700/70 dark:bg-teal-300/70' : 'bg-rose-600/70 dark:bg-rose-400/70'}`}
                  style={{ height: `${Math.max(12, (log.responseTime / maxLatency) * 92)}%` }}
                  title={`${log.status} / ${log.responseTime} ms`}
                />
              ))}
            </div>
            <div className="mt-2.5 flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Older</span>
              <span>Latency trend</span>
              <span>Latest</span>
            </div>
          </div>

          <div className="relative space-y-2.5">
            {orderedLogs.map((log) => (
              <div key={log.id} className="flex gap-2.5 rounded-xl border border-slate-900/5 bg-white/45 p-3 dark:border-white/10 dark:bg-white/[0.04]">
                <StatusDot status={log.status} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-950 dark:text-white">{log.status}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(log.createdAt).toLocaleString()}</p>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Status {log.statusCode || 'n/a'} / {log.responseTime} ms
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
