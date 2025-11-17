import apiClient from '../axios';
import { type Donation, type PaginatedResponse, type QueryParams } from '../../types';
import { normalizePaginatedResponse, normalizeItemResponse } from '../../utils/pagination';
import { logger } from '../../utils/logger';
import { handleApiError } from '../../utils/errorHandler';

// Normalize donation data - ensure amounts are numbers
const normalizeDonation = (donation: any): Donation => {
  const normalized = { ...donation };
  
  // Ensure amount is a number
  if (normalized.amount !== undefined && normalized.amount !== null) {
    normalized.amount = typeof normalized.amount === 'string' 
      ? parseFloat(normalized.amount) || 0 
      : Number(normalized.amount) || 0;
  }
  
  // Ensure paid_amount is a number if present
  if (normalized.paid_amount !== undefined && normalized.paid_amount !== null) {
    normalized.paid_amount = typeof normalized.paid_amount === 'string' 
      ? parseFloat(normalized.paid_amount) || 0 
      : Number(normalized.paid_amount) || 0;
  }
  
  return normalized as Donation;
};

export const donationsService = {
  getDonations: async (params?: QueryParams): Promise<PaginatedResponse<Donation>> => {
    try {
      // Remove empty strings/nulls from params to prevent over-filtering on backend
      const cleanedParams = params
        ? Object.fromEntries(
            Object.entries(params).filter(([_, value]) => value !== '' && value !== undefined && value !== null)
          )
        : undefined;

      logger.log('Fetching donations', { params: cleanedParams });
      const response = await apiClient.get('/donations', { params: cleanedParams });
      
      // Use pagination utility with donation normalizer
      const paginatedResponse = normalizePaginatedResponse<Donation>(
        response.data,
        cleanedParams,
        normalizeDonation
      );
      
      logger.debug('Donations fetched', {
        count: paginatedResponse.data.length,
        total: paginatedResponse.total
      });
      
      return paginatedResponse;
    } catch (error: any) {
      logger.error('Failed to fetch donations', error, { params });
      
      // Retry once on 404 (in case of endpoint changes)
      if (error?.response?.status === 404) {
        try {
          logger.log('Retrying donations fetch after 404');
          const cleanedParams = params
            ? Object.fromEntries(
                Object.entries(params).filter(([_, value]) => value !== '' && value !== undefined && value !== null)
              )
            : undefined;
          const retryResponse = await apiClient.get('/donations', { params: cleanedParams });
          
          const paginatedResponse = normalizePaginatedResponse<Donation>(
            retryResponse.data,
            cleanedParams,
            normalizeDonation
          );
          
          return paginatedResponse;
        } catch (retryError: any) {
          // If retry also fails with 404, return empty list (idempotent)
          if (retryError?.response?.status === 404) {
            logger.warn('404 received on both paths - returning empty list');
            return {
              data: [],
              current_page: 1,
              last_page: 1,
              per_page: params?.per_page || 10,
              total: 0,
              from: 0,
              to: 0,
            } as PaginatedResponse<Donation>;
          }
          logger.error('Retry failed', retryError);
          throw handleApiError(retryError, { endpoint: '/donations', params });
        }
      }
      
      throw handleApiError(error, { endpoint: '/donations', params });
    }
  },

  getDonation: async (id: number): Promise<Donation> => {
    try {
      logger.log('Fetching donation', { id });
      const response = await apiClient.get(`/donations/${id}`);
      const donation = normalizeItemResponse<Donation>(response.data, normalizeDonation);
      logger.log('Donation fetched successfully', { id });
      return donation;
    } catch (error: any) {
      logger.error('Failed to fetch donation', error, { id });
      throw handleApiError(error, { endpoint: `/donations/${id}` });
    }
  },
};
