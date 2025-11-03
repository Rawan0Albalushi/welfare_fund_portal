import React, { useState } from 'react';
// Lightweight alert replacement
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import { useApplications, useUpdateApplicationStatus } from '../hooks/useApplications';
import { DataTable, type Column } from '../components/common/DataTable';
import { Loader } from '../components/common/Loader';
import { EmptyState } from '../components/common/EmptyState';
import { type StudentRegistration } from '../types';

export const Applications: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { isRTL } = useLanguage();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  const [statusDialog, setStatusDialog] = useState<StudentRegistration | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [viewDialog, setViewDialog] = useState<StudentRegistration | null>(null);
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
      render: (_, row) => row.personal_json?.name || row.student_name || 'N/A',
    },
    {
      id: 'program.title',
      label: t('applications.program'),
      minWidth: 150,
      render: (_, row) => row.program?.title_ar || row.program?.title_en || 'N/A',
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
    return <Loader message="Loading student registration requests..." />;
  }

  // Calculate statistics
  const applications = applicationsData?.data ?? [];
  const pendingCount = applications.filter(app => app.status === 'pending').length;
  const underReviewCount = applications.filter(app => app.status === 'under_review').length;
  const approvedCount = applications.filter(app => app.status === 'approved').length;
  const rejectedCount = applications.filter(app => app.status === 'rejected').length;

  return (
    <div className="w-full space-y-6">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">{t('applications.title')}</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Card */}
        <div className="stat-card stat-card-pending">
          <div className="stat-card-icon bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
            ⏳
          </div>
          <div className="stat-card-value">{pendingCount}</div>
          <div className="stat-card-label">{t('applications.pending')}</div>
          <div className="stat-card-subtitle">{i18n.language === 'en' ? 'Pending' : ''}</div>
        </div>

        {/* Under Review Card */}
        <div className="stat-card stat-card-review">
          <div className="stat-card-icon bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400">
            🔍
          </div>
          <div className="stat-card-value">{underReviewCount}</div>
          <div className="stat-card-label">{t('applications.under_review')}</div>
          <div className="stat-card-subtitle">{i18n.language === 'en' ? 'Under Review' : ''}</div>
        </div>

        {/* Approved Card */}
        <div className="stat-card stat-card-approved">
          <div className="stat-card-icon bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
            ✅
          </div>
          <div className="stat-card-value">{approvedCount}</div>
          <div className="stat-card-label">{t('applications.approved')}</div>
          <div className="stat-card-subtitle">{i18n.language === 'en' ? 'Approved' : ''}</div>
        </div>

        {/* Rejected Card */}
        <div className="stat-card stat-card-rejected">
          <div className="stat-card-icon bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
            ❌
          </div>
          <div className="stat-card-value">{rejectedCount}</div>
          <div className="stat-card-label">{t('applications.rejected')}</div>
          <div className="stat-card-subtitle">{i18n.language === 'en' ? 'Rejected' : ''}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t('common.search')}
                </label>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder={t('common.search') || 'Search...'}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t('common.status')}
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">{t('applications.all_statuses')}</option>
                  <option value="pending">{t('applications.pending')}</option>
                  <option value="under_review">{t('applications.under_review')}</option>
                  <option value="approved">{t('applications.approved')}</option>
                  <option value="rejected">{t('applications.rejected')}</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('');
                  }}
                  className="w-full h-11 px-4 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-200 font-medium"
                >
                  {t('applications.clear_filters')}
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* Data Table */}
      {(applicationsData?.data ?? []).length === 0 ? (
        <EmptyState
          title={t('applications.no_applications')}
          description="No student registration requests found matching your criteria"
        />
      ) : (
        <DataTable
          columns={columns}
          data={applicationsData?.data ?? []}
          totalCount={applicationsData?.total ?? (applicationsData?.data ?? []).length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
          onSort={handleSort}
          sortBy={sortBy}
          sortDirection={sortOrder}
          onView={(application) => setViewDialog(application)}
          onEdit={(application) => handleOpenStatusDialog(application)}
        />
      )}

      {/* Status Update Modal */}
      {statusDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCloseStatusDialog} />
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 to-indigo-600 p-6">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl">
                  ✏️
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{t('applications.update_status')}</h3>
                  <p className="text-primary-100 text-sm">{i18n.language === 'en' ? 'Update Application Status' : ''}</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
              <div className="space-y-4 mb-4">
                <div className="space-y-1">
                  <div className="text-sm text-slate-500 dark:text-slate-400">{t('applications.registration_id_label')}</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {statusDialog.registration_id}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-slate-500 dark:text-slate-400">{t('applications.student_name_label')}</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {statusDialog.personal_json?.name || statusDialog.student_name || 'N/A'}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-slate-500 dark:text-slate-400">{t('applications.program_label')}</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {isRTL ? (statusDialog.program?.title_ar || statusDialog.program?.title_en) : (statusDialog.program?.title_en || statusDialog.program?.title_ar) || 'N/A'}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('applications.new_status')}</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  <option value="pending">{t('applications.pending')}</option>
                  <option value="under_review">{t('applications.under_review')}</option>
                  <option value="approved">{t('applications.approved')}</option>
                  <option value="rejected">{t('applications.rejected')}</option>
                </select>
              </div>

              {/* Modal Footer */}
              <div className={`flex justify-end gap-3 mt-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <button
                  onClick={handleCloseStatusDialog}
                  className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-200 font-medium"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleUpdateStatus}
                  disabled={updateStatusMutation.isPending}
                  className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                >
                  {updateStatusMutation.isPending ? t('common.loading') : t('common.save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setViewDialog(null)} />
          <div className="relative w-full max-w-3xl rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 to-indigo-600 p-6">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl">
                  📋
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{t('applications.registration_details')}</h3>
                  <p className="text-primary-100 text-sm">{i18n.language === 'en' ? 'Student Registration Details' : ''}</p>
                </div>
              </div>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-1">
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">{t('applications.student_name_label')}</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {viewDialog.personal_json?.name || viewDialog.student_name || 'N/A'}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">{t('applications.program_label')}</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {isRTL ? (viewDialog.program?.title_ar || viewDialog.program?.title_en) : (viewDialog.program?.title_en || viewDialog.program?.title_ar) || 'N/A'}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">{t('applications.status_label')}</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {viewDialog.status}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">{t('applications.submitted_date_label')}</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {new Date(viewDialog.created_at).toLocaleString(isRTL ? 'ar-SA' : 'en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>

              {/* Personal Info */}
              <div className="mb-4">
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('applications.personal_info')}</div>
                <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="text-xs font-mono text-slate-600 dark:text-slate-400 whitespace-pre-wrap break-words">
                    {JSON.stringify({
                      name: viewDialog.student_name || viewDialog.personal_json?.name,
                      email: viewDialog.email || viewDialog.personal_json?.email,
                      phone: viewDialog.phone || viewDialog.personal_json?.phone,
                      student_id: viewDialog.student_id,
                    }, null, 2)}
                  </div>
                </div>
              </div>

              {/* Academic & Financial Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('applications.academic_info')}</div>
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="text-xs font-mono text-slate-600 dark:text-slate-400 whitespace-pre-wrap break-words">
                      {JSON.stringify({
                        university: viewDialog.university || viewDialog.academic_json?.university,
                        college: viewDialog.college,
                        major: viewDialog.major || viewDialog.academic_json?.major,
                        academic_year: viewDialog.academic_year,
                        gpa: viewDialog.gpa || viewDialog.academic_json?.gpa,
                      }, null, 2)}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('applications.financial_info')}</div>
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="text-xs font-mono text-slate-600 dark:text-slate-400 whitespace-pre-wrap break-words">
                      {JSON.stringify({
                        family_income: viewDialog.family_income || viewDialog.financial_json?.income,
                        family_members: viewDialog.family_members,
                        support_needed: viewDialog.support_needed,
                      }, null, 2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewDialog(null)}
                className="px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
              >
                {t('applications.close')}
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
