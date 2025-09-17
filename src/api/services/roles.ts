import apiClient from '../axios';
import { type PaginatedResponse, type QueryParams } from '../../types';

export interface Role {
	id: number;
	name: string;
	guard_name?: string;
}

export interface CreateRoleRequest {
	name: string;
	permission_ids?: number[];
}

export interface UpdateRoleRequest extends Partial<CreateRoleRequest> {}

export const rolesService = {
	getRoles: async (params?: QueryParams): Promise<PaginatedResponse<Role>> => {
		const response = await apiClient.get('/roles', { params });
		return (response.data?.data ?? response.data) as PaginatedResponse<Role>;
	},

	getRole: async (id: number): Promise<Role> => {
		const response = await apiClient.get(`/roles/${id}`);
		return (response.data?.data ?? response.data) as Role;
	},

	createRole: async (data: CreateRoleRequest): Promise<Role> => {
		const response = await apiClient.post('/roles', data);
		return (response.data?.data ?? response.data) as Role;
	},

	updateRole: async (id: number, data: UpdateRoleRequest): Promise<Role> => {
		const response = await apiClient.put(`/roles/${id}`, data);
		return (response.data?.data ?? response.data) as Role;
	},

	deleteRole: async (id: number): Promise<void> => {
		await apiClient.delete(`/roles/${id}`);
	},
};


