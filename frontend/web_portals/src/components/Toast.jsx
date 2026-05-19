import { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    delete timersRef.current[id];
  }, []);

  const toast = useCallback(
    (message, type = 'info', duration = 3000) => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, message, type, visible: false }]);

      requestAnimationFrame(() => {
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, visible: true } : t))
        );
      });

      timersRef.current[id] = setTimeout(() => {
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, visible: false } : t))
        );
        setTimeout(() => removeToast(id), 300);
      }, duration);

      return id;
    },
    [removeToast]
  );

  const dismissToast = useCallback(
    (id) => {
      if (timersRef.current[id]) {
        clearTimeout(timersRef.current[id]);
      }
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, visible: false } : t))
      );
      setTimeout(() => removeToast(id), 300);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toast, dismissToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast ${t.type}${t.visible ? ' show' : ''}`}
            onClick={() => dismissToast(t.id)}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
