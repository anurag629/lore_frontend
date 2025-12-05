'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Trash2, Loader2 } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
  icon?: React.ReactNode;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
  icon,
}: ConfirmModalProps) {
  const variantStyles = {
    danger: {
      iconBg: 'bg-red-500/20',
      iconColor: 'text-red-400',
      confirmBg: 'bg-red-600 hover:bg-red-700',
      borderColor: 'border-red-500/30',
    },
    warning: {
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-400',
      confirmBg: 'bg-amber-600 hover:bg-amber-700',
      borderColor: 'border-amber-500/30',
    },
    info: {
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
      confirmBg: 'bg-blue-600 hover:bg-blue-700',
      borderColor: 'border-blue-500/30',
    },
  };

  const styles = variantStyles[variant];

  const handleConfirm = async () => {
    await onConfirm();
  };

  const DefaultIcon = variant === 'danger' ? Trash2 : AlertTriangle;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          >
            <div
              className={`bg-slate-900 rounded-2xl border ${styles.borderColor} w-full max-w-md shadow-2xl overflow-hidden`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`p-3 rounded-xl ${styles.iconBg}`}>
                    {icon || <DefaultIcon className={`w-6 h-6 ${styles.iconColor}`} />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {message}
                    </p>
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={onClose}
                    disabled={loading}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors -mr-2 -mt-2 disabled:opacity-50"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 p-6 pt-2 bg-slate-900/50">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelText}
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className={`flex-1 px-4 py-3 ${styles.confirmBg} text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    confirmText
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

