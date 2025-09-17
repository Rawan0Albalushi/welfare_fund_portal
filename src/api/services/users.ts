import apiClient from '../axios';
import { type PaginatedResponse, type QueryParams } from '../../types';

export interface User {
	id: number;
	name: string;
	email?: string;
	phone?: string;
	status?: string;
	created_at?: string;
	updated_at?: string;
}

export interface CreateUserRequest {
	name: string;
	phone?: string;
	email?: string;
	password?: string;
	role_ids?: number[];
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {}

export const usersService = {
    getUsers: async (params?: QueryParams): Promise<PaginatedResponse<User>> => {
        const response = await apiClient.get('/users', { params });
        return (response.data?.data ?? response.data) as PaginatedResponse<User>;
    },

    getUser: async (id: number): Promise<User> => {
        const response = await apiClient.get(`/users/${id}`);
        return (response.data?.data ?? response.data) as User;
    },

    createUser: async (data: CreateUserRequest): Promise<User> => {
        const response = await apiClient.post('/users', data);
        return (response.data?.data ?? response.data) as User;
    },

    updateUser: async (id: number, data: UpdateUserRequest): Promise<User> => {
        const response = await apiClient.put(`/users/${id}`, data);
        return (response.data?.data ?? response.data) as User;
    },

    updateUserRole: async (id: number, roleId: number): Promise<User> => {
        const response = await apiClient.put(`/users/${id}/role`, { role_id: roleId });
        return (response.data?.data ?? response.data) as User;
    },

    deleteUser: async (id: number): Promise<void> => {
        await apiClient.delete(`/users/${id}`);
    },
};


