import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastMessage, ToastType } from '../types/common';
import ToastContainer from '../components/common/ToastContainer';

interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (title: string, message?: any, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: any) => void;
  error: (title: string, message?: any) => void;
  warning: (title: string, message?: any) => void;
  info: (title: string, message?: any) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (title: string, message?: any, type: ToastType = 'info', duration = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      let safeMessage: string | undefined = undefined;
      if (message !== undefined && message !== null) {
        if (typeof message === 'string') {
          safeMessage = message;
        } else if (Array.isArray(message)) {
          safeMessage = message
            .map((item) => (typeof item === 'string' ? item : item?.msg || item?.detail || JSON.stringify(item)))
            .join('; ');
        } else if (typeof message === 'object') {
          safeMessage = message?.msg || message?.detail || (typeof message?.detail === 'string' ? message.detail : JSON.stringify(message));
        } else {
          safeMessage = String(message);
        }
      }

      const newToast: ToastMessage = { id, title, message: safeMessage, type, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((title: string, message?: any) => showToast(title, message, 'success'), [showToast]);
  const error = useCallback((title: string, message?: any) => showToast(title, message, 'error'), [showToast]);
  const warning = useCallback((title: string, message?: any) => showToast(title, message, 'warning'), [showToast]);
  const info = useCallback((title: string, message?: any) => showToast(title, message, 'info'), [showToast]);

  return (
    <ToastContext.Provider
      value={{ toasts, showToast, removeToast, success, error, warning, info }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
