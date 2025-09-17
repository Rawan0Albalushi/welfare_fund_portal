import apiClient from '../axios';
import { type PaginatedResponse, type QueryParams } from '../../types';

export interface AuditLog {
	id: number;
	user_id?: number;
	action: string;
	model_type?: string;
	model_id?: number;
	changes?: unknown;
	created_at?: string;
}

export const auditLogsService = {
	getAuditLogs: async (params?: QueryParams): Promise<PaginatedResponse<AuditLog>> => {
		const response = await apiClient.get('/audit-logs', { params });
		return (response.data?.data ?? response.data) as PaginatedResponse<AuditLog>;
	},
};


