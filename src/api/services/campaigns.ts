import apiClient from '../axios';
import { type Campaign, type PaginatedResponse, type QueryParams } from '../../types';
import { normalizePaginatedResponse, normalizeItemResponse } from '../../utils/pagination';
import { logger } from '../../utils/logger';
import { handleApiError } from '../../utils/errorHandler';

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
    try {
      logger.log('Fetching campaigns', { params });
      const response = await apiClient.get('/campaigns', { params });
      return normalizePaginatedResponse<Campaign>(response.data, params);
    } catch (error: any) {
      logger.error('Failed to fetch campaigns', error, { params });
      throw handleApiError(error, { endpoint: '/campaigns', params });
    }
  },

  getCampaign: async (id: number): Promise<Campaign> => {
    try {
      logger.log('Fetching campaign', { id });
      const response = await apiClient.get(`/campaigns/${id}`);
      const campaign = normalizeItemResponse<Campaign>(response.data);
      logger.log('Campaign fetched successfully', { id });
      return campaign;
    } catch (error: any) {
      logger.error('Failed to fetch campaign', error, { id });
      throw handleApiError(error, { endpoint: `/campaigns/${id}` });
    }
  },

  createCampaign: async (data: CreateCampaignRequest): Promise<Campaign> => {
    try {
      logger.log('Creating campaign', { title_ar: data.title_ar, title_en: data.title_en });
      const response = await apiClient.post('/campaigns', data);
      const campaign = normalizeItemResponse<Campaign>(response.data);
      logger.log('Campaign created successfully', { id: campaign.id });
      return campaign;
    } catch (error: any) {
      logger.error('Failed to create campaign', error, { data });
      throw handleApiError(error, { endpoint: '/campaigns', method: 'POST' });
    }
  },

  updateCampaign: async (id: number, data: UpdateCampaignRequest): Promise<Campaign> => {
    try {
      logger.log('Updating campaign', { id });
      const response = await apiClient.put(`/campaigns/${id}`, data);
      const campaign = normalizeItemResponse<Campaign>(response.data);
      logger.log('Campaign updated successfully', { id: campaign.id });
      return campaign;
    } catch (error: any) {
      logger.error('Failed to update campaign', error, { id, data });
      throw handleApiError(error, { endpoint: `/campaigns/${id}`, method: 'PUT' });
    }
  },

  deleteCampaign: async (id: number): Promise<void> => {
    try {
      logger.log('Deleting campaign', { id });
      await apiClient.delete(`/campaigns/${id}`);
      logger.log('Campaign deleted successfully', { id });
    } catch (error: any) {
      logger.error('Failed to delete campaign', error, { id });
      throw handleApiError(error, { endpoint: `/campaigns/${id}`, method: 'DELETE' });
    }
  },
};
