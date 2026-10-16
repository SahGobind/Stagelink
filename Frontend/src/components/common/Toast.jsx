import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({
  type = 'success',
  message,
  onClose,
  duration = 4000,
}) => {
  useEffect(() => {
    if (!message || !onClose || duration <= 0) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, onClose, duration]);

  if (!message) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-brand-success shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-brand-warning shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-brand-error shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
  };

  const borders = {
    success: 'border-green-200 bg-white shadow-card',
    warning: 'border-amber-200 bg-white shadow-card',
    error: 'border-red-200 bg-white shadow-card',
    info: 'border-sky-200 bg-white shadow-card',
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-50 flex items-center p-4 rounded-2xl border ${borders[type] || borders.info} max-w-sm shadow-2xl animate-in slide-in-from-bottom-5 duration-300`}
    >
      <div className="mr-3">{icons[type] || icons.info}</div>
      <p className="text-xs font-semibold text-brand-navy flex-1 leading-snug">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-3 text-gray-400 hover:text-brand-navy transition-colors p-1 rounded-lg hover:bg-gray-50"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Toast;
