import React, { useState } from 'react';
// Lightweight alert replacement
import { useTranslation } from 'react-i18next';
import { useApplications, useUpdateApplicationStatus } from '../hooks/useApplications';
import { DataTable, type Column } from '../components/common/DataTable';
import { Loader } from '../components/common/Loader';
import { EmptyState } from '../components/common/EmptyState';
import { type StudentRegistration } from '../types';

export const Applications: React.FC = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  const [statusDialog, setStatusDialog] = useState<StudentRegistration | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data: applicationsData, isLoading } = useApplications({
    page: page + 1,
    per_page: rowsPerPage,
    sort_by: sortBy,
    sort_order: sortOrder,
    search,
    status: statusFilter,
  });

  const updateStatusMutation = useUpdateApplicationStatus();

  const columns: Column<StudentRegistration>[] = React.useMemo(() => [
    {
      id: 'id',
      label: 'ID',
      minWidth: 70,
      sortable: true,
    },
    {
      id: 'registration_id',
      label: t('applications.application_id'),
      minWidth: 150,
      sortable: true,
    },
    {
      id: 'personal_json.name',
      label: t('applications.student_name'),
      minWidth: 150,
      sortable: true,
      render: (_, row) => row.personal_json.name,
    },
    {
      id: 'program.title',
      label: t('applications.program'),
      minWidth: 150,
      render: (_, row) => row.program?.title || 'N/A',
    },
    {
      id: 'status',
      label: t('applications.application_status'),
      minWidth: 120,
      sortable: true,
    },
    {
      id: 'created_at',
      label: t('applications.submitted_at'),
      minWidth: 150,
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ], [t]);

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSortBy(field);
    setSortOrder(direction);
  };

  const handleOpenStatusDialog = (application: StudentRegistration) => {
    setStatusDialog(application);
    setNewStatus(application.status);
  };

  const handleCloseStatusDialog = () => {
    setStatusDialog(null);
    setNewStatus('');
  };

  const handleUpdateStatus = async () => {
    if (!statusDialog) return;
    
    try {
      await updateStatusMutation.mutateAsync({
        id: statusDialog.id,
        status: newStatus,
      });
      setSnackbar({
        open: true,
        message: t('applications.status_updated'),
        severity: 'success',
      });
      handleCloseStatusDialog();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error updating status',
        severity: 'error',
      });
    }
  };

  if (isLoading) {
    return <Loader message="Loading applications..." />;
  }

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">{t('applications.title')}</h1>

      {/* Summary Cards */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="px-3 py-2 rounded-lg bg-amber-500 text-white min-w-[150px]">
          <div className="text-lg font-semibold">{applicationsData?.data.filter(app => app.status === 'pending').length || 0}</div>
          <div className="text-xs opacity-90">Pending Applications</div>
        </div>
        <div className="px-3 py-2 rounded-lg bg-sky-500 text-white min-w-[150px]">
          <div className="text-lg font-semibold">{applicationsData?.data.filter(app => app.status === 'under_review').length || 0}</div>
          <div className="text-xs opacity-90">Under Review</div>
        </div>
        <div className="px-3 py-2 rounded-lg bg-emerald-600 text-white min-w-[150px]">
          <div className="text-lg font-semibold">{applicationsData?.data.filter(app => app.status === 'approved').length || 0}</div>
          <div className="text-xs opacity-90">Approved</div>
        </div>
        <div className="px-3 py-2 rounded-lg bg-rose-600 text-white min-w-[150px]">
          <div className="text-lg font-semibold">{applicationsData?.data.filter(app => app.status === 'rejected').length || 0}</div>
          <div className="text-xs opacity-90">Rejected</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-end">
        <div>
          <label className="block text-sm mb-1">{t('common.search')}</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[220px] h-10 px-3 rounded-lg border border-indigoSoft-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            placeholder={t('common.search') || 'Search'}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">{t('common.status')}</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-[180px] h-10 px-3 rounded-lg border border-indigoSoft-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      {applicationsData?.data.length === 0 ? (
        <EmptyState
          title={t('applications.no_applications')}
          description="No applications found matching your criteria"
        />
      ) : (
        <DataTable
          columns={columns}
          data={applicationsData?.data || []}
          totalCount={applicationsData?.total || 0}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
          onSort={handleSort}
          sortBy={sortBy}
          sortDirection={sortOrder}
          onView={(application) => {
            // TODO: Implement view application details
            console.log('View application:', application);
          }}
          onEdit={(application) => handleOpenStatusDialog(application)}
        />
      )}

      {/* Status Update Modal (Tailwind) */}
      {statusDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={handleCloseStatusDialog} />
          <div className="relative w-full max-w-md rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-card p-4">
            <h3 className="text-lg font-semibold mb-2">{t('applications.update_status')}</h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <div>Application ID: {statusDialog.registration_id}</div>
              <div>Student: {statusDialog.personal_json.name}</div>
              <div>Program: {statusDialog.program?.title || 'N/A'}</div>
            </div>
            <div className="mt-3">
              <label className="block text-sm mb-1">New Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              >
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={handleCloseStatusDialog} className="h-9 px-3 rounded-md border border-gray-200 dark:border-gray-700">
                {t('common.cancel')}
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={updateStatusMutation.isPending}
                className="h-9 px-3 rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
              >
                {updateStatusMutation.isPending ? t('common.loading') : t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar (Tailwind) */}
      {snackbar.open && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`min-w-[280px] max-w-sm px-4 py-3 rounded-lg shadow-card border ${snackbar.severity === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="text-sm">{snackbar.message}</div>
              <button className="text-sm opacity-70" onClick={() => setSnackbar({ ...snackbar, open: false })}>✕</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
