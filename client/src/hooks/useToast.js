import { useCallback, useState } from 'react';

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const pushToast = useCallback((toast) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, type: 'success', ...toast }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3600);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  return { toasts, pushToast, dismissToast };
}
