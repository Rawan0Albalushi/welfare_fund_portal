import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  severity?: 'error' | 'warning' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  loading = false,
  severity = 'warning',
}) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  if (!open) return null;

  const tone =
    severity === 'error'
      ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300'
      : severity === 'warning'
      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
      : 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-card p-4">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <div className={`text-sm rounded-md px-3 py-2 mb-4 ${tone}`}>{message}</div>
        <div className={`flex justify-end gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button onClick={onCancel} disabled={loading} className="h-9 px-3 rounded-md border border-gray-200 dark:border-gray-700 disabled:opacity-50">
            {cancelText || t('common.cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`h-9 px-3 rounded-md text-white ${
              severity === 'error' ? 'bg-rose-600 hover:bg-rose-700' : severity === 'warning' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-primary-600 hover:bg-primary-700'
            } disabled:opacity-50`}
          >
            {loading ? (t('common.loading') || 'Processing...') : confirmText || t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};
