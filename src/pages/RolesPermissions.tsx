import React from 'react';
import { rolesService } from '../api/services/roles';
import { permissionsService } from '../api/services/permissions';

export const RolesPermissions: React.FC = () => {
	const [roles, setRoles] = React.useState<any[]>([]);
	const [permissions, setPermissions] = React.useState<any[]>([]);
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const [roleModalOpen, setRoleModalOpen] = React.useState(false);
	const [editingRoleId, setEditingRoleId] = React.useState<number | null>(null);
	const [roleForm, setRoleForm] = React.useState({ name: '', permission_ids: [] as number[] });

	const [permModalOpen, setPermModalOpen] = React.useState(false);
	const [editingPermId, setEditingPermId] = React.useState<number | null>(null);
	const [permForm, setPermForm] = React.useState({ name: '' });

	const load = async () => {
		try {
			setLoading(true);
			const [r, p] = await Promise.all([
				rolesService.getRoles({ page: 1, per_page: 50 }),
				permissionsService.getPermissions({ page: 1, per_page: 100 }),
			]);
			setRoles(r.data ?? []);
			setPermissions(p.data ?? []);
		} catch (e: any) {
			setError(e?.message ?? 'Failed to load');
		} finally {
			setLoading(false);
		}
	};

	React.useEffect(() => {
		void load();
	}, []);

	const openCreateRole = () => {
		setEditingRoleId(null);
		setRoleForm({ name: '', permission_ids: [] });
		setRoleModalOpen(true);
	};

	const openEditRole = (r: any) => {
		setEditingRoleId(r.id);
		setRoleForm({ name: r.name ?? '', permission_ids: (r.permissions?.map((p: any) => p.id) ?? []) });
		setRoleModalOpen(true);
	};

	const saveRole = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			setLoading(true);
			if (editingRoleId == null) {
				await rolesService.createRole(roleForm as any);
			} else {
				await rolesService.updateRole(editingRoleId, roleForm as any);
			}
			setRoleModalOpen(false);
			await load();
		} catch (e: any) { setError(e?.message ?? 'Failed to save role'); }
		finally { setLoading(false); }
	};

	const deleteRole = async (id: number) => {
		if (!confirm('Delete this role?')) return;
		try {
			setLoading(true);
			await rolesService.deleteRole(id);
			await load();
		} catch (e: any) { setError(e?.message ?? 'Failed to delete role'); }
		finally { setLoading(false); }
	};

	const openCreatePerm = () => {
		setEditingPermId(null);
		setPermForm({ name: '' });
		setPermModalOpen(true);
	};

	const openEditPerm = (p: any) => {
		setEditingPermId(p.id);
		setPermForm({ name: p.name ?? '' });
		setPermModalOpen(true);
	};

	const savePerm = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			setLoading(true);
			if (editingPermId == null) {
				await permissionsService.createPermission(permForm as any);
			} else {
				await permissionsService.updatePermission(editingPermId, permForm as any);
			}
			setPermModalOpen(false);
			await load();
		} catch (e: any) { setError(e?.message ?? 'Failed to save permission'); }
		finally { setLoading(false); }
	};

	const deletePerm = async (id: number) => {
		if (!confirm('Delete this permission?')) return;
		try {
			setLoading(true);
			await permissionsService.deletePermission(id);
			await load();
		} catch (e: any) { setError(e?.message ?? 'Failed to delete permission'); }
		finally { setLoading(false); }
	};

	return (
		<div className="p-4 space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-semibold">Roles & Permissions</h1>
			</div>
			{loading && <div>Loading...</div>}
			{error && <div className="text-red-600">{error}</div>}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="rounded-lg border border-gray-200 overflow-hidden">
					<div className="px-4 py-2 bg-gray-50 font-medium flex items-center justify-between">
						<span>Roles</span>
						<button onClick={openCreateRole} className="text-sm px-2 py-1 rounded-md bg-primary-600 text-white">New</button>
					</div>
					<ul className="divide-y divide-gray-100 bg-white">
						{roles.map((r) => (
							<li key={r.id} className="px-4 py-2 flex items-center justify-between">
								<span>{r.name}</span>
								<div className="space-x-3">
									<button onClick={() => openEditRole(r)} className="text-primary-600 hover:underline">Edit</button>
									<button onClick={() => deleteRole(r.id)} className="text-red-600 hover:underline">Delete</button>
								</div>
							</li>
						))}
					</ul>
				</div>
				<div className="rounded-lg border border-gray-200 overflow-hidden">
					<div className="px-4 py-2 bg-gray-50 font-medium flex items-center justify-between">
						<span>Permissions</span>
						<button onClick={openCreatePerm} className="text-sm px-2 py-1 rounded-md bg-primary-600 text-white">New</button>
					</div>
					<ul className="divide-y divide-gray-100 bg-white max-h-96 overflow-auto">
						{permissions.map((p) => (
							<li key={p.id} className="px-4 py-2 flex items-center justify-between">
								<span>{p.name}</span>
								<div className="space-x-3">
									<button onClick={() => openEditPerm(p)} className="text-primary-600 hover:underline">Edit</button>
									<button onClick={() => deletePerm(p.id)} className="text-red-600 hover:underline">Delete</button>
								</div>
							</li>
						))}
					</ul>
				</div>
			</div>

			{roleModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
					<div className="w-full max-w-xl rounded-xl bg-white p-5 shadow-xl">
						<div className="flex items-center justify-between mb-3">
							<h2 className="text-lg font-semibold">{editingRoleId == null ? 'New Role' : 'Edit Role'}</h2>
							<button onClick={() => setRoleModalOpen(false)} className="text-gray-500">✕</button>
						</div>
						<form onSubmit={saveRole} className="space-y-4">
							<div>
								<label className="block text-sm mb-1">Name</label>
								<input value={roleForm.name} onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })} required className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
							</div>
							<div>
								<label className="block text-sm mb-1">Permissions</label>
								<div className="grid grid-cols-2 gap-2 max-h-40 overflow-auto border border-gray-200 rounded-md p-2">
									{permissions.map((p) => {
										const checked = roleForm.permission_ids.includes(p.id);
										return (
											<label key={p.id} className="inline-flex items-center gap-2 text-sm">
												<input
													type="checkbox"
													checked={checked}
													onChange={(e) => {
														setRoleForm((prev) => {
															const ids = new Set(prev.permission_ids);
															e.target.checked ? ids.add(p.id) : ids.delete(p.id);
															return { ...prev, permission_ids: Array.from(ids) };
														});
													}}
												/>
												<span>{p.name}</span>
											</label>
										);
									})}
								</div>
							</div>
							<div className="flex items-center justify-end gap-2 pt-2">
								<button type="button" onClick={() => setRoleModalOpen(false)} className="px-3 py-2 rounded-md border border-gray-300">Cancel</button>
								<button type="submit" className="px-3 py-2 rounded-md bg-primary-600 text-white">{editingRoleId == null ? 'Create' : 'Save'}</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{permModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
					<div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
						<div className="flex items-center justify-between mb-3">
							<h2 className="text-lg font-semibold">{editingPermId == null ? 'New Permission' : 'Edit Permission'}</h2>
							<button onClick={() => setPermModalOpen(false)} className="text-gray-500">✕</button>
						</div>
						<form onSubmit={savePerm} className="space-y-4">
							<div>
								<label className="block text-sm mb-1">Name</label>
								<input value={permForm.name} onChange={(e) => setPermForm({ ...permForm, name: e.target.value })} required className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
							</div>
							<div className="flex items-center justify-end gap-2 pt-2">
								<button type="button" onClick={() => setPermModalOpen(false)} className="px-3 py-2 rounded-md border border-gray-300">Cancel</button>
								<button type="submit" className="px-3 py-2 rounded-md bg-primary-600 text-white">{editingPermId == null ? 'Create' : 'Save'}</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};


