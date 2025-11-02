import React, { useState } from 'react';
// removed MUI chip
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import { useDonations } from '../hooks/useDonations';
import { usePrograms } from '../hooks/usePrograms';
import { campaignsService } from '../api/services/campaigns';
import { reportsService } from '../api/services/reports';
import { DataTable, type Column } from '../components/common/DataTable';
import { Loader } from '../components/common/Loader';
import { EmptyState } from '../components/common/EmptyState';
import { type Donation } from '../types';

export const Donations: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { isRTL } = useLanguage();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [programFilter, setProgramFilter] = useState<string>('');
  const [campaignFilter, setCampaignFilter] = useState<string>('');
  const [viewDialog, setViewDialog] = useState<Donation | null>(null);
  const [exporting, setExporting] = useState<'excel' | 'pdf' | null>(null);
  
  const { data: programsData } = usePrograms({ per_page: 100 });
  const [campaigns, setCampaigns] = React.useState<any[]>([]);

  // Load campaigns
  React.useEffect(() => {
    const loadCampaigns = async () => {
      try {
        const res = await campaignsService.getCampaigns({ per_page: 100 });
        setCampaigns(res.data ?? []);
      } catch (e) {
        console.error('Failed to load campaigns:', e);
      }
    };
    void loadCampaigns();
  }, []);

  const { data: donationsData, isLoading } = useDonations({
    page: page + 1,
    per_page: rowsPerPage,
    sort_by: sortBy,
    sort_order: sortOrder,
    search,
    status: statusFilter,
    type: typeFilter || undefined,
    program_id: programFilter ? Number(programFilter) : undefined,
    campaign_id: campaignFilter ? Number(campaignFilter) : undefined,
    date_from: fromDate || undefined,
    date_to: toDate || undefined,
  });

  const columns: Column<Donation>[] = React.useMemo(() => [
    {
      id: 'id',
      label: 'ID',
      minWidth: 70,
      sortable: true,
    },
    {
      id: 'donation_id',
      label: t('donations.donation_id'),
      minWidth: 150,
      sortable: true,
    },
    {
      id: 'donor_name',
      label: t('donations.donor_name'),
      minWidth: 150,
      sortable: true,
    },
    {
      id: 'amount',
      label: t('donations.amount'),
      minWidth: 120,
      sortable: true,
      render: (value) => `$${value?.toLocaleString()}`,
    },
    {
      id: 'type',
      label: t('donations.donation_type'),
      minWidth: 120,
      sortable: true,
      render: (value) => (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${value === 'quick' ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-sm' : 'bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-sm'}`}>
          {String(value)}
        </span>
      ),
    },
    {
      id: 'status',
      label: t('donations.donation_status'),
      minWidth: 120,
      sortable: true,
    },
    {
      id: 'program.title',
      label: t('donations.program'),
      minWidth: 150,
      render: (_, row) => row.program?.title_ar || row.program?.title_en || 'N/A',
    },
    {
      id: 'created_at',
      label: t('donations.created_at'),
      minWidth: 150,
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ], [t]);

  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSortBy(field);
    setSortOrder(direction);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleExportExcel = async () => {
    try {
      setExporting('excel');
      await reportsService.exportDonationsReportExcel({
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
        status: statusFilter ? (statusFilter as 'pending' | 'paid' | 'failed' | 'expired') : undefined,
        type: typeFilter ? (typeFilter as 'quick' | 'gift') : undefined,
        program_id: programFilter ? Number(programFilter) : undefined,
        campaign_id: campaignFilter ? Number(campaignFilter) : undefined,
      });
    } catch (error: any) {
      console.error('Export failed:', error);
      alert(error?.message || 'فشل التصدير إلى Excel');
    } finally {
      setExporting(null);
    }
  };

  const handleExportPDF = async () => {
    try {
      setExporting('pdf');
      await reportsService.exportDonationsReportPDF({
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
        status: statusFilter ? (statusFilter as 'pending' | 'paid' | 'failed' | 'expired') : undefined,
        type: typeFilter ? (typeFilter as 'quick' | 'gift') : undefined,
        program_id: programFilter ? Number(programFilter) : undefined,
        campaign_id: campaignFilter ? Number(campaignFilter) : undefined,
      });
    } catch (error: any) {
      console.error('Export failed:', error);
      alert(error?.message || 'فشل التصدير إلى PDF');
    } finally {
      setExporting(null);
    }
  };

  // Calculate statistics
  const donations = donationsData?.data ?? [];
  const totalAmount = donations.reduce((sum, donation) => sum + (donation?.amount || 0), 0);
  const paidCount = donations.filter(d => d.status === 'paid').length;
  const averageAmount = donations.length > 0 ? totalAmount / donations.length : 0;

  if (isLoading) {
    return <Loader message="Loading donations..." />;
  }

  return (
    <div className="w-full space-y-6 animate-fade-in">
      {/* Page Header */}
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">{t('donations.title')}</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Donations Card */}
        <div className="stat-card">
          <div className="stat-card-icon bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            📊
          </div>
          <div className="stat-card-value">{donationsData?.total || 0}</div>
          <div className="stat-card-label">{t('donations.total_donations')}</div>
          <div className="stat-card-subtitle">{i18n.language === 'en' ? 'Total Donations' : ''}</div>
        </div>

        {/* Total Amount Card */}
        <div className="stat-card">
          <div className="stat-card-icon bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
            💵
          </div>
          <div className="stat-card-value">{formatCurrency(totalAmount)}</div>
          <div className="stat-card-label">{t('donations.total_amount')}</div>
          <div className="stat-card-subtitle">{i18n.language === 'en' ? 'Total Amount' : ''}</div>
        </div>

        {/* Paid Donations Card */}
        <div className="stat-card">
          <div className="stat-card-icon bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
            ✅
          </div>
          <div className="stat-card-value">{paidCount}</div>
          <div className="stat-card-label">{t('donations.paid_donations')}</div>
          <div className="stat-card-subtitle">{i18n.language === 'en' ? 'Paid Donations' : ''}</div>
        </div>

        {/* Average Amount Card */}
        <div className="stat-card">
          <div className="stat-card-icon bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
            📈
          </div>
          <div className="stat-card-value">{formatCurrency(averageAmount)}</div>
          <div className="stat-card-label">{t('donations.average_amount')}</div>
          <div className="stat-card-subtitle">{i18n.language === 'en' ? 'Average Amount' : ''}</div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportExcel}
            disabled={exporting === 'excel'}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-md"
          >
            {exporting === 'excel' ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>{t('donations.exporting')}</span>
              </>
            ) : (
              <>
                <span>📊</span>
                <span>{t('donations.export_excel')}</span>
              </>
            )}
          </button>
          <button
            onClick={handleExportPDF}
            disabled={exporting === 'pdf'}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-md"
          >
            {exporting === 'pdf' ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>{t('donations.exporting')}</span>
              </>
            ) : (
              <>
                <span>📄</span>
                <span>{t('donations.export_pdf')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Search */}
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

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t('common.status')}
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">{t('donations.all_statuses')}</option>
                  <option value="pending">{t('common.pending')}</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              {/* Type Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t('donations.donation_type')}
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  <option value="">{t('donations.all_types')}</option>
                  <option value="quick">Quick</option>
                  <option value="gift">Gift</option>
                </select>
              </div>

              {/* From Date */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t('donations.from_date')}
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  dir="ltr"
                />
              </div>

              {/* To Date */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t('donations.to_date')}
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  dir="ltr"
                />
              </div>

              {/* Program Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t('donations.program')}
                </label>
                <select
                  value={programFilter}
                  onChange={(e) => setProgramFilter(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  <option value="">{t('donations.all_programs')}</option>
                  {(programsData?.data || []).map((program) => (
                    <option key={program.id} value={program.id}>
                      {isRTL ? (program.title_ar || program.title_en) : (program.title_en || program.title_ar)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Campaign Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Campaign
                </label>
                <select
                  value={campaignFilter}
                  onChange={(e) => setCampaignFilter(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  <option value="">{t('donations.all_campaigns')}</option>
                  {campaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>
                      {isRTL ? (campaign.title_ar || campaign.title_en) : (campaign.title_en || campaign.title_ar)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters Button */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('');
                    setTypeFilter('');
                    setFromDate('');
                    setToDate('');
                    setProgramFilter('');
                    setCampaignFilter('');
                  }}
                  className="w-full h-11 px-4 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-200 font-medium"
                >
                  {t('donations.clear_filters')}
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* Data Table */}
      {(donationsData?.data?.length ?? 0) === 0 ? (
        <EmptyState
          title={t('donations.no_donations')}
          description={t('donations.no_donations')}
          icon="💰"
        />
      ) : (
        <DataTable
          columns={columns}
          data={donationsData?.data ?? []}
          totalCount={donationsData?.total || 0}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
          onSort={handleSort}
          sortBy={sortBy}
          sortDirection={sortOrder}
          onView={(donation) => setViewDialog(donation)}
        />
      )}

      {/* Enhanced Modal */}
      {viewDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setViewDialog(null)} />
          <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 to-indigo-600 p-6">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl">
                  💰
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{t('donations.donation_details')}</h3>
                  <p className="text-primary-100 text-sm">{i18n.language === 'en' ? 'Donation Details' : ''}</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">{t('donations.donation_id_label')}</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {viewDialog.donation_id}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">{t('donations.donor_label')}</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {viewDialog.donor_name}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">{t('donations.amount_label')}</div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400 text-xl p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                    {formatCurrency(viewDialog.amount)}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">{t('donations.status_label')}</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {viewDialog.status}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">{t('donations.program_label')}</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {isRTL ? (viewDialog.program?.title_ar || viewDialog.program?.title_en) : (viewDialog.program?.title_en || viewDialog.program?.title_ar) || 'N/A'}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">{t('donations.created_label')}</div>
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

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setViewDialog(null)}
                  className="px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                >
                  {t('donations.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
