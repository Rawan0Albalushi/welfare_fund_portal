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
        const root = response.data as any;
        const hasPaginationAtRoot = (
            typeof root?.total !== 'undefined' || typeof root?.last_page !== 'undefined' || typeof root?.per_page !== 'undefined' || typeof root?.meta?.total !== 'undefined' || typeof root?.pagination?.total !== 'undefined'
        );
        // Case 1: backend returns object with pagination + data array
        if (hasPaginationAtRoot && Array.isArray(root?.data)) {
            const explicitTotal = ((): number | undefined => {
                if (typeof root?.total === 'number') return root.total;
                if (typeof root?.total === 'string' && root.total.trim() !== '' && !Number.isNaN(Number(root.total))) return Number(root.total);
                const metaTotal = root?.meta?.total ?? root?.pagination?.total;
                if (typeof metaTotal === 'number') return metaTotal;
                if (typeof metaTotal === 'string' && metaTotal.trim() !== '' && !Number.isNaN(Number(metaTotal))) return Number(metaTotal);
                return undefined;
            })();
            const perPage = Number(root?.per_page ?? params?.per_page ?? (root.data.length || 10));
            const lastPage = Number(root?.last_page ?? (explicitTotal ? Math.max(1, Math.ceil(explicitTotal / perPage)) : 1));
            const total = explicitTotal ?? (lastPage * perPage);
            return {
                data: root.data,
                current_page: Number(root?.current_page ?? params?.page ?? 1),
                last_page: lastPage,
                per_page: perPage,
                total,
                from: Number(root?.from ?? 0),
                to: Number(root?.to ?? 0),
            } as PaginatedResponse<User>;
        }
        // Case 2: backend returns plain array (no pagination info)
        const rawAny = (root?.data ?? root) as any;
        if (Array.isArray(rawAny)) {
            const total = rawAny.length;
            const currentPage = Math.max(1, Number(params?.page) || 1);
            const perPage = Math.max(1, Number(params?.per_page) || total || 1);
            const startIndex = (currentPage - 1) * perPage;
            const endIndex = startIndex + perPage;
            const sliced = rawAny.slice(startIndex, endIndex);
            const lastPage = Math.max(1, Math.ceil(total / perPage));
            return {
                data: sliced,
                current_page: currentPage,
                last_page: lastPage,
                per_page: perPage,
                total,
                from: total > 0 ? Math.min(total, startIndex + 1) : 0,
                to: total > 0 ? Math.min(total, endIndex) : 0,
            } as PaginatedResponse<User>;
        }
        const raw = root as any;
        // Determine total robustly: prefer numeric total; accept numeric string; fallback to meta.total; then last_page*per_page; else length
        const explicitTotal = ((): number | undefined => {
            if (typeof raw?.total === 'number') return raw.total as number;
            if (typeof raw?.total === 'string' && raw.total.trim() !== '' && !Number.isNaN(Number(raw.total))) return Number(raw.total);
            const metaTotal = raw?.meta?.total ?? raw?.pagination?.total;
            if (typeof metaTotal === 'number') return metaTotal as number;
            if (typeof metaTotal === 'string' && metaTotal.trim() !== '' && !Number.isNaN(Number(metaTotal))) return Number(metaTotal);
            return undefined;
        })();
        const totalFallback = explicitTotal !== undefined
            ? explicitTotal
            : (raw?.last_page && raw?.per_page ? Number(raw.last_page) * Number(raw.per_page) : (Array.isArray(raw?.data) ? raw.data.length : 0));
        return {
            ...raw,
            data: raw?.data || [],
            total: totalFallback,
        } as PaginatedResponse<User>;
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


