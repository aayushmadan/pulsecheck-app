const state = {
  monitors: [],
  selectedId: null,
  logs: [],
  isRefreshing: false
};

const REFRESH_INTERVAL_MS = 15000;

const els = {
  form: document.querySelector('#monitor-form'),
  url: document.querySelector('#url'),
  interval: document.querySelector('#interval'),
  list: document.querySelector('#monitor-list'),
  refresh: document.querySelector('#refresh-button'),
  total: document.querySelector('#metric-total'),
  active: document.querySelector('#metric-active'),
  uptime: document.querySelector('#metric-uptime'),
  latency: document.querySelector('#metric-latency'),
  title: document.querySelector('#details-title'),
  detailsStatus: document.querySelector('#details-status'),
  logs: document.querySelector('#log-list'),
  chart: document.querySelector('#latency-chart')
};

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error?.message || 'Request failed.');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function loadMonitors() {
  const payload = await api('/monitors');
  state.monitors = payload.data;
  if (!state.selectedId && state.monitors.length > 0) {
    state.selectedId = state.monitors[0].id;
  }
  renderMonitors();
  renderMetrics();
  await loadLogs();
}

async function loadLogs() {
  if (!state.selectedId) {
    state.logs = [];
    renderDetails();
    return;
  }

  const payload = await api(`/monitors/${state.selectedId}/logs`);
  state.logs = payload.data.reverse();
  renderDetails();
}

function renderMetrics() {
  const active = state.monitors.filter((monitor) => monitor.isActive).length;
  const uptimes = state.monitors
    .map((monitor) => monitor.stats.uptimePercentage)
    .filter((value) => typeof value === 'number');
  const latencies = state.monitors
    .map((monitor) => monitor.stats.avgResponseTime)
    .filter((value) => typeof value === 'number');

  els.total.textContent = state.monitors.length;
  els.active.textContent = active;
  els.uptime.textContent = uptimes.length ? `${average(uptimes).toFixed(1)}%` : '--';
  els.latency.textContent = latencies.length ? `${Math.round(average(latencies))} ms` : '--';
}

function renderMonitors() {
  if (state.monitors.length === 0) {
    els.list.innerHTML = '<div class="empty-state">Add your first monitor to start collecting checks.</div>';
    return;
  }

  els.list.innerHTML = state.monitors.map((monitor) => {
    const latest = monitor.latestCheck;
    const status = !monitor.isActive ? 'paused' : latest?.status === 'DOWN' ? 'down' : latest?.status === 'UP' ? 'up' : 'muted';
    const label = !monitor.isActive ? 'Paused' : latest?.status || 'Waiting';
    const uptime = monitor.stats.uptimePercentage === null ? '--' : `${monitor.stats.uptimePercentage}%`;
    const latency = monitor.stats.avgResponseTime === null ? '--' : `${monitor.stats.avgResponseTime} ms`;

    return `
      <article class="monitor-card ${monitor.id === state.selectedId ? 'selected' : ''}" data-id="${monitor.id}">
        <div class="monitor-top">
          <div class="monitor-url" title="${escapeHtml(monitor.url)}">${escapeHtml(monitor.url)}</div>
          <span class="status-pill ${status}">${label}</span>
        </div>
        <div class="monitor-meta">${uptime} uptime / ${latency} avg / every ${monitor.interval} min</div>
        <div class="monitor-actions">
          <button type="button" data-action="select" data-id="${monitor.id}">Inspect</button>
          <button type="button" data-action="toggle" data-id="${monitor.id}">${monitor.isActive ? 'Pause' : 'Resume'}</button>
          <button class="danger" type="button" data-action="delete" data-id="${monitor.id}">Delete</button>
        </div>
      </article>
    `;
  }).join('');
}

function renderDetails() {
  const monitor = state.monitors.find((item) => item.id === state.selectedId);
  if (!monitor) {
    els.title.textContent = 'Select a monitor';
    els.detailsStatus.textContent = 'Idle';
    els.detailsStatus.className = 'status-pill muted';
    els.logs.innerHTML = '<div class="empty-state">No monitor selected.</div>';
    drawChart([]);
    return;
  }

  const latest = state.logs[state.logs.length - 1];
  els.title.textContent = new URL(monitor.url).hostname;
  els.detailsStatus.textContent = monitor.isActive ? latest?.status || 'Waiting' : 'Paused';
  els.detailsStatus.className = `status-pill ${monitor.isActive ? (latest?.status === 'DOWN' ? 'down' : '') : 'paused'}`;

  drawChart(state.logs);

  if (state.logs.length === 0) {
    els.logs.innerHTML = '<div class="empty-state">Checks will appear after the next scheduled minute.</div>';
    return;
  }

  els.logs.innerHTML = state.logs.slice().reverse().map((log) => `
    <div class="log-row">
      <strong>${log.status}</strong>
      <span>${log.statusCode || 'No status'} / ${log.responseTime} ms</span>
      <span>${new Date(log.createdAt).toLocaleString()}</span>
    </div>
  `).join('');
}

function drawChart(logs) {
  const canvas = els.chart;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.floor(240 * dpr);

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, rect.width, 240);

  const padding = { top: 22, right: 18, bottom: 30, left: 42 };
  const width = rect.width - padding.left - padding.right;
  const height = 240 - padding.top - padding.bottom;

  ctx.strokeStyle = 'rgba(116, 139, 164, 0.22)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i += 1) {
    const y = padding.top + (height / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(rect.width - padding.right, y);
    ctx.stroke();
  }

  if (logs.length === 0) {
    ctx.fillStyle = '#64748b';
    ctx.font = '750 13px Source Sans 3, Aptos, Segoe UI, system-ui, sans-serif';
    ctx.fillText('Waiting for latency data', padding.left, 120);
    return;
  }

  const points = logs.slice(-50);
  const max = Math.max(100, ...points.map((log) => log.responseTime));
  const step = points.length > 1 ? width / (points.length - 1) : width;

  const toPoint = (log, index) => ({
    x: padding.left + step * index,
    y: padding.top + height - (log.responseTime / max) * height
  });

  ctx.beginPath();
  points.map(toPoint).forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.strokeStyle = '#2d6cdf';
  ctx.lineWidth = 3;
  ctx.stroke();

  points.forEach((log, index) => {
    const point = toPoint(log, index);
    ctx.fillStyle = log.status === 'UP' ? '#1f9d7a' : '#d74f60';
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = '#64748b';
  ctx.font = '750 12px Source Sans 3, Aptos, Segoe UI, system-ui, sans-serif';
  ctx.fillText(`${max} ms`, 8, padding.top + 4);
  ctx.fillText('0 ms', 12, padding.top + height);
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

els.form.addEventListener('submit', async (event) => {
  event.preventDefault();
  await api('/monitors', {
    method: 'POST',
    body: JSON.stringify({
      url: els.url.value,
      interval: Number(els.interval.value)
    })
  });
  els.form.reset();
  els.interval.value = 1;
  await loadMonitors();
});

els.list.addEventListener('click', async (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  const id = Number(button.dataset.id);
  const monitor = state.monitors.find((item) => item.id === id);

  if (button.dataset.action === 'select') {
    state.selectedId = id;
    renderMonitors();
    await loadLogs();
  }

  if (button.dataset.action === 'toggle') {
    await api(`/monitors/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive: !monitor.isActive })
    });
    await loadMonitors();
  }

  if (button.dataset.action === 'delete') {
    await api(`/monitors/${id}`, { method: 'DELETE' });
    if (state.selectedId === id) {
      state.selectedId = null;
    }
    await loadMonitors();
  }
});

els.refresh.addEventListener('click', loadMonitors);
window.addEventListener('resize', () => drawChart(state.logs));

async function refreshDashboard() {
  if (state.isRefreshing) {
    return;
  }

  state.isRefreshing = true;
  try {
    await loadMonitors();
  } catch (error) {
    els.list.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
  } finally {
    state.isRefreshing = false;
  }
}

refreshDashboard();

setInterval(() => {
  if (document.visibilityState === 'visible') {
    refreshDashboard();
  }
}, REFRESH_INTERVAL_MS);

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    refreshDashboard();
  }
});
