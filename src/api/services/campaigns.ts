import apiClient from '../axios';
import { type PaginatedResponse, type QueryParams } from '../../types';

export interface Campaign {
	id: number;
	title_ar: string;
	title_en: string;
  description_ar?: string;
  description_en?: string;
  goal_amount?: number;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  category_id: number;
  image?: string;
  image_url?: string;
  start_date?: string; // ISO date
  end_date?: string;   // ISO date
  target_donors?: number;
  impact_description_ar?: string;
  impact_description_en?: string;
  campaign_highlights?: string[];
	created_at?: string;
	updated_at?: string;
}

export interface CreateCampaignRequest {
  category_id: number;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  goal_amount: number;
  image?: string;
  image_url?: string;
  status?: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  start_date?: string;
  end_date?: string;
  target_donors?: number;
  impact_description_ar?: string;
  impact_description_en?: string;
  campaign_highlights?: string[];
}

export interface UpdateCampaignRequest extends CreateCampaignRequest {}

export const campaignsService = {
	getCampaigns: async (params?: QueryParams): Promise<PaginatedResponse<Campaign>> => {
    const response = await apiClient.get('/campaigns', { params });
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
      } as PaginatedResponse<Campaign>;
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
      } as PaginatedResponse<Campaign>;
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
    } as PaginatedResponse<Campaign>;
	},

	getCampaign: async (id: number): Promise<Campaign> => {
		const response = await apiClient.get(`/campaigns/${id}`);
		return (response.data?.data ?? response.data) as Campaign;
	},

	createCampaign: async (data: CreateCampaignRequest): Promise<Campaign> => {
		const response = await apiClient.post('/campaigns', data);
		return (response.data?.data ?? response.data) as Campaign;
	},

	updateCampaign: async (id: number, data: UpdateCampaignRequest): Promise<Campaign> => {
		const response = await apiClient.put(`/campaigns/${id}`, data);
		return (response.data?.data ?? response.data) as Campaign;
	},


	deleteCampaign: async (id: number): Promise<void> => {
		await apiClient.delete(`/campaigns/${id}`);
	},
};


