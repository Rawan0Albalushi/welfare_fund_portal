import apiClient from '../client';
import { type Donation, type PaginatedResponse, type QueryParams } from '../../types';

export const donationsService = {
  getDonations: async (params?: QueryParams): Promise<PaginatedResponse<Donation>> => {
    const response = await apiClient.get('/v1/admin/donations', { params });
    return response.data;
  },

  getDonation: async (id: number): Promise<Donation> => {
    const response = await apiClient.get(`/v1/admin/donations/${id}`);
    return response.data;
  },
};
