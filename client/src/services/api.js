async function request(path, options = {}) {
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

export async function getMonitors() {
  const payload = await request('/monitors');
  return payload.data;
}

export async function createMonitor(data) {
  const payload = await request('/monitors', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return payload.data;
}

export async function updateMonitor(id, data) {
  const payload = await request(`/monitors/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
  return payload.data;
}

export async function deleteMonitor(id) {
  return request(`/monitors/${id}`, { method: 'DELETE' });
}

export async function getMonitorLogs(id) {
  const payload = await request(`/monitors/${id}/logs`);
  return payload.data;
}

export async function getMonitorStats(id) {
  const payload = await request(`/monitors/${id}/stats`);
  return payload.data;
}
