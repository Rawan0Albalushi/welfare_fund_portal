import React from 'react';
import { campaignsService } from '../api/services/campaigns';
import { useCategories } from '../hooks/useCategories';
import { DataTable } from '../components/common/DataTable';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export const Campaigns: React.FC = () => {
	const [loading, setLoading] = React.useState(false);
	const [items, setItems] = React.useState<any[]>([]);
	const [error, setError] = React.useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = React.useState(false);
	const [editingId, setEditingId] = React.useState<number | null>(null);
	const [deleteTarget, setDeleteTarget] = React.useState<any | null>(null);
	const [form, setForm] = React.useState({
		category_id: '' as unknown as number | '',
		title: '',
		description: '',
		goal_amount: '' as unknown as number | '',
		image: '',
		status: 'draft',
		start_date: '',
		end_date: '',
		target_donors: '' as unknown as number | '',
		impact_description: '',
		campaign_highlights: '' as unknown as string,
	});
	const [formError, setFormError] = React.useState<string | null>(null);

	const { data: categoriesData } = useCategories({ per_page: 100 });

	// list controls
	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(10);
	const [total, setTotal] = React.useState(0);
	const [search, setSearch] = React.useState('');
	const [statusFilter, setStatusFilter] = React.useState<string>('');
	const [categoryFilter, setCategoryFilter] = React.useState<string>('');

	const load = async () => {
		try {
			setLoading(true);
			const res = await campaignsService.getCampaigns({
				page: page + 1,
				per_page: rowsPerPage,
				search: search || undefined,
				status: statusFilter || undefined,
				category_id: categoryFilter ? Number(categoryFilter) : undefined,
			});
			setItems(res.data ?? []);
			setTotal(res.total ?? (res.data?.length ?? 0));
		} catch (e: any) {
			setError(e?.message ?? 'Failed to load');
		} finally {
			setLoading(false);
		}
	};

	React.useEffect(() => {
		void load();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page, rowsPerPage]);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		setPage(0);
		void load();
	};

	const openCreate = () => {
		setEditingId(null);
		setForm({
			category_id: '' as unknown as number | '',
			title: '',
			description: '',
			goal_amount: '' as unknown as number | '',
			image: '',
			status: 'draft',
			start_date: '',
			end_date: '',
			target_donors: '' as unknown as number | '',
			impact_description: '',
			campaign_highlights: '' as unknown as string,
		});
		setIsModalOpen(true);
	};

	const openEdit = (c: any) => {
		setEditingId(c.id);
		setForm({
			category_id: c.category_id ?? ('' as unknown as number | ''),
			title: c.title ?? '',
			description: c.description ?? '',
			goal_amount: (c.goal_amount ?? '') as unknown as number | '',
			image: c.image ?? '',
			status: c.status ?? 'draft',
			start_date: c.start_date ?? '',
			end_date: c.end_date ?? '',
			target_donors: (c.target_donors ?? '') as unknown as number | '',
			impact_description: c.impact_description ?? '',
			campaign_highlights: Array.isArray(c.campaign_highlights) ? c.campaign_highlights.join(', ') : '',
		});
		setIsModalOpen(true);
	};

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			setLoading(true);
			setFormError(null);
			// Validation
			if (form.title.trim().length === 0 || form.title.trim().length > 255) {
				throw new Error('Title is required and must be ≤ 255 characters');
			}
			if (form.description.trim().length === 0) {
				throw new Error('Description is required');
			}
			if (form.category_id === '' || Number(form.category_id) <= 0) {
				throw new Error('Category is required');
			}
			if (form.goal_amount === '' || Number(form.goal_amount) < 0) {
				throw new Error('Goal amount must be a number ≥ 0');
			}
			if (form.target_donors !== '' && Number(form.target_donors) < 0) {
				throw new Error('Target donors must be ≥ 0');
			}
			if (form.start_date && form.end_date) {
				const start = new Date(form.start_date);
				const end = new Date(form.end_date);
				if (isFinite(start.getTime()) && isFinite(end.getTime()) && end < start) {
					throw new Error('End date must be after start date');
				}
			}
			const payload = {
				category_id: Number(form.category_id),
				title: form.title.trim(),
				description: form.description.trim(),
				goal_amount: Number(form.goal_amount),
				image: form.image?.trim() || undefined,
				status: form.status as 'draft' | 'active' | 'paused' | 'completed' | 'archived',
				start_date: form.start_date || undefined,
				end_date: form.end_date || undefined,
				target_donors: form.target_donors === '' ? undefined : Number(form.target_donors),
				impact_description: form.impact_description?.trim() || undefined,
				campaign_highlights: (form.campaign_highlights || '')
					.split(',')
					.map((s) => s.trim())
					.filter((s) => s.length > 0),
			};
			if (editingId == null) {
				await campaignsService.createCampaign(payload as any);
			} else {
				await campaignsService.updateCampaign(editingId, payload as any);
			}
			setIsModalOpen(false);
			await load();
		} catch (e: any) {
			setFormError(e?.message ?? 'Failed to save');
		} finally {
			setLoading(false);
		}
	};

	const confirmDelete = async () => {
		if (!deleteTarget) return;
		try {
			setLoading(true);
			await campaignsService.deleteCampaign(deleteTarget.id);
			setDeleteTarget(null);
			await load();
		} catch (e: any) {
			setError(e?.message ?? 'Failed to delete');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="p-4">
			<div className="flex items-center justify-between mb-4 gap-2">
				<h1 className="text-xl font-semibold">Campaigns</h1>
				<div className="flex items-center gap-2">
					<form onSubmit={handleSearch} className="flex items-center gap-2">
						<input
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search..."
							className="h-9 rounded-md border border-gray-300 px-3 focus:outline-none focus:ring-1 focus:ring-primary-500"
						/>
						<select
							value={statusFilter}
							onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
							className="h-9 rounded-md border border-gray-300 px-2"
						>
							<option value="">All statuses</option>
							<option value="draft">Draft</option>
							<option value="active">Active</option>
							<option value="paused">Paused</option>
							<option value="completed">Completed</option>
							<option value="archived">Archived</option>
						</select>
						<select
							value={categoryFilter}
							onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}
							className="h-9 rounded-md border border-gray-300 px-2"
						>
							<option value="">All categories</option>
							{(categoriesData?.data || []).map((cat) => (
								<option key={cat.id} value={String(cat.id)}>{cat.name}</option>
							))}
						</select>
						<button type="submit" className="h-9 px-3 rounded-md bg-primary-600 text-white">Search</button>
					</form>
					<button onClick={openCreate} className="h-9 px-3 bg-primary-600 text-white rounded-md">New</button>
				</div>
			</div>
			{error && <div className="text-red-600 mb-2">{error}</div>}
			<div className="mb-2 text-sm text-gray-600">
				{total > 0 ? (
					<span>
						Showing {Math.min(total, page * rowsPerPage + 1)}-
						{Math.min(total, (page + 1) * rowsPerPage)} of {total}
					</span>
				) : (
					<span>No results</span>
				)}
			</div>
			<DataTable
				columns={[
					{ id: 'id', label: 'ID', minWidth: 60 },
					{ id: 'title', label: 'Title', minWidth: 200 },
					{ id: 'status', label: 'Status', minWidth: 120 },
					{ id: 'goal_amount', label: 'Goal', minWidth: 100, render: (v) => (v != null ? Number(v).toLocaleString() : '-') },
					{ id: 'start_date', label: 'Start', minWidth: 120, render: (v) => (v ? new Date(v).toLocaleDateString() : '-') },
					{ id: 'end_date', label: 'End', minWidth: 120, render: (v) => (v ? new Date(v).toLocaleDateString() : '-') },
				]}
				data={items}
				loading={loading}
				page={page}
				rowsPerPage={rowsPerPage}
				totalCount={total}
				onPageChange={(p) => setPage(p)}
				onRowsPerPageChange={(n) => { setRowsPerPage(n); setPage(0); }}
				onEdit={(row) => openEdit(row)}
				onDelete={(row) => setDeleteTarget(row)}
			/>

			{isModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
					<div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-xl font-semibold">{editingId == null ? 'New Campaign' : 'Edit Campaign'}</h2>
							<button onClick={() => setIsModalOpen(false)} className="text-gray-500">✕</button>
						</div>
						<form onSubmit={handleSave} className="space-y-5">
							{formError && <div className="text-red-600 text-sm">{formError}</div>}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="md:col-span-1">
									<label className="block text-sm mb-1">Category</label>
									<select
										value={form.category_id as any as string}
										onChange={(e) => setForm({ ...form, category_id: (e.target.value === '' ? '' : Number(e.target.value)) as any })}
										required
										className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
									>
										<option value="">Select category</option>
										{(categoriesData?.data || []).map((cat) => (
											<option key={cat.id} value={cat.id}>{cat.name}</option>
										))}
									</select>
								</div>
								<div className="md:col-span-1">
									<label className="block text-sm mb-1">Status</label>
									<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
										<option value="draft">Draft</option>
										<option value="active">Active</option>
										<option value="paused">Paused</option>
										<option value="completed">Completed</option>
										<option value="archived">Archived</option>
									</select>
								</div>
							</div>

							<div>
								<label className="block text-sm mb-1">Title</label>
								<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
							</div>

							<div>
								<label className="block text-sm mb-1">Description</label>
								<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} required className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm mb-1">Goal Amount</label>
									<input type="number" min="0" value={form.goal_amount as any as string} onChange={(e) => setForm({ ...form, goal_amount: (e.target.value === '' ? '' : Number(e.target.value)) as any })} required className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
								</div>
								<div>
									<label className="block text-sm mb-1">Target Donors</label>
									<input type="number" min="0" value={form.target_donors as any as string} onChange={(e) => setForm({ ...form, target_donors: (e.target.value === '' ? '' : Number(e.target.value)) as any })} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
								</div>
							</div>

							<div>
								<label className="block text-sm mb-1">Image URL</label>
								<input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm mb-1">Start Date</label>
									<input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
								</div>
								<div>
									<label className="block text-sm mb-1">End Date</label>
									<input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm mb-1">Highlights (comma-separated)</label>
									<input value={form.campaign_highlights as any as string} onChange={(e) => setForm({ ...form, campaign_highlights: e.target.value as any })} placeholder="e.g. Secure donations, Transparent reports" className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
								</div>
								<div>
									<label className="block text-sm mb-1">Impact Description</label>
									<textarea value={form.impact_description} onChange={(e) => setForm({ ...form, impact_description: e.target.value })} rows={2} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
								</div>
							</div>

							<div className="flex items-center justify-end gap-2 pt-2">
								<button type="button" onClick={() => setIsModalOpen(false)} className="px-3 py-2 rounded-md border border-gray-300">Cancel</button>
								<button type="submit" className="px-3 py-2 rounded-md bg-primary-600 text-white">{editingId == null ? 'Create' : 'Save'}</button>
							</div>
						</form>
					</div>
				</div>
			)}

			<ConfirmDialog
				open={!!deleteTarget}
				title="Delete Campaign"
				message={`Are you sure you want to delete "${deleteTarget?.title ?? ''}"? This action cannot be undone.`}
				confirmText="Delete"
				cancelText="Cancel"
				severity="error"
				onConfirm={confirmDelete}
				onCancel={() => setDeleteTarget(null)}
				loading={loading}
			/>
		</div>
	);
};


