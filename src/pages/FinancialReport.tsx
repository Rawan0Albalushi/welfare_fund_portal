import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import { reportsService } from '../api/services/reports';
import { Loader } from '../components/common/Loader';
import { EmptyState } from '../components/common/EmptyState';
import type { FinancialReportResponse } from '../api/services/reports';

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

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await reportsService.getFinancialReport({
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
        period: period,
      });
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
      alert(error?.message || t('errors.server_error'));
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
      alert(error?.message || 'فشل التصدير إلى PDF');
    } finally {
      setExporting(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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
          {/* Period Info */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">{t('financial_report.period_info')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <span className="text-sm text-slate-500 dark:text-slate-400">{t('financial_report.from')}:</span>
                <div className="font-semibold text-slate-900 dark:text-slate-100">{formatDate(reportData.data.period.from)}</div>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-slate-500 dark:text-slate-400">{t('financial_report.to')}:</span>
                <div className="font-semibold text-slate-900 dark:text-slate-100">{formatDate(reportData.data.period.to)}</div>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-slate-500 dark:text-slate-400">{t('financial_report.type')}:</span>
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  {reportData.data.period.type === 'daily' ? t('financial_report.daily') : 
                   reportData.data.period.type === 'weekly' ? t('financial_report.weekly') : t('financial_report.monthly')}
                </div>
              </div>
            </div>
          </div>

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
                📈
              </div>
              <div className="stat-card-value">{formatCurrency(reportData.data.summary.average_donation)}</div>
              <div className="stat-card-label">{t('financial_report.average_donation')}</div>
              <div className="stat-card-subtitle">{i18n.language === 'en' ? 'Average Donation' : ''}</div>
            </div>
          </div>

          {/* By Status */}
          {reportData.data.by_status && reportData.data.by_status.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg">
              <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('financial_report.by_status')}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-900">
                    <tr>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{t('financial_report.status')}</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{t('financial_report.count')}</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{t('financial_report.amount')}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                    {reportData.data.by_status.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{item.status}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">{item.count}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* By Type */}
          {reportData.data.by_type && reportData.data.by_type.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg">
              <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('financial_report.by_type')}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-900">
                    <tr>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{t('financial_report.type')}</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{t('financial_report.count')}</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{t('financial_report.amount')}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                    {reportData.data.by_type.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{item.type}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">{item.count}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Over Time */}
          {reportData.data.over_time && reportData.data.over_time.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg">
              <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('financial_report.over_time')}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-900">
                    <tr>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{t('financial_report.year')}</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{t('financial_report.month')}</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{t('financial_report.count')}</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{t('financial_report.amount')}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                    {reportData.data.over_time.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">{item.year}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">{item.month}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">{item.count}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

