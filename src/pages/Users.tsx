import React from 'react';
import { usersService } from '../api/services/users';
import { rolesService } from '../api/services/roles';
import { DataTable, type Column } from '../components/common/DataTable';
import { EmptyState } from '../components/common/EmptyState';
import { Loader } from '../components/common/Loader';
import { type User } from '../api/services/users';

export const Users: React.FC = () => {
	const [loading, setLoading] = React.useState(false);
	const [items, setItems] = React.useState<User[]>([]);
	const [total, setTotal] = React.useState(0);
	const [page, setPage] = React.useState(0);
	const [rowsPerPage, setRowsPerPage] = React.useState(10);
	const [error, setError] = React.useState<string | null>(null);
	const [roles, setRoles] = React.useState<any[]>([]);
	const [isModalOpen, setIsModalOpen] = React.useState(false);
	const [editingId, setEditingId] = React.useState<number | null>(null);
	const [form, setForm] = React.useState({
		name: '',
		phone: '',
		email: '',
		password: '',
		role_ids: [] as number[],
	});

	const columns: Column<User>[] = React.useMemo(() => [
		{
			id: 'id',
			label: 'ID',
			minWidth: 70,
			sortable: true,
		},
		{
			id: 'name',
			label: 'Name',
			minWidth: 150,
			sortable: true,
		},
		{
			id: 'phone',
			label: 'Phone',
			minWidth: 120,
			sortable: true,
		},
		{
			id: 'email',
			label: 'Email',
			minWidth: 200,
			sortable: true,
		},
		{
			id: 'created_at',
			label: 'Created At',
			minWidth: 150,
			sortable: true,
			render: (value) => value ? new Date(value).toLocaleDateString() : '-',
		},
	], []);

	const load = async () => {
		try {
			setLoading(true);
			const res = await usersService.getUsers({ page: page + 1, per_page: rowsPerPage });
			setItems(res.data ?? []);
			setTotal(
				(typeof res.total === 'number' && res.total > 0)
					? res.total
					: ((res.last_page && res.per_page)
							? res.last_page * res.per_page
							: (res.data?.length ?? 0))
			);
		} catch (e: any) {
			setError(e?.message ?? 'Failed to load');
		} finally {
			setLoading(false);
		}
	};

	const loadRoles = async () => {
		try {
			const res = await rolesService.getRoles({ page: 1, per_page: 100 });
			setRoles(Array.isArray(res as any) ? (res as any) : ((res as any)?.data ?? []));
		} catch {}
	};

	React.useEffect(() => {
		void load();
		void loadRoles();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page, rowsPerPage]);

	const openCreate = () => {
		setEditingId(null);
		setForm({ name: '', phone: '', email: '', password: '', role_ids: [] });
		setIsModalOpen(true);
	};

	const openEdit = (u: User) => {
		setEditingId(u.id);
		setForm({ name: u.name ?? '', phone: u.phone ?? '', email: u.email ?? '', password: '', role_ids: (u as any).roles?.map((r: any) => r.id) ?? [] });
		setIsModalOpen(true);
	};

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			setLoading(true);
			const payload: any = { name: form.name, phone: form.phone || undefined, email: form.email || undefined, role_ids: form.role_ids };
			if (editingId == null) {
				if (form.password) payload.password = form.password;
				await usersService.createUser(payload);
			} else {
				if (form.password) payload.password = form.password;
				await usersService.updateUser(editingId, payload);
			}
			setIsModalOpen(false);
			await load();
		} catch (e: any) {
			setError(e?.message ?? 'Failed to save');
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (user: User) => {
		if (!confirm('Delete this user?')) return;
		try {
			setLoading(true);
			await usersService.deleteUser(user.id);
			await load();
		} catch (e: any) {
			setError(e?.message ?? 'Failed to delete');
		} finally {
			setLoading(false);
		}
	};

	if (loading && items.length === 0) {
		return <Loader message="Loading users..." />;
	}

	return (
		<div className="w-full space-y-6">
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
				<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Users</h1>
				<button onClick={openCreate} className="w-full sm:w-auto h-10 px-4 rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium">
					+ New User
				</button>
			</div>
			{error && <div className="text-red-600">{error}</div>}
			
			{items.length === 0 ? (
				<EmptyState
					title="No users found"
					description="Get started by creating your first user"
					actionLabel="New User"
					onAction={() => openCreate()}
				/>
			) : (
				<DataTable
					columns={columns}
					data={items}
					totalCount={total}
					page={page}
					rowsPerPage={rowsPerPage}
					onPageChange={setPage}
					onRowsPerPageChange={(n) => { setRowsPerPage(n); setPage(0); }}
					onEdit={(user) => openEdit(user)}
					onDelete={(user) => handleDelete(user)}
				/>
			)}

			{isModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
					<div className="w-full max-w-xl rounded-xl bg-white p-5 shadow-xl">
						<div className="flex items-center justify-between mb-3">
							<h2 className="text-lg font-semibold">{editingId == null ? 'New User' : 'Edit User'}</h2>
							<button onClick={() => setIsModalOpen(false)} className="text-gray-500">✕</button>
						</div>
						<form onSubmit={handleSave} className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm mb-1">Name</label>
									<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
								</div>
								<div>
									<label className="block text-sm mb-1">Phone</label>
									<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
								</div>
								<div>
									<label className="block text-sm mb-1">Email</label>
									<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
								</div>
								<div>
									<label className="block text-sm mb-1">Password {editingId != null && <span className="text-gray-500">(optional)</span>}</label>
									<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
								</div>
							</div>
							<div>
								<label className="block text-sm mb-1">Roles</label>
								<div className="grid grid-cols-2 gap-2 max-h-40 overflow-auto border border-gray-200 rounded-md p-2">
									{roles.map((r) => {
										const checked = form.role_ids.includes(r.id);
										return (
											<label key={r.id} className="inline-flex items-center gap-2 text-sm">
												<input
													type="checkbox"
													checked={checked}
													onChange={(e) => {
														setForm((prev) => {
															const role_ids = new Set(prev.role_ids);
															e.target.checked ? role_ids.add(r.id) : role_ids.delete(r.id);
															return { ...prev, role_ids: Array.from(role_ids) };
														});
													}}
												/>
												<span>{r.name}</span>
											</label>
										);
									})}
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
		</div>
	);
};
