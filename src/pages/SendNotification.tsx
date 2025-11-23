import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import { useSendNotification } from '../hooks/useNotifications';
import { usersService, type User } from '../api/services/users';
import { Loader } from '../components/common/Loader';

interface NotificationForm {
  title: string;
  body: string;
  user_ids: number[];
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
  totalSent?: number;
  totalFailed?: number;
}

export const SendNotification: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const sendNotificationMutation = useSendNotification();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NotificationForm>({
    defaultValues: {
      title: '',
      body: '',
      user_ids: [],
    },
  });

  // Fetch users for multi-select
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const response = await usersService.getUsers({ per_page: 1000 }); // Get all users
        setUsers(response.data || []);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const handleUserToggle = (userId: number) => {
    setSelectedUserIds((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedUserIds.length === users.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(users.map((user) => user.id));
    }
  };

  const onSubmit = async (data: NotificationForm) => {
    try {
      const payload = {
        title: data.title,
        body: data.body,
        ...(selectedUserIds.length > 0 && { user_ids: selectedUserIds }),
      };

      const result = await sendNotificationMutation.mutateAsync(payload);
      
      setSnackbar({
        open: true,
        message: t('notifications.send_success', {
          sent: result.total_sent || 0,
          failed: result.total_failed || 0,
        }),
        severity: 'success',
        totalSent: result.total_sent || 0,
        totalFailed: result.total_failed || 0,
      });

      // Reset form
      reset();
      setSelectedUserIds([]);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.message || t('notifications.send_error'),
        severity: 'error',
      });
    }
  };

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <header className="space-y-2">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-gray-700 to-black text-transparent bg-clip-text dark:from-gray-100 dark:via-gray-300 dark:to-white">
            {t('notifications.title')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
            {t('notifications.description')}
          </p>
        </div>
      </header>

      <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title Field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
              {t('notifications.title_field')}
              <span className="text-rose-500 ml-1">*</span>
            </label>
            <input
              {...register('title', { 
                required: t('notifications.title_required') 
              })}
              className={`w-full h-11 rounded-2xl border px-4 text-sm transition ${
                errors.title 
                  ? 'border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20' 
                  : 'border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
              } bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100`}
              placeholder={t('notifications.title_placeholder')}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
            {errors.title && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                {String(errors.title.message)}
              </p>
            )}
          </div>

          {/* Body Field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
              {t('notifications.body_field')}
              <span className="text-rose-500 ml-1">*</span>
            </label>
            <textarea
              {...register('body', { 
                required: t('notifications.body_required') 
              })}
              rows={6}
              className={`w-full rounded-2xl border px-4 py-3 text-sm transition resize-none ${
                errors.body 
                  ? 'border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20' 
                  : 'border-slate-200 dark:border-slate-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
              } bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100`}
              placeholder={t('notifications.body_placeholder')}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
            {errors.body && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                {String(errors.body.message)}
              </p>
            )}
          </div>

          {/* Users Multi-Select */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
              {t('notifications.users_field')}
              <span className="text-slate-400 dark:text-slate-500 text-xs normal-case ml-1">
                ({t('notifications.users_optional')})
              </span>
            </label>
            
            {loadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <Loader message={t('notifications.loading_users')} />
              </div>
            ) : (
              <div className="space-y-3">
                {/* Select All Button */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition"
                  >
                    {selectedUserIds.length === users.length 
                      ? t('notifications.deselect_all') 
                      : t('notifications.select_all')}
                  </button>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedUserIds.length > 0 
                      ? t('notifications.selected_count', { count: selectedUserIds.length })
                      : t('notifications.no_users_selected')}
                  </span>
                </div>

                {/* Users List */}
                <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4">
                  {users.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                      {t('notifications.no_users_available')}
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {users.map((user) => {
                        const isSelected = selectedUserIds.includes(user.id);
                        return (
                          <label
                            key={user.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                              isSelected
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleUserToggle(user.id)}
                              className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500 focus:ring-2"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {user.name}
                              </p>
                              {user.email && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                  {user.email}
                                </p>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                {selectedUserIds.length === 0 && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    {t('notifications.send_to_all_hint')}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="submit"
              disabled={sendNotificationMutation.isPending}
              className={`h-11 px-8 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed hover:from-primary-700 hover:to-primary-800 shadow-lg shadow-primary-500/30 ${
                isRTL ? 'flex-row-reverse' : ''
              }`}
            >
              {sendNotificationMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('notifications.sending')}
                </span>
              ) : (
                t('notifications.send_button')
              )}
            </button>
          </div>
        </form>
      </section>

      {/* Snackbar */}
      {snackbar.open && (
        <div className={`fixed bottom-4 ${isRTL ? 'left-4' : 'right-4'} z-50 animate-fade-in max-w-sm`}>
          <div
            className={`min-w-[280px] px-4 py-3 rounded-lg shadow-lg border ${
              snackbar.severity === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-300'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="text-sm font-medium">{snackbar.message}</div>
                {snackbar.totalSent !== undefined && snackbar.totalFailed !== undefined && (
                  <div className="text-xs mt-2 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-700 dark:text-emerald-300">
                        ✓ {t('notifications.sent_count', { count: snackbar.totalSent })}
                      </span>
                    </div>
                    {snackbar.totalFailed > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-rose-700 dark:text-rose-300">
                          ✗ {t('notifications.failed_count', { count: snackbar.totalFailed })}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button
                className="text-sm opacity-70 hover:opacity-100 transition-opacity flex-shrink-0"
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

