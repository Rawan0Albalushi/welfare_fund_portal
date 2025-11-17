import React, { useState } from 'react';
// Lightweight alert replacement
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import { useApplications, useUpdateApplicationStatus } from '../hooks/useApplications';
import { DataTable, type Column } from '../components/common/DataTable';
import { Loader } from '../components/common/Loader';
import { EmptyState } from '../components/common/EmptyState';
import { type StudentRegistration } from '../types';
import { Modal } from '../components/common/Modal';
import apiClient from '../api/axios';
import { logger } from '../utils/logger';

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
      render: (_, row) => row.personal_json?.name || row.student_name || row.user?.name || 'N/A',
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
          totalCount={
            (typeof applicationsData?.total === 'number' && applicationsData.total > 0)
              ? applicationsData.total
              : ((applicationsData?.last_page && applicationsData?.per_page)
                  ? applicationsData.last_page * applicationsData.per_page
                  : (applicationsData?.data ?? []).length)
          }
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={(n) => { setRowsPerPage(n); setPage(0); }}
          onSort={handleSort}
          sortBy={sortBy}
          sortDirection={sortOrder}
          onView={(application) => setViewDialog(application)}
          onEdit={(application) => handleOpenStatusDialog(application)}
        />
      )}

      {/* Status Update Modal */}
      {statusDialog && (
        <Modal
          open={!!statusDialog}
          onClose={handleCloseStatusDialog}
          title={t('applications.update_status') || ''}
          icon={<span>✏️</span>}
          size="md"
          footer={
            <div className={`flex justify-end gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
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
          }
        >
          <div className="space-y-4 mb-2">
            <div className="space-y-1">
              <div className="text-sm text-slate-500 dark:text-slate-400">{t('applications.registration_id_label')}</div>
              <div className="font-semibold text-slate-900 dark:text-slate-100 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                {statusDialog.registration_id}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-slate-500 dark:text-slate-400">{t('applications.student_name_label')}</div>
              <div className="font-semibold text-slate-900 dark:text-slate-100 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                {statusDialog.personal_json?.name || statusDialog.student_name || statusDialog.user?.name || 'N/A'}
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
        </Modal>
      )}

      {/* View Details Modal */}
      {viewDialog && (
        <Modal
          open={!!viewDialog}
          onClose={() => setViewDialog(null)}
          title={t('applications.registration_details') || ''}
          icon={<span>📋</span>}
          size="xl"
          footer={
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setViewDialog(null)}
                className="px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
              >
                {t('applications.close')}
              </button>
            </div>
          }
        >
          <div className="max-h-[65vh] overflow-y-auto pr-1">
              {/* Top summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-1">
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">{t('applications.registration_id_label')}</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {viewDialog.registration_id}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">{t('applications.student_name_label')}</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {viewDialog.personal_json?.name || viewDialog.student_name || viewDialog.user?.name || 'N/A'}
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

              {/* All entered details (only backend-returned fields) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                {(() => {
                  const personalItems = [
                    { label: 'Student ID', value: viewDialog.student_id },
                    { label: 'Name', value: viewDialog.student_name ?? viewDialog.personal_json?.name ?? viewDialog.user?.name },
                    { label: 'Email', value: viewDialog.email ?? viewDialog.personal_json?.email },
                    { label: 'Phone', value: viewDialog.phone ?? viewDialog.personal_json?.phone },
                    { label: 'Notes', value: viewDialog.notes },
                  ].filter((i) => i.value !== null && i.value !== undefined && String(i.value) !== '');
                  if (personalItems.length === 0) return null;
                  return (
                    <div className="space-y-3">
                      <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('applications.personal_info')}</div>
                      {personalItems.map((item, idx) => (
                        <div key={`personal-${idx}`} className="space-y-1">
                          <div className="text-xs text-slate-500 dark:text-slate-400">{item.label}</div>
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                            {String(item.value)}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {/* Academic Information */}
                {(() => {
                  const academicItems = [
                    { label: 'University', value: viewDialog.university ?? viewDialog.academic_json?.university },
                    { label: 'College', value: viewDialog.college },
                    { label: 'Major', value: viewDialog.major ?? viewDialog.academic_json?.major },
                    { label: 'Academic Year', value: viewDialog.academic_year },
                    { label: 'GPA', value: (viewDialog.gpa ?? viewDialog.academic_json?.gpa) },
                  ].filter((i) => i.value !== null && i.value !== undefined && String(i.value) !== '');
                  if (academicItems.length === 0) return null;
                  return (
                    <div className="space-y-3">
                      <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('applications.academic_info')}</div>
                      {academicItems.map((item, idx) => (
                        <div key={`academic-${idx}`} className="space-y-1">
                          <div className="text-xs text-slate-500 dark:text-slate-400">{item.label}</div>
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                            {String(item.value)}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {/* Financial Information */}
                {(() => {
                  const financialItems = [
                    { label: 'Family Income', value: (viewDialog.family_income ?? viewDialog.financial_json?.income) },
                    { label: 'Family Members', value: viewDialog.family_members },
                    { label: 'Support Needed', value: viewDialog.support_needed },
                    { label: 'Expenses', value: viewDialog.financial_json?.expenses },
                  ].filter((i) => i.value !== null && i.value !== undefined && String(i.value) !== '');
                  if (financialItems.length === 0) return null;
                  return (
                    <div className="space-y-3">
                      <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('applications.financial_info')}</div>
                      {financialItems.map((item, idx) => (
                        <div key={`financial-${idx}`} className="space-y-1">
                          <div className="text-xs text-slate-500 dark:text-slate-400">{item.label}</div>
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                            {String(item.value)}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {/* Attachments */}
                {viewDialog.id_card_image ? (() => {
                  // Helper function to build correct image URL
                  const buildImageUrl = (imagePath: string): string => {
                    if (!imagePath) return '';
                    // If already absolute URL, return as is
                    if (/^https?:\/\//i.test(imagePath)) return imagePath;
                    
                    // Get base URL (e.g., http://localhost:8000)
                    const baseURL = apiClient.defaults.baseURL || '';
                    const baseHost = baseURL.replace(/\/api\/v1\/admin\/?$/, '');
                    
                    // If path starts with /api/, it's already a full path
                    if (imagePath.startsWith('/api/')) {
                      return `${baseHost}${imagePath}`;
                    }
                    
                    // If path starts with /, it's relative to base host
                    if (imagePath.startsWith('/')) {
                      return `${baseHost}${imagePath}`;
                    }
                    
                    // Otherwise, assume it's relative to /api/v1/admin/students/id_cards/
                    return `${baseURL}/students/id_cards/${imagePath.replace(/^\/+/, '')}`;
                  };
                  
                  const imageUrl = buildImageUrl(viewDialog.id_card_image);
                  
                  return (
                    <div className="space-y-3">
                      <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Attachments</div>
                      <div className="space-y-1">
                        <div className="text-xs text-slate-500 dark:text-slate-400">ID Card Image</div>
                        <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                          {/* Preview */}
                          <div className="flex items-start gap-3">
                            <img
                              src={imageUrl}
                              alt="ID Card"
                              className="max-h-40 rounded-lg border border-slate-200 dark:border-slate-700 object-contain bg-slate-50 dark:bg-slate-900"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                            />
                            <div className="flex flex-col gap-2">
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    // Use the same URL building logic, but fetch via API with auth
                                    const apiPath = viewDialog.id_card_image || '';
                                    // If path starts with /api/, use it directly
                                    const apiUrl = apiPath.startsWith('/api/') 
                                      ? apiPath 
                                      : apiPath.startsWith('/')
                                        ? apiPath
                                        : `/students/id_cards/${apiPath.replace(/^\/+/, '')}`;
                                    
                                    const response = await apiClient.get(apiUrl, { responseType: 'blob' });
                                    const blobUrl = URL.createObjectURL(response.data);
                                    window.open(blobUrl, '_blank', 'noopener');
                                    // Clean up after a delay
                                    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
                                  } catch (err) {
                                    logger.error('Error fetching image', err);
                                    // Fallback: try to open the direct URL
                                    window.open(imageUrl, '_blank', 'noopener');
                                  }
                                }}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-primary-200 text-primary-700 hover:bg-primary-50 dark:border-primary-900 dark:text-primary-300 dark:hover:bg-primary-900/20"
                              >
                                <span>Open full</span>
                                <span aria-hidden>🔗</span>
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    const apiPath = viewDialog.id_card_image || '';
                                    const apiUrl = apiPath.startsWith('/api/') 
                                      ? apiPath 
                                      : apiPath.startsWith('/')
                                        ? apiPath
                                        : `/students/id_cards/${apiPath.replace(/^\/+/, '')}`;
                                    
                                    const response = await apiClient.get(apiUrl, { responseType: 'blob' });
                                    const blob = response.data as Blob;
                                    const blobUrl = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    // Try to infer filename from response or use default
                                    const cd = (response.headers?.['content-disposition'] || response.headers?.['Content-Disposition']) as string | undefined;
                                    const match = cd && /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(cd);
                                    const filename = match 
                                      ? decodeURIComponent((match[1] || match[2] || 'id-card')).replace(/\s+/g, '_')
                                      : (apiPath.split('/').pop() || 'id-card') + (blob.type.includes('png') ? '.png' : blob.type.includes('jpg') || blob.type.includes('jpeg') ? '.jpg' : '');
                                    a.href = blobUrl;
                                    a.download = filename;
                                    document.body.appendChild(a);
                                    a.click();
                                    a.remove();
                                    URL.revokeObjectURL(blobUrl);
                                  } catch (err) {
                                    logger.error('Error downloading image', err);
                                    // Fallback: try direct download
                                    if (imageUrl) {
                                      const a = document.createElement('a');
                                      a.href = imageUrl;
                                      a.download = viewDialog.id_card_image?.split('/').pop() || 'id-card.png';
                                      document.body.appendChild(a);
                                      a.click();
                                      a.remove();
                                    }
                                  }
                                }}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                              >
                                <span>Download</span>
                                <span aria-hidden>⬇️</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })() : null}
              </div>
          </div>
        </Modal>
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
