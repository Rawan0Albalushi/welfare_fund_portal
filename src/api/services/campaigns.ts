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
    const payload = (response.data?.data ?? response.data);
    if (Array.isArray(payload)) {
      const total = payload.length;
      return {
        data: payload as Campaign[],
        current_page: 1,
        last_page: 1,
        per_page: total,
        total,
        from: total > 0 ? 1 : 0,
        to: total,
      } as PaginatedResponse<Campaign>;
    }
    return payload as PaginatedResponse<Campaign>;
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


