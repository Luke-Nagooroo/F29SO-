import React, { useEffect } from "react";

const toneClasses = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-rose-200 bg-rose-50 text-rose-900",
  info: "border-sky-200 bg-sky-50 text-sky-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
};

function Toast({ message, type = "info", onClose, duration = 3000 }) {
  useEffect(() => {
    if (!onClose) return undefined;
    const timer = window.setTimeout(() => {
      onClose();
    }, duration);

    return () => window.clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`w-full rounded-xl border px-4 py-3 shadow-lg ${toneClasses[type] ?? toneClasses.info}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold capitalize">{type}</p>
          <p className="mt-1 text-sm opacity-90">{message}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md px-2 py-1 text-xs font-medium hover:bg-black/5"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default Toast;
