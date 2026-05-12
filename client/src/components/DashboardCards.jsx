import { Activity, Clock3, RadioTower, TrendingUp } from 'lucide-react';

function formatPercent(value) {
  return typeof value === 'number' ? `${value.toFixed(1)}%` : '--';
}

function formatLatency(value) {
  return typeof value === 'number' ? `${Math.round(value)} ms` : '--';
}

export default function DashboardCards({ monitors, isLoading }) {
  const active = monitors.filter((monitor) => monitor.isActive).length;
  const uptimeValues = monitors
    .map((monitor) => monitor.stats?.uptimePercentage)
    .filter((value) => typeof value === 'number');
  const latencyValues = monitors
    .map((monitor) => monitor.stats?.avgResponseTime)
    .filter((value) => typeof value === 'number');
  const average = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;

  const cards = [
    { label: 'Total Monitors', value: monitors.length, icon: RadioTower, accent: 'from-slate-500 to-slate-700' },
    { label: 'Active Monitors', value: active, icon: Activity, accent: 'from-emerald-700 to-teal-600' },
    { label: 'Average Uptime', value: uptimeValues.length ? formatPercent(average(uptimeValues)) : '--', icon: TrendingUp, accent: 'from-indigo-500 to-slate-500' },
    { label: 'Avg Response Time', value: latencyValues.length ? formatLatency(average(latencyValues)) : '--', icon: Clock3, accent: 'from-stone-500 to-amber-600' }
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Dashboard stats">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <article
            key={card.label}
            className="glass-panel-strong group relative overflow-hidden rounded-2xl p-4 transition duration-200 hover:-translate-y-0.5"
          >
            <div className={`absolute -right-9 -top-9 h-24 w-24 rounded-full bg-gradient-to-br ${card.accent} opacity-14 blur-2xl`} />
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{card.label}</p>
                {isLoading ? (
                  <div className="mt-3 h-7 w-20 animate-pulse rounded-lg bg-slate-300/60 dark:bg-white/10" />
                ) : (
                  <p className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{card.value}</p>
                )}
              </div>
              <div className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${card.accent} text-white shadow-lg shadow-slate-900/10`}>
                <Icon size={17} />
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
