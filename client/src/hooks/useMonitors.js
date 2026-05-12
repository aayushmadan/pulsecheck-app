import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getMonitorLogs, getMonitors } from '../services/api';

const REFRESH_INTERVAL_MS = 500000;

export function useMonitors() {
  const [monitors, setMonitors] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const inFlightRef = useRef(false);

  const selectedMonitor = useMemo(
    () => monitors.find((monitor) => monitor.id === selectedId) || null,
    [monitors, selectedId]
  );

  const loadDashboard = useCallback(async ({ silent = false } = {}) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    if (!silent) setIsLoading(true);
    setIsRefreshing(silent);
    setError('');

    try {
      const nextMonitors = await getMonitors();
      setMonitors(nextMonitors);

      const nextSelectedId = selectedId && nextMonitors.some((monitor) => monitor.id === selectedId)
        ? selectedId
        : nextMonitors[0]?.id || null;
      setSelectedId(nextSelectedId);

      if (nextSelectedId) {
        const nextLogs = await getMonitorLogs(nextSelectedId);
        setLogs(nextLogs);
      } else {
        setLogs([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      inFlightRef.current = false;
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedId]);

  const selectMonitor = useCallback(async (id) => {
    setSelectedId(id);
    setError('');
    try {
      const nextLogs = await getMonitorLogs(id);
      setLogs(nextLogs);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadDashboard({ silent: true });
      }
    }, REFRESH_INTERVAL_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadDashboard({ silent: true });
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [loadDashboard]);

  return {
    monitors,
    logs,
    selectedId,
    selectedMonitor,
    isLoading,
    isRefreshing,
    error,
    loadDashboard,
    selectMonitor
  };
}
