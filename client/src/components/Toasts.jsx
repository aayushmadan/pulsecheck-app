import { CheckCircle2, X, XCircle } from 'lucide-react';

export default function Toasts({ toasts, onDismiss }) {
  return (
    <div className="fixed right-4 top-4 z-[60] grid w-[min(330px,calc(100%-2rem))] gap-2.5">
      {toasts.map((toast) => {
        const Icon = toast.type === 'error' ? XCircle : CheckCircle2;
        return (
          <div key={toast.id} className="glass-panel-strong flex items-start gap-2.5 rounded-xl p-3.5">
            <Icon className={toast.type === 'error' ? 'text-red-500' : 'text-emerald-500'} size={18} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-950 dark:text-white">{toast.title}</p>
              {toast.message && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{toast.message}</p>}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="grid h-7 w-7 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-950/5 dark:hover:bg-white/10"
              aria-label="Dismiss notification"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
