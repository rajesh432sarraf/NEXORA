import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { ToastMessage, ToastType } from '../../types/common';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const toastIcons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-5 h-5 text-obsidian-emerald" />,
  error: <AlertCircle className="w-5 h-5 text-obsidian-danger" />,
  warning: <AlertTriangle className="w-5 h-5 text-obsidian-warning" />,
  info: <Info className="w-5 h-5 text-obsidian-ai" />,
};

const toastBorderStyles: Record<ToastType, string> = {
  success: 'border-obsidian-emerald/40 bg-obsidian-card/90 shadow-[0_0_15px_rgba(24,194,156,0.15)]',
  error: 'border-obsidian-danger/40 bg-obsidian-card/90 shadow-[0_0_15px_rgba(255,77,109,0.15)]',
  warning: 'border-obsidian-warning/40 bg-obsidian-card/90 shadow-[0_0_15px_rgba(255,181,71,0.15)]',
  info: 'border-obsidian-ai/40 bg-obsidian-card/90 shadow-[0_0_15px_rgba(94,242,199,0.15)]',
};

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 max-w-md w-full pointer-events-none px-4">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`pointer-events-auto flex items-start space-x-3 p-4 rounded-obsidian border backdrop-blur-md ${toastBorderStyles[toast.type]}`}
          >
            <div className="flex-shrink-0 mt-0.5">{toastIcons[toast.type]}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-obsidian-text-primary">{toast.title}</h4>
              {toast.message && (
                <p className="text-xs text-obsidian-text-secondary mt-1 leading-relaxed">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="flex-shrink-0 text-obsidian-text-muted hover:text-obsidian-text-primary transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
