import React from 'react';
// Replaced MUI icons with simple unicode icons for lightweight UI
import { useTranslation } from 'react-i18next';

export interface Column<T> {
  id: keyof T | string;
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  totalCount?: number;
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onView?: (row: T) => void;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  emptyMessage?: string;
}

export const DataTable = <T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  totalCount = 0,
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  onSort,
  onEdit,
  onDelete,
  onView,
  sortBy,
  sortDirection = 'asc',
  emptyMessage,
}: DataTableProps<T>) => {
  const { t } = useTranslation();

  const handleSort = (columnId: string) => {
    if (!onSort) return;
    
    const isCurrentSort = sortBy === columnId;
    const newDirection = isCurrentSort && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(columnId, newDirection);
  };

  const getStatusPill = (status: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      active: { label: t('common.active'), cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
      inactive: { label: t('common.inactive'), cls: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
      pending: { label: t('common.pending'), cls: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
      approved: { label: t('common.approved'), cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
      rejected: { label: t('common.rejected'), cls: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300' },
      under_review: { label: t('common.under_review'), cls: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300' },
      draft: { label: 'Draft', cls: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
      paused: { label: 'Paused', cls: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
      completed: { label: 'Completed', cls: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300' },
      archived: { label: 'Archived', cls: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200' },
      paid: { label: 'Paid', cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
      failed: { label: 'Failed', cls: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300' },
      cancelled: { label: 'Cancelled', cls: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
    };
    const cfg = map[status] || { label: status, cls: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' };
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>{cfg.label}</span>;
  };

  // Removed legacy renderCellValue that referenced MUI Chip

  if (loading) {
    return (
      <div className="w-full flex justify-center p-6 text-sm text-gray-500">{t('common.loading')}</div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full flex justify-center p-6 text-sm text-gray-500">{emptyMessage || t('common.no_data')}</div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-card">
      <div className="max-h-[600px] overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800/60 backdrop-blur z-10">
            <tr className="text-left text-gray-600 dark:text-gray-300">
              {columns.map((column) => (
                <th key={String(column.id)} style={{ minWidth: column.minWidth }} className={`px-2 sm:px-4 py-3 text-xs sm:text-sm ${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'}`}>
                  {column.sortable ? (
                    <button onClick={() => handleSort(String(column.id))} className={`inline-flex items-center gap-1 ${sortBy === column.id ? 'font-semibold' : ''}`}>
                      <span>{column.label}</span>
                      {sortBy === column.id && (
                        <span>{sortDirection === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
              {(onEdit || onDelete || onView) && (
                <th className="px-2 sm:px-4 py-3 text-center min-w-[100px] sm:min-w-[120px] text-xs sm:text-sm">{t('common.actions')}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className="border-t border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                {columns.map((column) => (
                  <td key={String(column.id)} className={`px-2 sm:px-4 py-3 text-xs sm:text-sm ${column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'}`}>
                    {(() => {
                      const value = String(column.id).includes('.')
                        ? String(column.id).split('.').reduce((obj: any, key: string) => obj?.[key], row)
                        : row[column.id as keyof T];
                      if (column.render) return column.render(value, row);
                      if (column.id === 'status') return getStatusPill(value);
                      if (typeof value === 'boolean') return value ? t('common.yes') : t('common.no');
                      if (value instanceof Date) return new Date(value).toLocaleDateString();
                      return value ?? '-';
                    })()}
                  </td>
                ))}
                {(onEdit || onDelete || onView) && (
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      {onView && (
                        <button onClick={() => onView(row)} title={t('common.view')} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                          <span aria-hidden>👁️</span>
                        </button>
                      )}
                      {onEdit && (
                        <button onClick={() => onEdit(row)} title={t('common.edit')} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                          <span aria-hidden>✏️</span>
                        </button>
                      )}
                      {onDelete && (
                        <button onClick={() => onDelete(row)} title={t('common.delete')} className="p-1.5 rounded text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                          <span aria-hidden>🗑️</span>
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalCount > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-3 py-2 border-t border-gray-300 dark:border-gray-600 text-xs sm:text-sm gap-3">
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline">{t('common.rows_per_page') || 'Rows per page'}</span>
            <span className="sm:hidden">Per page:</span>
            <select
              className="h-8 px-2 rounded border border-indigoSoft-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs sm:text-sm"
              value={rowsPerPage}
              onChange={(e) => onRowsPerPageChange?.(parseInt(e.target.value, 10))}
            >
              {[5,10,25,50].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-2 py-1 rounded border border-indigoSoft-200 dark:border-gray-700 disabled:opacity-50 text-xs sm:text-sm"
              onClick={() => onPageChange?.(Math.max(0, page - 1))}
              disabled={page <= 0}
            >
              {t('common.previous') || 'Prev'}
            </button>
            <span className="text-xs sm:text-sm">{page + 1}</span>
            <button
              className="px-2 py-1 rounded border border-indigoSoft-200 dark:border-gray-700 disabled:opacity-50 text-xs sm:text-sm"
              onClick={() => {
                const maxPage = Math.max(0, Math.ceil(totalCount / rowsPerPage) - 1);
                onPageChange?.(Math.min(maxPage, page + 1));
              }}
              disabled={(page + 1) >= Math.ceil(totalCount / rowsPerPage)}
            >
              {t('common.next') || 'Next'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
