import React from 'react';
// Icon placeholders
import { useTranslation } from 'react-i18next';
import { useStats } from '../hooks/useDashboard';
import { useDonations } from '../hooks/useDonations';
import { useApplications } from '../hooks/useApplications';
import { Loader } from '../components/common/Loader';
import { EmptyState } from '../components/common/EmptyState';
import { StatCard } from '../components/common/StatCard';

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { data: stats, isLoading: statsLoading, error: statsError } = useStats();
  const { data: recentDonations, isLoading: donationsLoading, error: donationsError } = useDonations({
    per_page: 5,
    sort_by: 'created_at',
    sort_order: 'desc',
  });
  const { data: recentApplications, isLoading: applicationsLoading, error: applicationsError } = useApplications({
    per_page: 5,
    sort_by: 'created_at',
    sort_order: 'desc',
  });

  // Debug logging
  React.useEffect(() => {
    console.log('🏠 [Dashboard] Component rendered with state:', {
      stats,
      statsLoading,
      statsError,
      recentDonations,
      donationsLoading,
      donationsError,
      recentApplications,
      applicationsLoading,
      applicationsError,
      timestamp: new Date().toISOString()
    });
  }, [stats, statsLoading, statsError, recentDonations, donationsLoading, donationsError, recentApplications, applicationsLoading, applicationsError]);

  // Error boundary for dashboard
  if (statsError && !statsLoading) {
    console.error('🚨 [Dashboard] Critical error detected:', statsError);
  }

  // Check for critical errors that should prevent rendering
  if (statsError && statsError.message?.includes('Invalid')) {
    console.error('🚨 [Dashboard] Invalid data error, clearing localStorage');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = '/login';
    return null;
  }

  // Validate data structure to prevent undefined errors
  // Handle both direct array response and paginated response
  let donationsData: any[] | undefined, applicationsData: any[] | undefined;
  
  try {
    donationsData = Array.isArray(recentDonations) ? recentDonations : recentDonations?.data;
    applicationsData = Array.isArray(recentApplications) ? recentApplications : recentApplications?.data;
    
    const hasValidDonations = donationsData && Array.isArray(donationsData);
    const hasValidApplications = applicationsData && Array.isArray(applicationsData);
    
    console.log('🔍 [Dashboard] Data validation:', {
      hasValidDonations,
      hasValidApplications,
      donationsData,
      applicationsData,
      recentDonationsType: typeof recentDonations,
      recentApplicationsType: typeof recentApplications,
      isDonationsArray: Array.isArray(recentDonations),
      isApplicationsArray: Array.isArray(recentApplications)
    });
  } catch (error) {
    console.error('🚨 [Dashboard] Error in data validation:', error);
    donationsData = [];
    applicationsData = [];
  }

  const renderStatsSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="rounded-2xl border border-gray-200/70 dark:border-gray-800 p-4 sm:p-5 bg-white dark:bg-gray-900 shadow-card">
          <div className="animate-pulse flex items-center justify-between">
            <div className="space-y-2 w-full">
              <div className="h-3 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-7 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-800" />
          </div>
        </div>
      ))}
    </div>
  );

  const formatCurrency = (amount: number) => {
    try {
      if (typeof amount !== 'number' || isNaN(amount)) {
        return '$0.00';
      }
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
    } catch (error) {
      console.error('🚨 [Dashboard] Error formatting currency:', error);
      return '$0.00';
    }
  };

  const getStatusPill = (status: string) => {
    try {
      if (!status || typeof status !== 'string') {
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">Unknown</span>;
      }
      
      const map: Record<string, { label: string; cls: string }> = {
        pending: { label: t('common.pending'), cls: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
        paid: { label: 'Paid', cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
        failed: { label: 'Failed', cls: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300' },
        expired: { label: 'Expired', cls: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
        under_review: { label: t('common.under_review'), cls: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300' },
        approved: { label: t('common.approved'), cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
        rejected: { label: t('common.rejected'), cls: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300' },
      };
      const cfg = map[status] || { label: status, cls: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' };
      return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>{cfg.label}</span>;
    } catch (error) {
      console.error('🚨 [Dashboard] Error creating status pill:', error);
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">Error</span>;
    }
  };

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">{t('dashboard.title')}</h1>
      
      {/* Debug Info Panel */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="text-blue-800 dark:text-blue-200 font-semibold mb-2">معلومات التشخيص</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>API URL:</strong> {import.meta.env.VITE_API_URL || 'غير محدد'}</p>
            <p><strong>حالة الإحصائيات:</strong> {statsLoading ? 'جاري التحميل...' : statsError ? 'خطأ' : 'تم التحميل'}</p>
            <p><strong>حالة التبرعات:</strong> {donationsLoading ? 'جاري التحميل...' : donationsError ? 'خطأ' : 'تم التحميل'}</p>
          </div>
          <div>
            <p><strong>حالة الطلبات:</strong> {applicationsLoading ? 'جاري التحميل...' : applicationsError ? 'خطأ' : 'تم التحميل'}</p>
            <p><strong>Token موجود:</strong> {localStorage.getItem('admin_token') ? 'نعم' : 'لا'}</p>
            <p><strong>المستخدم محفوظ:</strong> {localStorage.getItem('admin_user') ? 'نعم' : 'لا'}</p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      {statsLoading ? (
        renderStatsSkeleton()
      ) : statsError ? (
        <div className="mb-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h3 className="text-red-800 dark:text-red-200 font-semibold mb-2">خطأ في تحميل إحصائيات الداشبورد</h3>
            <p className="text-red-700 dark:text-red-300 text-sm mb-2">
              {(statsError as any)?.message || 'حدث خطأ غير متوقع'}
            </p>
            
            {/* Special handling for 500 errors */}
            {(statsError as any)?.response?.status === 500 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mt-3">
                <h4 className="text-yellow-800 dark:text-yellow-200 font-semibold mb-2">مشكلة في الباكند</h4>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-2">
                  يبدو أن هناك مشكلة في الباكند عند حساب الإحصائيات. سيتم محاولة حساب الإحصائيات من البيانات المتاحة.
                </p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                >
                  إعادة المحاولة
                </button>
              </div>
            )}
            
            {/* Special handling for 401 errors */}
            {(statsError as any)?.response?.status === 401 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mt-3">
                <h4 className="text-yellow-800 dark:text-yellow-200 font-semibold mb-2">مشكلة في المصادقة</h4>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-2">
                  يبدو أن هناك مشكلة في المصادقة. قد تحتاج إلى تسجيل الدخول مرة أخرى.
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      localStorage.removeItem('admin_token');
                      localStorage.removeItem('admin_user');
                      window.location.href = '/login';
                    }}
                    className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                  >
                    تسجيل الدخول مرة أخرى
                  </button>
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                  >
                    إعادة تحميل الصفحة
                  </button>
                </div>
              </div>
            )}
            
            <details className="text-xs text-red-600 dark:text-red-400 mt-3">
              <summary className="cursor-pointer">تفاصيل الخطأ</summary>
              <pre className="mt-2 whitespace-pre-wrap">
                {JSON.stringify(statsError, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard title={t('dashboard.total_donations')} value={stats?.total_donations ?? 0} icon={<span>💰</span>} />
          <StatCard title={t('dashboard.total_amount')} value={formatCurrency(stats?.total_amount ?? 0)} icon={<span>📈</span>} />
          <StatCard title={t('dashboard.active_programs')} value={stats?.active_programs ?? 0} icon={<span>🎓</span>} />
          <StatCard title={t('dashboard.pending_applications')} value={stats?.pending_applications ?? 0} icon={<span>📝</span>} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Donations */}
        <section className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800 p-4 shadow-card">
          <h2 className="text-lg font-semibold mb-3">{t('dashboard.recent_donations')}</h2>
          {donationsLoading ? (
            <Loader />
          ) : donationsError ? (
            (donationsError as any)?.response?.status === 401 ? (
              <div className="text-center py-8">
                <div className="text-gray-500 dark:text-gray-400 mb-4">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className="text-sm">مشكلة في المصادقة - لا يمكن تحميل التبرعات</p>
                </div>
                <button 
                  onClick={() => {
                    localStorage.removeItem('admin_token');
                    localStorage.removeItem('admin_user');
                    window.location.href = '/login';
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  تسجيل الدخول
                </button>
              </div>
            ) : (
              <EmptyState title={t('errors.server_error')} description={(donationsError as any)?.message} />
            )
          ) : !donationsData || donationsData.length === 0 ? (
            <EmptyState title="No donations found" description="No recent donations to display" />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200/70 dark:border-gray-800">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-indigoSoft-200 dark:border-gray-800">
                    <th className="py-2 pr-4">{t('donations.donor_name')}</th>
                    <th className="py-2 pr-4">{t('donations.amount')}</th>
                    <th className="py-2 pr-4">{t('donations.donation_status')}</th>
                    <th className="py-2 pr-4">{t('donations.created_at')}</th>
                  </tr>
                </thead>
                <tbody>
                  {donationsData && Array.isArray(donationsData) ? donationsData.map((donation) => {
                    try {
                      return (
                        <tr key={donation?.id || Math.random()} className="border-b last:border-0 border-indigoSoft-200/70 dark:border-gray-800">
                          <td className="py-2 pr-4">{donation?.donor_name || 'N/A'}</td>
                          <td className="py-2 pr-4">{formatCurrency(donation?.amount || 0)}</td>
                          <td className="py-2 pr-4">{getStatusPill(donation?.status || 'unknown')}</td>
                          <td className="py-2 pr-4">{donation?.created_at ? new Date(donation.created_at).toLocaleDateString() : 'N/A'}</td>
                        </tr>
                      );
                    } catch (error) {
                      console.error('🚨 [Dashboard] Error rendering donation row:', error, donation);
                      return null;
                    }
                  }) : null}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Recent Applications */}
        <section className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800 p-4 shadow-card">
          <h2 className="text-lg font-semibold mb-3">{t('dashboard.recent_applications')}</h2>
          {applicationsLoading ? (
            <Loader />
          ) : applicationsError ? (
            (applicationsError as any)?.response?.status === 401 ? (
              <div className="text-center py-8">
                <div className="text-gray-500 dark:text-gray-400 mb-4">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className="text-sm">مشكلة في المصادقة - لا يمكن تحميل الطلبات</p>
                </div>
                <button 
                  onClick={() => {
                    localStorage.removeItem('admin_token');
                    localStorage.removeItem('admin_user');
                    window.location.href = '/login';
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  تسجيل الدخول
                </button>
              </div>
            ) : (
              <EmptyState title={t('errors.server_error')} description={(applicationsError as any)?.message} />
            )
          ) : !applicationsData || applicationsData.length === 0 ? (
            <EmptyState title="No applications found" description="No recent applications to display" />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200/70 dark:border-gray-800">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-indigoSoft-200 dark:border-gray-800">
                    <th className="py-2 pr-4">{t('applications.student_name')}</th>
                    <th className="py-2 pr-4">{t('applications.program')}</th>
                    <th className="py-2 pr-4">{t('applications.application_status')}</th>
                    <th className="py-2 pr-4">{t('applications.submitted_at')}</th>
                  </tr>
                </thead>
                <tbody>
                  {applicationsData && Array.isArray(applicationsData) ? applicationsData.map((application) => {
                    try {
                      return (
                        <tr key={application?.id || Math.random()} className="border-b last:border-0 border-indigoSoft-200/70 dark:border-gray-800">
                      <td className="py-2 pr-4">{application?.student_name || application?.personal_json?.name || 'N/A'}</td>
                          <td className="py-2 pr-4">{application?.program?.title || 'N/A'}</td>
                          <td className="py-2 pr-4">{getStatusPill(application?.status || 'unknown')}</td>
                          <td className="py-2 pr-4">{application?.created_at ? new Date(application.created_at).toLocaleDateString() : 'N/A'}</td>
                        </tr>
                      );
                    } catch (error) {
                      console.error('🚨 [Dashboard] Error rendering application row:', error, application);
                      return null;
                    }
                  }) : null}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
