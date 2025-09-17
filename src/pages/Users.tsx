import React from 'react';
import { usersService } from '../api/services/users';
import { rolesService } from '../api/services/roles';

export const Users: React.FC = () => {
	const [loading, setLoading] = React.useState(false);
	const [items, setItems] = React.useState<any[]>([]);
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

	const load = async () => {
		try {
			setLoading(true);
			const res = await usersService.getUsers({ page: 1, per_page: 10 });
			// Support both paginated response { data: [] } and bare array []
			setItems(Array.isArray(res as any) ? (res as any) : ((res as any)?.data ?? []));
		} catch (e: any) {
			setError(e?.message ?? 'Failed to load');
		} finally {
			setLoading(false);
		}
	};

	const loadRoles = async () => {
		try {
			const res = await rolesService.getRoles({ page: 1, per_page: 100 });
			// Support both paginated response { data: [] } and bare array []
			setRoles(Array.isArray(res as any) ? (res as any) : ((res as any)?.data ?? []));
		} catch {}
	};

	React.useEffect(() => {
		void load();
		void loadRoles();
	}, []);

	const openCreate = () => {
		setEditingId(null);
		setForm({ name: '', phone: '', email: '', password: '', role_ids: [] });
		setIsModalOpen(true);
	};

	const openEdit = (u: any) => {
		setEditingId(u.id);
		setForm({ name: u.name ?? '', phone: u.phone ?? '', email: u.email ?? '', password: '', role_ids: (u.roles?.map((r: any) => r.id) ?? []) });
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

	const handleDelete = async (id: number) => {
		if (!confirm('Delete this user?')) return;
		try {
			setLoading(true);
			await usersService.deleteUser(id);
			await load();
		} catch (e: any) {
			setError(e?.message ?? 'Failed to delete');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="p-4">
			<div className="flex items-center justify-between mb-4">
				<h1 className="text-xl font-semibold">Users</h1>
				<button onClick={openCreate} className="px-3 py-2 bg-primary-600 text-white rounded-md">New</button>
			</div>
			{loading && <div>Loading...</div>}
			{error && <div className="text-red-600">{error}</div>}
			<div className="overflow-auto rounded-lg border border-gray-200">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">ID</th>
							<th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Name</th>
							<th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Phone</th>
							<th className="px-4 py-2" />
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100 bg-white">
						{items.map((u) => (
							<tr key={u.id}>
								<td className="px-4 py-2">{u.id}</td>
								<td className="px-4 py-2">{u.name}</td>
								<td className="px-4 py-2">{u.phone ?? '-'}</td>
								<td className="px-4 py-2 text-right">
									<button onClick={() => openEdit(u)} className="text-primary-600 hover:underline mr-3">Edit</button>
									<button onClick={() => handleDelete(u.id)} className="text-red-600 hover:underline">Delete</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

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


