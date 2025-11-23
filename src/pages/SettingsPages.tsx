import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DataTable, type Column } from '../components/common/DataTable';
import { EmptyState } from '../components/common/EmptyState';
import { Loader } from '../components/common/Loader';
import { useSettingsPages } from '../hooks/useSettingsPages';
import type { SettingsPage } from '../api/services/settingsPages';
import { formatEnglishDate } from '../utils/format';

export const SettingsPages: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data, isLoading, error } = useSettingsPages({
    page: page + 1,
    per_page: rowsPerPage,
  });

  const items = data?.data ?? [];
  const total = data?.total ?? 0;

  const columns: Column<SettingsPage>[] = useMemo(
    () => [
      {
        id: 'key',
        label: t('settings_pages.key'),
        minWidth: 150,
        sortable: true,
      },
      {
        id: 'title_ar',
        label: t('settings_pages.title_ar'),
        minWidth: 200,
        sortable: true,
      },
      {
        id: 'updated_at',
        label: t('settings_pages.updated_at'),
        minWidth: 150,
        sortable: true,
        render: (value) => (value ? formatEnglishDate(value) || '-' : '-'),
      },
    ],
    [t]
  );

  const handleEdit = (item: SettingsPage) => {
    navigate(`/settings-pages/${item.key}/edit`);
  };

  if (isLoading && items.length === 0) {
    return <Loader message={t('common.loading')} />;
  }

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <header className="space-y-2">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-gray-700 to-black text-transparent bg-clip-text">
            {t('settings_pages.title')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
            {t('settings_pages.description')}
          </p>
        </div>
      </header>

      {error && (
        <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 p-4">
          <p className="text-sm text-rose-800 dark:text-rose-300">
            {error?.message || t('settings_pages.load_error')}
          </p>
        </div>
      )}

      {items.length === 0 && !isLoading ? (
        <EmptyState
          title={t('settings_pages.no_pages')}
          description={t('settings_pages.no_pages_description')}
        />
      ) : (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl overflow-hidden">
          <DataTable
            columns={columns}
            data={items}
            loading={isLoading}
            totalCount={total}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            onRowsPerPageChange={(n) => {
              setRowsPerPage(n);
              setPage(0);
            }}
            onEdit={handleEdit}
            emptyMessage={t('settings_pages.no_pages')}
          />
        </div>
      )}
    </div>
  );
};

