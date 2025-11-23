import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import { Loader } from '../components/common/Loader';
import { useSettingsPage, useUpdateSettingsPage } from '../hooks/useSettingsPages';
import type { UpdateSettingsPageRequest } from '../api/services/settingsPages';

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

export const EditSettingPage: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const { key } = useParams<{ key: string }>();

  const { data: pageData, isLoading } = useSettingsPage(key || '');
  const updateMutation = useUpdateSettingsPage();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateSettingsPageRequest>({
    defaultValues: {
      title_ar: '',
      title_en: '',
      content_ar: '',
      content_en: '',
    },
  });

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    if (pageData) {
      reset({
        title_ar: pageData.title_ar ?? '',
        title_en: pageData.title_en ?? '',
        content_ar: pageData.content_ar ?? '',
        content_en: pageData.content_en ?? '',
      });
    }
  }, [pageData, reset]);

  const onSubmit = async (values: UpdateSettingsPageRequest) => {
    if (!key) return;

    try {
      await updateMutation.mutateAsync({ key, data: values });
      setSnackbar({
        open: true,
        message: t('settings_pages.updated_success'),
        severity: 'success',
      });
      // Navigate back after a short delay
      setTimeout(() => {
        navigate('/settings-pages');
      }, 1500);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.message || t('settings_pages.update_failed'),
        severity: 'error',
      });
    }
  };

  if (isLoading || !pageData) {
    return <Loader message={t('common.loading')} />;
  }

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <header className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/settings-pages')}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={t('common.back')}
              >
                <span className="text-xl">{isRTL ? '→' : '←'}</span>
              </button>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-gray-700 to-black text-transparent bg-clip-text">
                {t('settings_pages.edit_title')}
              </h1>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
              {t('settings_pages.edit_description')} - <span className="font-mono text-xs">{key}</span>
            </p>
          </div>
        </div>
      </header>

      <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl p-6 space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Title Arabic */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
                {t('settings_pages.title_ar')}
              </label>
              <input
                {...register('title_ar', {
                  required: t('settings_pages.title_ar_required'),
                })}
                className={`w-full h-11 rounded-2xl border px-4 text-sm transition ${
                  errors.title_ar
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:ring-primary-500'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100`}
                dir="rtl"
                placeholder={t('settings_pages.title_ar_placeholder')}
              />
              {errors.title_ar && (
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                  {String(errors.title_ar.message)}
                </p>
              )}
            </div>

            {/* Title English */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
                {t('settings_pages.title_en')}
              </label>
              <input
                {...register('title_en', {
                  required: t('settings_pages.title_en_required'),
                })}
                className={`w-full h-11 rounded-2xl border px-4 text-sm transition ${
                  errors.title_en
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:ring-primary-500'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100`}
                dir="ltr"
                placeholder={t('settings_pages.title_en_placeholder')}
              />
              {errors.title_en && (
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                  {String(errors.title_en.message)}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Content Arabic */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
                {t('settings_pages.content_ar')}
              </label>
              <textarea
                {...register('content_ar')}
                rows={8}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm transition focus:border-primary-500 focus:ring-primary-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 resize-y"
                dir="rtl"
                placeholder={t('settings_pages.content_ar_placeholder')}
              />
            </div>

            {/* Content English */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
                {t('settings_pages.content_en')}
              </label>
              <textarea
                {...register('content_en')}
                rows={8}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm transition focus:border-primary-500 focus:ring-primary-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 resize-y"
                dir="ltr"
                placeholder={t('settings_pages.content_en_placeholder')}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => navigate('/settings-pages')}
              className="px-6 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed hover:from-primary-700 hover:to-primary-800 shadow-md hover:shadow-lg"
            >
              {updateMutation.isPending ? t('common.loading') : t('common.save')}
            </button>
          </div>
        </form>
      </section>

      {/* Snackbar */}
      {snackbar.open && (
        <div className={`fixed bottom-4 ${isRTL ? 'left-4' : 'right-4'} z-50 animate-fade-in`}>
          <div
            className={`min-w-[280px] max-w-sm px-4 py-3 rounded-lg shadow-lg border ${
              snackbar.severity === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-300'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="text-sm">{snackbar.message}</div>
              <button
                className="text-sm opacity-70 hover:opacity-100 transition-opacity"
                onClick={() => setSnackbar((prev) => ({ ...prev, open: false }))}
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

