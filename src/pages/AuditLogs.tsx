import React from 'react';
import { auditLogsService } from '../api/services/auditLogs';

export const AuditLogs: React.FC = () => {
	const [items, setItems] = React.useState<any[]>([]);
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const [userFilter, setUserFilter] = React.useState('');
	const [actionFilter, setActionFilter] = React.useState('');
	const [dateFrom, setDateFrom] = React.useState('');
	const [dateTo, setDateTo] = React.useState('');

	const load = async () => {
		try {
			setLoading(true);
			const res = await auditLogsService.getAuditLogs({ page: 1, per_page: 20, user_id: userFilter || undefined, action: actionFilter || undefined, date_from: dateFrom || undefined, date_to: dateTo || undefined } as any);
			setItems(res.data ?? []);
		} catch (e: any) {
			setError(e?.message ?? 'Failed to load');
		} finally {
			setLoading(false);
		}
	};

	React.useEffect(() => {
		void load();
	}, []);

	const exportCsv = () => {
		const headers = ['Time','User','Action','Model'];
		const rows = items.map((l) => [new Date(l.created_at ?? '').toISOString(), l.user_id ?? '', l.action ?? '', `${l.model_type ?? ''} #${l.model_id ?? ''}`]);
		const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replaceAll('"','""')}"`).join(','))].join('\n');
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `audit_logs_${Date.now()}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	};

	return (
		<div className="w-full">
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
				<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Audit Logs</h1>
				<button onClick={exportCsv} className="w-full sm:w-auto px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">Export CSV</button>
			</div>
			{loading && <div>Loading...</div>}
			{error && <div className="text-red-600">{error}</div>}
			<div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-end gap-3 mb-6">
				<div>
					<label className="block text-sm mb-1">User ID</label>
					<input value={userFilter} onChange={(e) => setUserFilter(e.target.value)} className="w-[160px] h-9 px-3 rounded-md border border-gray-200" />
				</div>
				<div>
					<label className="block text-sm mb-1">Action</label>
					<input value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="w-[180px] h-9 px-3 rounded-md border border-gray-200" />
				</div>
				<div>
					<label className="block text-sm mb-1">From</label>
					<input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-9 px-3 rounded-md border border-gray-200" />
				</div>
				<div>
					<label className="block text-sm mb-1">To</label>
					<input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-9 px-3 rounded-md border border-gray-200" />
				</div>
				<button onClick={() => void load()} className="h-9 px-3 rounded-md bg-gray-100">Filter</button>
			</div>
			<div className="overflow-auto rounded-lg border border-gray-200">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Time</th>
							<th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">User</th>
							<th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Action</th>
							<th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Model</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100 bg-white">
						{items.map((l) => (
							<tr key={l.id}>
								<td className="px-4 py-2">{new Date(l.created_at ?? '').toLocaleString()}</td>
								<td className="px-4 py-2">{l.user_id ?? '-'}</td>
								<td className="px-4 py-2">{l.action}</td>
								<td className="px-4 py-2">{l.model_type} #{l.model_id}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};


