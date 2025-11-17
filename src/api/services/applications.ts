import apiClient from '../axios';
import { type StudentRegistration, type PaginatedResponse, type QueryParams } from '../../types';
import { normalizePaginatedResponse, normalizeItemResponse } from '../../utils/pagination';
import { logger } from '../../utils/logger';
import { handleApiError } from '../../utils/errorHandler';

export const applicationsService = {
  getApplications: async (params?: QueryParams): Promise<PaginatedResponse<StudentRegistration>> => {
    // Remove empty strings/nulls from params to prevent over-filtering on backend
    const cleanedParams = params
      ? Object.fromEntries(
          Object.entries(params).filter(([_, value]) => value !== '' && value !== undefined && value !== null)
        )
      : undefined;

    try {
      logger.log('Fetching applications', { params: cleanedParams });
      const response = await apiClient.get('/applications', { params: cleanedParams });
      
      // Use pagination utility
      const paginatedResponse = normalizePaginatedResponse<StudentRegistration>(
        response.data,
        cleanedParams
      );
      
      logger.debug('Applications fetched', {
        count: paginatedResponse.data.length,
        total: paginatedResponse.total,
        pending: paginatedResponse.data.filter(a => a.status === 'pending').length
      });
      
      return paginatedResponse;
    } catch (error: any) {
      logger.error('Failed to fetch applications', error, { params });
      
      // Retry once on 404 (in case of endpoint changes)
      if (error?.response?.status === 404) {
        try {
          logger.log('Retrying applications fetch after 404');
          const retryResponse = await apiClient.get('/applications', { params: cleanedParams });
          
          const paginatedResponse = normalizePaginatedResponse<StudentRegistration>(
            retryResponse.data,
            cleanedParams
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
            } as PaginatedResponse<StudentRegistration>;
          }
          logger.error('Retry failed', retryError);
          throw handleApiError(retryError, { endpoint: '/applications', params });
        }
      }
      
      throw handleApiError(error, { endpoint: '/applications', params });
    }
  },

  getApplication: async (id: number): Promise<StudentRegistration> => {
    try {
      logger.log('Fetching application', { id });
      const response = await apiClient.get(`/applications/${id}`);
      const application = normalizeItemResponse<StudentRegistration>(response.data);
      logger.log('Application fetched successfully', { id });
      return application;
    } catch (error: any) {
      logger.error('Failed to fetch application', error, { id });
      throw handleApiError(error, { endpoint: `/applications/${id}` });
    }
  },

  updateApplicationStatus: async (id: number, status: string): Promise<StudentRegistration> => {
    try {
      logger.log('Updating application status', { id, status });
      const response = await apiClient.put(`/applications/${id}/status`, { status });
      const application = normalizeItemResponse<StudentRegistration>(response.data);
      logger.log('Application status updated successfully', { id, status });
      return application;
    } catch (error: any) {
      logger.error('Failed to update application status', error, { id, status });
      throw handleApiError(error, { endpoint: `/applications/${id}/status`, method: 'PUT' });
    }
  },
};
