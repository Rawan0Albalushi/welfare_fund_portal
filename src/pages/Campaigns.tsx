import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';
import { campaignsService } from '../api/services/campaigns';
import { useCategories } from '../hooks/useCategories';
import { DataTable } from '../components/common/DataTable';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export const Campaigns: React.FC = () => {
	const { t } = useTranslation();
	const { isRTL } = useLanguage();
	const [loading, setLoading] = React.useState(false);
	const [items, setItems] = React.useState<any[]>([]);
	const [error, setError] = React.useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = React.useState(false);
	const [editingId, setEditingId] = React.useState<number | null>(null);
	const [deleteTarget, setDeleteTarget] = React.useState<any | null>(null);
	const [form, setForm] = React.useState({
		category_id: '' as unknown as number | '',
		title_ar: '',
		title_en: '',
		description_ar: '',
		description_en: '',
		goal_amount: '' as unknown as number | '',
		image: '',
		status: 'draft',
		start_date: '',
		end_date: '',
		target_donors: '' as unknown as number | '',
		impact_description_ar: '',
		impact_description_en: '',
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
			title_ar: '',
			title_en: '',
			description_ar: '',
			description_en: '',
			goal_amount: '' as unknown as number | '',
			image: '',
			status: 'draft',
			start_date: '',
			end_date: '',
			target_donors: '' as unknown as number | '',
			impact_description_ar: '',
			impact_description_en: '',
			campaign_highlights: '' as unknown as string,
		});
		setIsModalOpen(true);
	};

	const openEdit = (c: any) => {
		setEditingId(c.id);
		setForm({
			category_id: c.category_id ?? ('' as unknown as number | ''),
			title_ar: c.title_ar ?? '',
			title_en: c.title_en ?? '',
			description_ar: c.description_ar ?? '',
			description_en: c.description_en ?? '',
			goal_amount: (c.goal_amount ?? '') as unknown as number | '',
			image: c.image ?? '',
			status: c.status ?? 'draft',
			start_date: c.start_date ?? '',
			end_date: c.end_date ?? '',
			target_donors: (c.target_donors ?? '') as unknown as number | '',
			impact_description_ar: c.impact_description_ar ?? '',
			impact_description_en: c.impact_description_en ?? '',
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
			if (form.title_ar.trim().length === 0 || form.title_ar.trim().length > 255) {
				throw new Error('العنوان بالعربية مطلوب ويجب أن يكون ≤ 255 حرف');
			}
			if (form.title_en.trim().length === 0 || form.title_en.trim().length > 255) {
				throw new Error('English title is required and must be ≤ 255 characters');
			}
			if (form.description_ar.trim().length === 0) {
				throw new Error('الوصف بالعربية مطلوب');
			}
			if (form.description_en.trim().length === 0) {
				throw new Error('English description is required');
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
				title_ar: form.title_ar.trim(),
				title_en: form.title_en.trim(),
				description_ar: form.description_ar.trim(),
				description_en: form.description_en.trim(),
				goal_amount: Number(form.goal_amount),
				image: form.image?.trim() || undefined,
				status: form.status as 'draft' | 'active' | 'paused' | 'completed' | 'archived',
				start_date: form.start_date || undefined,
				end_date: form.end_date || undefined,
				target_donors: form.target_donors === '' ? undefined : Number(form.target_donors),
				impact_description_ar: form.impact_description_ar?.trim() || undefined,
				impact_description_en: form.impact_description_en?.trim() || undefined,
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
		<div className="w-full space-y-6">
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">{t('campaigns.title')}</h1>
				<button
					onClick={openCreate}
					className="w-full sm:w-auto h-10 px-4 rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
				>
					+ New Campaign
				</button>
			</div>

			{error && <div className="text-red-600 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">{error}</div>}

			{/* Filters */}
			<div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg">
					<div className="p-6">
						<form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
							<div className="space-y-2">
								<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">{t('campaigns.search')}</label>
								<input
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									placeholder={t('common.search') || 'Search...'}
									className="w-full h-11 px-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
									dir={isRTL ? 'rtl' : 'ltr'}
								/>
							</div>

							<div className="space-y-2">
								<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">{t('campaigns.status')}</label>
								<select
									value={statusFilter}
									onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
									className="w-full h-11 px-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
									dir={isRTL ? 'rtl' : 'ltr'}
								>
									<option value="">{t('campaigns.all_statuses')}</option>
									<option value="draft">Draft</option>
									<option value="active">{t('common.active')}</option>
									<option value="paused">Paused</option>
									<option value="completed">Completed</option>
									<option value="archived">Archived</option>
								</select>
							</div>

							<div className="space-y-2">
								<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">{t('campaigns.category')}</label>
								<select
									value={categoryFilter}
									onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}
									className="w-full h-11 px-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
									dir={isRTL ? 'rtl' : 'ltr'}
								>
									<option value="">{t('campaigns.all_categories')}</option>
									{(categoriesData?.data || []).map((cat) => (
										<option key={cat.id} value={String(cat.id)}>
											{isRTL ? (cat.name_ar || cat.name_en) : (cat.name_en || cat.name_ar)}
										</option>
									))}
								</select>
							</div>

							<div className="flex items-end gap-2">
								<button
									type="submit"
									className="flex-1 h-11 px-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
								>
									{t('campaigns.search_button')}
								</button>
								<button
									type="button"
									onClick={() => {
										setSearch('');
										setStatusFilter('');
										setCategoryFilter('');
										setPage(0);
									}}
									className="h-11 px-4 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-200 font-medium"
								>
									{t('campaigns.clear_button')}
								</button>
							</div>
						</form>
					</div>
				</div>
			<DataTable
				columns={[
					{ id: 'id', label: 'ID', minWidth: 60 },
					{ id: 'title_ar', label: 'العنوان (AR)', minWidth: 150 },
					{ id: 'title_en', label: 'Title (EN)', minWidth: 150 },
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
											<option key={cat.id} value={cat.id}>{cat.name_ar} - {cat.name_en}</option>
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

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm mb-1 font-semibold">العنوان (العربية) <span className="text-rose-500">*</span></label>
									<input value={form.title_ar} onChange={(e) => setForm({ ...form, title_ar: e.target.value })} required className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="أدخل العنوان بالعربية" dir="rtl" />
								</div>
								<div>
									<label className="block text-sm mb-1 font-semibold">Title (English) <span className="text-rose-500">*</span></label>
									<input value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} required className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="Enter title in English" dir="ltr" />
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm mb-1 font-semibold">الوصف (العربية) <span className="text-rose-500">*</span></label>
									<textarea value={form.description_ar} onChange={(e) => setForm({ ...form, description_ar: e.target.value })} rows={3} required className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="أدخل الوصف بالعربية" dir="rtl" />
								</div>
								<div>
									<label className="block text-sm mb-1 font-semibold">Description (English) <span className="text-rose-500">*</span></label>
									<textarea value={form.description_en} onChange={(e) => setForm({ ...form, description_en: e.target.value })} rows={3} required className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="Enter description in English" dir="ltr" />
								</div>
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
									<label className="block text-sm mb-1">التأثير (العربية) - اختياري</label>
									<textarea value={form.impact_description_ar} onChange={(e) => setForm({ ...form, impact_description_ar: e.target.value })} rows={2} className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="وصف التأثير بالعربية" dir="rtl" />
								</div>
								<div>
									<label className="block text-sm mb-1">Impact (English) - Optional</label>
									<textarea value={form.impact_description_en} onChange={(e) => setForm({ ...form, impact_description_en: e.target.value })} rows={2} className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500" placeholder="Impact description in English" dir="ltr" />
								</div>
							</div>

							<div>
								<label className="block text-sm mb-1">Highlights (comma-separated)</label>
								<input value={form.campaign_highlights as any as string} onChange={(e) => setForm({ ...form, campaign_highlights: e.target.value as any })} placeholder="e.g. Secure donations, Transparent reports" className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500" />
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
				message={`Are you sure you want to delete "${deleteTarget?.title_ar ?? deleteTarget?.title_en ?? ''}"? This action cannot be undone.`}
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


