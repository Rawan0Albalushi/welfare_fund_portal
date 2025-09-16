import React from 'react';
// Icon placeholders
import { useTranslation } from 'react-i18next';
import { useDashboardStats } from '../hooks/useDashboard';
import { useDonations } from '../hooks/useDonations';
import { useApplications } from '../hooks/useApplications';
import { Loader } from '../components/common/Loader';
import { EmptyState } from '../components/common/EmptyState';

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentDonations, isLoading: donationsLoading } = useDonations({
    per_page: 5,
    sort_by: 'created_at',
    sort_order: 'desc',
  });
  const { data: recentApplications, isLoading: applicationsLoading } = useApplications({
    per_page: 5,
    sort_by: 'created_at',
    sort_order: 'desc',
  });

  if (statsLoading) {
    return <Loader message="Loading dashboard..." />;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusPill = (status: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      pending: { label: t('common.pending'), cls: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
      paid: { label: 'Paid', cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
      failed: { label: 'Failed', cls: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300' },
      under_review: { label: t('common.under_review'), cls: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300' },
      approved: { label: t('common.approved'), cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
      rejected: { label: t('common.rejected'), cls: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300' },
    };
    const cfg = map[status] || { label: status, cls: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' };
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>{cfg.label}</span>;
  };

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">{t('dashboard.title')}</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl bg-white dark:bg-gray-900 border border-indigoSoft-200 dark:border-gray-800 p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary-100 text-primary-800">💰</div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.total_donations')}</div>
              <div className="text-xl font-semibold">{stats?.total_donations || 0}</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800 p-4 shadow-card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-skySoft-200 text-primary-900">📈</div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.total_amount')}</div>
              <div className="text-xl font-semibold">{formatCurrency(stats?.total_amount || 0)}</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800 p-4 shadow-card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-indigoSoft-200 text-primary-900">🎓</div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.active_programs')}</div>
              <div className="text-xl font-semibold">{stats?.active_programs || 0}</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800 p-4 shadow-card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-roseSoft-200 text-primary-900">📝</div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.pending_applications')}</div>
              <div className="text-xl font-semibold">{stats?.pending_applications || 0}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Donations */}
        <section className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800 p-4 shadow-card">
          <h2 className="text-lg font-semibold mb-3">{t('dashboard.recent_donations')}</h2>
          {donationsLoading ? (
            <Loader />
          ) : recentDonations?.data.length === 0 ? (
            <EmptyState title="No donations found" description="No recent donations to display" />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200/70 dark:border-gray-800">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-indigoSoft-200 dark:border-gray-800">
                    <th className="py-2 pr-4">Donor</th>
                    <th className="py-2 pr-4">Amount</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDonations?.data.map((donation) => (
                    <tr key={donation.id} className="border-b last:border-0 border-indigoSoft-200/70 dark:border-gray-800">
                      <td className="py-2 pr-4">{donation.donor_name}</td>
                      <td className="py-2 pr-4">{formatCurrency(donation.amount)}</td>
                      <td className="py-2 pr-4">{getStatusPill(donation.status)}</td>
                      <td className="py-2 pr-4">{new Date(donation.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
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
          ) : recentApplications?.data.length === 0 ? (
            <EmptyState title="No applications found" description="No recent applications to display" />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200/70 dark:border-gray-800">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-indigoSoft-200 dark:border-gray-800">
                    <th className="py-2 pr-4">Student</th>
                    <th className="py-2 pr-4">Program</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentApplications?.data.map((application) => (
                    <tr key={application.id} className="border-b last:border-0 border-indigoSoft-200/70 dark:border-gray-800">
                      <td className="py-2 pr-4">{application.personal_json.name}</td>
                      <td className="py-2 pr-4">{application.program?.title || 'N/A'}</td>
                      <td className="py-2 pr-4">{getStatusPill(application.status)}</td>
                      <td className="py-2 pr-4">{new Date(application.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
