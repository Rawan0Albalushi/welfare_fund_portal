import React, { useState } from 'react';
// removed MUI chip
import { useTranslation } from 'react-i18next';
import { useDonations } from '../hooks/useDonations';
import { DataTable, type Column } from '../components/common/DataTable';
import { Loader } from '../components/common/Loader';
import { EmptyState } from '../components/common/EmptyState';
import { type Donation } from '../types';

export const Donations: React.FC = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  const { data: donationsData, isLoading } = useDonations({
    page: page + 1,
    per_page: rowsPerPage,
    sort_by: sortBy,
    sort_order: sortOrder,
    search,
    status: statusFilter,
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
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${value === 'quick' ? 'bg-primary-100 text-primary-900' : 'bg-indigoSoft-200 text-primary-900'}`}>
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
      render: (_, row) => row.program?.title || 'N/A',
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

  if (isLoading) {
    return <Loader message="Loading donations..." />;
  }

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">{t('donations.title')}</h1>

      {/* Summary Cards */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="px-3 py-2 rounded-lg bg-primary-600 text-white min-w-[150px]">
          <div className="text-lg font-semibold">{donationsData?.total || 0}</div>
          <div className="text-xs opacity-90">Total Donations</div>
        </div>
        <div className="px-3 py-2 rounded-lg bg-emerald-600 text-white min-w-[150px]">
          <div className="text-lg font-semibold">{formatCurrency(
            donationsData?.data.reduce((sum, donation) => sum + donation.amount, 0) || 0
          )}</div>
          <div className="text-xs opacity-90">Total Amount</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 mb-4">
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
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Type</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-[180px] h-10 px-3 rounded-lg border border-indigoSoft-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          >
            <option value="">All Types</option>
            <option value="quick">Quick</option>
            <option value="program">Program</option>
            <option value="campaign">Campaign</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      {donationsData?.data.length === 0 ? (
        <EmptyState
          title={t('donations.no_donations')}
          description="No donations found matching your criteria"
        />
      ) : (
        <DataTable
          columns={columns}
          data={donationsData?.data || []}
          totalCount={donationsData?.total || 0}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
          onSort={handleSort}
          sortBy={sortBy}
          sortDirection={sortOrder}
          onView={(donation) => {
            // TODO: Implement view donation details
            console.log('View donation:', donation);
          }}
        />
      )}
    </div>
  );
};
