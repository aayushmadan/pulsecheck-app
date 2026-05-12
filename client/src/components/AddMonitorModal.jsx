import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { X } from 'lucide-react';

const intervals = [
  { value: 1, label: 'Every 1 minute' },
  { value: 5, label: 'Every 5 minutes' },
  { value: 15, label: 'Every 15 minutes' },
  { value: 30, label: 'Every 30 minutes' },
  { value: 60, label: 'Every hour' }
];

export default function AddMonitorModal({ isOpen, onClose, onSubmit, isSubmitting }) {
  const [url, setUrl] = useState('');
  const [interval, setIntervalValue] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setUrl('');
      setIntervalValue(1);
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        setError('Use a valid http or https URL.');
        return;
      }
    } catch {
      setError('Enter a valid absolute URL.');
      return;
    }

    if (!Number.isInteger(Number(interval)) || Number(interval) < 1 || Number(interval) > 1440) {
      setError('Interval must be between 1 and 1440 minutes.');
      return;
    }

    await onSubmit({ url, interval: Number(interval) });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center px-4 py-8">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-md"
        onClick={onClose}
        aria-label="Close modal"
      />
      <form onSubmit={handleSubmit} className="glass-panel-strong relative w-full max-w-md animate-floatIn rounded-2xl p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-teal-700 dark:text-teal-300">New monitor</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">Add endpoint</h2>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">Start checking a public HTTP or HTTPS service.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring grid h-9 w-9 place-items-center rounded-xl bg-slate-950/5 text-slate-600 transition hover:bg-slate-950/10 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/15"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-5 space-y-3.5">
          <label className="block">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">URL</span>
            <input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://api.example.com"
              className="focus-ring mt-2 w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-950 placeholder:text-slate-400 dark:border-white/10 dark:bg-white/10 dark:text-slate-950"
              required
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Interval</span>
            <div className="mt-2 grid gap-2">
              {intervals.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setIntervalValue(item.value)}
                  className={clsx(
                    'w-full rounded-xl border px-3.5 py-2.5 text-left text-sm transition',
                    interval === item.value
                      ? 'border-slate-900/5 bg-slate-100 text-slate-950 dark:border-white/10 dark:bg-white/10 dark:text-white'
                      : 'border-slate-200 bg-white/80 text-slate-950 hover:border-slate-300 dark:border-white/10 dark:bg-white/10 dark:text-slate-950'
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </label>

          {error && (
            <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-600 dark:text-red-300">
              {error}
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="focus-ring rounded-xl bg-slate-950/5 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-950/10 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="focus-ring rounded-xl bg-gradient-to-r from-slate-800 to-teal-700 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:from-slate-200 dark:to-teal-200 dark:text-slate-950"
          >
            {isSubmitting ? 'Adding...' : 'Add monitor'}
          </button>
        </div>
      </form>
    </div>
  );
}
