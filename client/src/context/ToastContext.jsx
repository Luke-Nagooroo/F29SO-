import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import Toast from "../components/common/Toast";

const ToastContext = createContext(null);

let nextToastId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message, type = "info", duration = 3000) => {
    const id = nextToastId++;
    setToasts((current) => [...current, { id, message, type, duration }]);
    return id;
  }, []);

  const toast = useMemo(() => ({
    show: showToast,
    success: (message, duration) => showToast(message, "success", duration),
    error: (message, duration) => showToast(message, "error", duration),
    info: (message, duration) => showToast(message, "info", duration),
    warning: (message, duration) => showToast(message, "warning", duration),
    dismiss: removeToast,
  }), [removeToast, showToast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}

      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3">
        {toasts.map((item) => (
          <div key={item.id} className="pointer-events-auto">
            <Toast
              message={item.message}
              type={item.type}
              duration={item.duration}
              onClose={() => removeToast(item.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}
