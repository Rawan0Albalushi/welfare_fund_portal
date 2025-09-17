import apiClient from '../axios';
import { type PaginatedResponse, type QueryParams } from '../../types';

export interface Permission {
	id: number;
	name: string;
	guard_name?: string;
}

export interface CreatePermissionRequest {
	name: string;
}

export interface UpdatePermissionRequest extends Partial<CreatePermissionRequest> {}

export const permissionsService = {
	getPermissions: async (params?: QueryParams): Promise<PaginatedResponse<Permission>> => {
		const response = await apiClient.get('/permissions', { params });
		return (response.data?.data ?? response.data) as PaginatedResponse<Permission>;
	},

	getPermission: async (id: number): Promise<Permission> => {
		const response = await apiClient.get(`/permissions/${id}`);
		return (response.data?.data ?? response.data) as Permission;
	},

	createPermission: async (data: CreatePermissionRequest): Promise<Permission> => {
		const response = await apiClient.post('/permissions', data);
		return (response.data?.data ?? response.data) as Permission;
	},

	updatePermission: async (id: number, data: UpdatePermissionRequest): Promise<Permission> => {
		const response = await apiClient.put(`/permissions/${id}`, data);
		return (response.data?.data ?? response.data) as Permission;
	},

	deletePermission: async (id: number): Promise<void> => {
		await apiClient.delete(`/admin/permissions/${id}`);
	},
};


