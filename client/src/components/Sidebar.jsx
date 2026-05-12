import { Activity, Gauge, Menu, Moon, Network, Sun, X } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { label: 'Dashboard', icon: Gauge },
  { label: 'Monitors', icon: Network }
];

export default function Sidebar({ isOpen, onClose, theme, onToggleTheme }) {
  return (
    <>
      <button
        type="button"
        className="focus-ring fixed left-4 top-4 z-40 grid h-10 w-10 place-items-center rounded-xl border border-white/60 bg-white/80 text-slate-800 shadow-soft backdrop-blur-xl transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10 dark:text-white lg:hidden"
        onClick={onClose}
        aria-label="Toggle navigation"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={clsx(
          'fixed inset-y-4 left-4 z-30 flex w-[245px] flex-col rounded-2xl p-4 transition duration-300 lg:translate-x-0',
          'glass-panel',
          isOpen ? 'translate-x-0' : '-translate-x-[calc(100%+2rem)]'
        )}
      >
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-slate-700 to-teal-700 text-white shadow-lg shadow-slate-900/10">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">PulseCheck</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Uptime intelligence</p>
          </div>
        </div>

        <nav className="mt-8 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href={item.label === 'Dashboard' ? '#dashboard' : '#monitors'}
                className="group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-white/70 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-950/[0.04] text-slate-500 transition group-hover:text-teal-700 dark:bg-white/[0.06] dark:text-slate-300 dark:group-hover:text-teal-300">
                  <Icon size={16} />
                </span>
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="mt-auto rounded-2xl border border-slate-900/5 bg-white/55 p-3 dark:border-white/10 dark:bg-white/[0.06]">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Theme</p>
          <button
            type="button"
            onClick={onToggleTheme}
            className="focus-ring mt-2.5 flex w-full items-center justify-between rounded-xl bg-slate-950 px-3 py-2.5 text-xs font-semibold text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950"
          >
            <span>{theme === 'dark' ? 'Dark mode' : 'Light mode'}</span>
            {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </aside>

      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-slate-950/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-label="Close navigation overlay"
        />
      )}
    </>
  );
}
