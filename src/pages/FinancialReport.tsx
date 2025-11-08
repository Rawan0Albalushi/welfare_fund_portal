import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import { reportsService } from '../api/services/reports';
import { campaignsService } from '../api/services/campaigns';
import { useDonations } from '../hooks/useDonations';
import { Loader } from '../components/common/Loader';
import { EmptyState } from '../components/common/EmptyState';
import { DataTable, type Column } from '../components/common/DataTable';
import type { FinancialReportResponse } from '../api/services/reports';
import type { Campaign, Donation } from '../types';

export const FinancialReport: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { isRTL } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<FinancialReportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState<string>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [exporting, setExporting] = useState<'excel' | 'pdf' | null>(null);
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  
  // Donations pagination state
  const [donationsPage, setDonationsPage] = useState(0);
  const [donationsRowsPerPage, setDonationsRowsPerPage] = useState(10);

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await reportsService.getFinancialReport({
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
        period: period,
      });
      console.log('📊 [FinancialReport] Response received:', response);
      console.log('📊 [FinancialReport] Response data:', response?.data);
      console.log('📊 [FinancialReport] Summary:', response?.data?.summary);
      setReportData(response);
    } catch (err: any) {
      console.error('Failed to load financial report:', err);
      setError(err?.message || t('errors.server_error'));
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    void loadReport();
  }, []);

  React.useEffect(() => {
    let isMounted = true;
    const loadCampaigns = async () => {
      try {
        const response = await campaignsService.getCampaigns({ per_page: 200 });
        if (isMounted) {
          setCampaigns(response.data || []);
        }
      } catch (error) {
        console.error('Failed to load campaigns:', error);
      }
    };

    void loadCampaigns();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch donations for the donations table
  const { data: donationsData, isLoading: donationsLoading } = useDonations({
    page: donationsPage + 1,
    per_page: donationsRowsPerPage,
    sort_by: 'created_at',
    sort_order: 'desc',
    date_from: fromDate || undefined,
    date_to: toDate || undefined,
  });

  const campaignsLookup = React.useMemo(() => {
    return campaigns.reduce<Record<number, Campaign>>((acc, campaign) => {
      acc[campaign.id] = campaign;
      return acc;
    }, {});
  }, [campaigns]);

  const handleExportExcel = async () => {
    try {
      setExporting('excel');
      await reportsService.exportFinancialReportExcel({
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
        period: period,
      });
    } catch (error: any) {
      console.error('Export failed:', error);
      if (typeof window !== 'undefined') {
        const message = error?.message || t('errors.server_error');
        const event = new CustomEvent('app:snackbar', { detail: { message, severity: 'error' } });
        window.dispatchEvent(event);
      }
    } finally {
      setExporting(null);
    }
  };

  const handleExportPDF = async () => {
    try {
      setExporting('pdf');
      await reportsService.exportFinancialReportPDF({
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
        period: period,
      });
    } catch (error: any) {
      console.error('Export failed:', error);
      if (typeof window !== 'undefined') {
        const message = error?.message || 'فشل التصدير إلى PDF';
        const event = new CustomEvent('app:snackbar', { detail: { message, severity: 'error' } });
        window.dispatchEvent(event);
      }
    } finally {
      setExporting(null);
    }
  };

  const formatCurrency = React.useCallback((amount: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-OM' : 'en-OM', {
      style: 'currency',
      currency: 'OMR',
    }).format(amount);
  }, [isRTL]);

  // Removed unused formatDate helper to satisfy TypeScript build

  // Define columns for donations table
  const donationsColumns: Column<Donation>[] = React.useMemo(() => [
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
      render: (value) => formatCurrency(value || 0),
    },
    {
      id: 'maksab_fee_15',
      label: t('donations.maksab_fee_15'),
      minWidth: 150,
      sortable: false,
      render: (_value, row) => {
        const amount = Number(row?.amount) || 0;
        const fee = amount * 0.15;
        return formatCurrency(fee);
      },
    },
    {
      id: 'type',
      label: t('donations.donation_type'),
      minWidth: 120,
      sortable: true,
      render: (value) => (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
          value === 'quick' 
            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-sm' 
            : 'bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow-sm'
        }`}>
          {String(value)}
        </span>
      ),
    },
    {
      id: 'status',
      label: t('donations.donation_status'),
      minWidth: 120,
      sortable: true,
      render: (value) => (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
          value === 'paid' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
            : value === 'pending'
            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            : value === 'failed'
            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        }`}>
          {String(value)}
        </span>
      ),
    },
    {
      id: 'campaign.title',
      label: t('donations.campaign'),
      minWidth: 150,
      render: (_, row) => {
        const campaign = row.campaign ?? (row.campaign_id ? campaignsLookup[row.campaign_id] : undefined);
        const arTitle = campaign?.title_ar;
        const enTitle = campaign?.title_en;
        return isRTL ? (arTitle || enTitle) : (enTitle || arTitle) || 'N/A';
      },
    },
    {
      id: 'created_at',
      label: t('donations.created_at'),
      minWidth: 150,
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ], [t, formatCurrency, isRTL, campaignsLookup]);

  return (
    <div className="w-full space-y-6">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">{t('financial_report.title')}</h1>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={loadReport}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg font-medium"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>{t('common.loading')}</span>
              </>
            ) : (
              <>
                <span>🔄</span>
                <span>{t('financial_report.update_report')}</span>
              </>
            )}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportExcel}
            disabled={exporting === 'excel' || !reportData}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {exporting === 'excel' ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>{t('financial_report.exporting')}</span>
              </>
            ) : (
              <>
                <span>📊</span>
                <span>{t('financial_report.export_excel')}</span>
              </>
            )}
          </button>
          <button
            onClick={handleExportPDF}
            disabled={exporting === 'pdf' || !reportData}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {exporting === 'pdf' ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>{t('financial_report.exporting')}</span>
              </>
            ) : (
              <>
                <span>📄</span>
                <span>{t('financial_report.export_pdf')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t('financial_report.from_date')}
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t('financial_report.to_date')}
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t('financial_report.period_type')}
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as 'daily' | 'weekly' | 'monthly')}
              className="w-full h-11 px-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              <option value="daily">{t('financial_report.daily')}</option>
              <option value="weekly">{t('financial_report.weekly')}</option>
              <option value="monthly">{t('financial_report.monthly')}</option>
            </select>
          </div>
        </div>
      </div>

      {loading && !reportData && <Loader message={t('financial_report.loading_report')} />}
      
      {error && (
        <div className="rounded-xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {!loading && !error && !reportData && (
        <EmptyState
          title={t('financial_report.no_data')}
          description={t('financial_report.no_data_description')}
          icon="📊"
        />
      )}

      {reportData && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="stat-card stat-card-total">
              <div className="stat-card-icon bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                💰
              </div>
              <div className="stat-card-value">{formatCurrency(reportData.data.summary.total_donations)}</div>
              <div className="stat-card-label">{t('financial_report.total_donations')}</div>
              <div className="stat-card-subtitle">{i18n.language === 'en' ? 'Total Donations' : ''}</div>
            </div>
            <div className="stat-card stat-card-paid">
              <div className="stat-card-icon bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                ✅
              </div>
              <div className="stat-card-value">{formatCurrency(reportData.data.summary.paid_donations)}</div>
              <div className="stat-card-label">{t('financial_report.paid_donations')}</div>
              <div className="stat-card-subtitle">{i18n.language === 'en' ? 'Paid Donations' : ''}</div>
            </div>
            <div className="stat-card stat-card-pending">
              <div className="stat-card-icon bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                ⏳
              </div>
              <div className="stat-card-value">{formatCurrency(reportData.data.summary.pending_donations)}</div>
              <div className="stat-card-label">{t('financial_report.pending_donations')}</div>
              <div className="stat-card-subtitle">{i18n.language === 'en' ? 'Pending Donations' : ''}</div>
            </div>
            <div className="stat-card stat-card-info">
              <div className="stat-card-icon bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400">
                👥
              </div>
              <div className="stat-card-value">{reportData.data.summary.donors_count}</div>
              <div className="stat-card-label">{t('financial_report.donors_count')}</div>
              <div className="stat-card-subtitle">{i18n.language === 'en' ? 'Donors Count' : ''}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                🎭
              </div>
              <div className="stat-card-value">{reportData.data.summary.anonymous_count}</div>
              <div className="stat-card-label">{t('financial_report.anonymous_count')}</div>
              <div className="stat-card-subtitle">{i18n.language === 'en' ? 'Anonymous Donors' : ''}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                💼
              </div>
              {(() => {
                const total = Number(reportData.data.summary.total_donations) || 0;
                const fee = total * 0.15;
                return (
                  <>
                    <div className="stat-card-value">{formatCurrency(fee)}</div>
                    <div className="stat-card-label">{t('financial_report.maksab_fee_15')}</div>
                    <div className="stat-card-subtitle">{i18n.language === 'en' ? 'Maksab fee 15%' : ''}</div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Donations List */}
          {donationsLoading ? (
            <Loader message={i18n.language === 'ar' ? 'جاري تحميل التبرعات...' : 'Loading donations...'} />
          ) : !donationsData || !donationsData.data || donationsData.data.length === 0 ? (
            <EmptyState
              title={i18n.language === 'ar' ? 'لا توجد تبرعات' : 'No Donations'}
              description={i18n.language === 'ar' ? 'لا توجد تبرعات متاحة للعرض' : 'No donations available to display'}
              icon="💰"
            />
          ) : (
            <DataTable
              columns={donationsColumns}
              data={donationsData.data}
              page={donationsPage}
              rowsPerPage={donationsRowsPerPage}
              onPageChange={setDonationsPage}
              onRowsPerPageChange={setDonationsRowsPerPage}
              totalCount={donationsData.total || 0}
            />
          )}
        </div>
      )}
    </div>
  );
};

