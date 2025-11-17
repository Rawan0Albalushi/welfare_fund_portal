import apiClient from '../axios';
import { type Program, type CreateProgramRequest, type UpdateProgramRequest, type PaginatedResponse, type QueryParams } from '../../types';
import { normalizePaginatedResponse, normalizeItemResponse } from '../../utils/pagination';
import { logger } from '../../utils/logger';
import { handleApiError } from '../../utils/errorHandler';

// Normalize API <-> UI fields
const mapApiProgramToUi = (p: any): Program => ({
  id: p.id,
  created_at: p.created_at,
  updated_at: p.updated_at,
  deleted_at: p.deleted_at,
  category_id: p.category_id ?? null,
  title_ar: p.title_ar ?? '',
  title_en: p.title_en ?? '',
  description_ar: p.description_ar,
  description_en: p.description_en,
  status: p.status,
});

const mapUiToApiPayload = (data: Partial<CreateProgramRequest | UpdateProgramRequest>) => {
  const payload: Record<string, any> = {};
  if (data.title_ar !== undefined) {
    payload.title_ar = data.title_ar;
  }
  if (data.title_en !== undefined) {
    payload.title_en = data.title_en;
  }
  if (data.description_ar !== undefined) {
    payload.description_ar = data.description_ar;
  }
  if (data.description_en !== undefined) {
    payload.description_en = data.description_en;
  }
  if (data.status !== undefined) {
    payload.status = data.status;
  }
  if (data.category_id !== undefined) {
    payload.category_id = data.category_id;
  }
  return payload;
};

export const programsService = {
  getPrograms: async (params?: QueryParams): Promise<PaginatedResponse<Program>> => {
    try {
      logger.log('Fetching programs', { params });
      const response = await apiClient.get('/programs', { params });
      return normalizePaginatedResponse<Program>(response.data, params, mapApiProgramToUi);
    } catch (error: any) {
      logger.error('Failed to fetch programs', error, { params });
      
      // Retry once on 404 (in case of endpoint changes)
      if (error?.response?.status === 404) {
        try {
          logger.log('Retrying programs fetch after 404');
          const retryResponse = await apiClient.get('/programs', { params });
          return normalizePaginatedResponse<Program>(retryResponse.data, params, mapApiProgramToUi);
        } catch (retryError) {
          logger.error('Retry failed', retryError);
          throw handleApiError(retryError, { endpoint: '/programs', params });
        }
      }
      
      throw handleApiError(error, { endpoint: '/programs', params });
    }
  },

  getProgram: async (id: number): Promise<Program> => {
    try {
      logger.log('Fetching program', { id });
      const response = await apiClient.get(`/programs/${id}`);
      return normalizeItemResponse<Program>(response.data, mapApiProgramToUi);
    } catch (error: any) {
      logger.error('Failed to fetch program', error, { id });
      
      // Retry once on 404
      if (error?.response?.status === 404) {
        try {
          logger.log('Retrying program fetch after 404', { id });
          const retryResponse = await apiClient.get(`/programs/${id}`);
          return normalizeItemResponse<Program>(retryResponse.data, mapApiProgramToUi);
        } catch (retryError) {
          logger.error('Retry failed', retryError, { id });
          throw handleApiError(retryError, { endpoint: `/programs/${id}` });
        }
      }
      
      throw handleApiError(error, { endpoint: `/programs/${id}` });
    }
  },

  createProgram: async (data: CreateProgramRequest): Promise<Program> => {
    try {
      logger.log('Creating program', { title_ar: data.title_ar, title_en: data.title_en });
      const payload = mapUiToApiPayload(data);
      const response = await apiClient.post('/programs', payload);
      const program = normalizeItemResponse<Program>(response.data, mapApiProgramToUi);
      logger.log('Program created successfully', { id: program.id });
      return program;
    } catch (error: any) {
      logger.error('Failed to create program', error, { data });
      
      // Retry once on 404
      if (error?.response?.status === 404) {
        try {
          logger.log('Retrying program creation after 404');
          const payload = mapUiToApiPayload(data);
          const retryResponse = await apiClient.post('/programs', payload);
          return normalizeItemResponse<Program>(retryResponse.data, mapApiProgramToUi);
        } catch (retryError) {
          logger.error('Retry failed', retryError);
          throw handleApiError(retryError, { endpoint: '/programs', method: 'POST' });
        }
      }
      
      throw handleApiError(error, { endpoint: '/programs', method: 'POST' });
    }
  },

  updateProgram: async (id: number, data: UpdateProgramRequest): Promise<Program> => {
    try {
      logger.log('Updating program', { id });
      const payload = mapUiToApiPayload(data);
      const response = await apiClient.put(`/programs/${id}`, payload);
      const program = normalizeItemResponse<Program>(response.data, mapApiProgramToUi);
      logger.log('Program updated successfully', { id: program.id });
      return program;
    } catch (error: any) {
      logger.error('Failed to update program', error, { id, data });
      
      // Retry once on 404
      if (error?.response?.status === 404) {
        try {
          logger.log('Retrying program update after 404', { id });
          const payload = mapUiToApiPayload(data);
          const retryResponse = await apiClient.put(`/programs/${id}`, payload);
          return normalizeItemResponse<Program>(retryResponse.data, mapApiProgramToUi);
        } catch (retryError) {
          logger.error('Retry failed', retryError, { id });
          throw handleApiError(retryError, { endpoint: `/programs/${id}`, method: 'PUT' });
        }
      }
      
      throw handleApiError(error, { endpoint: `/programs/${id}`, method: 'PUT' });
    }
  },

  deleteProgram: async (id: number): Promise<void> => {
    try {
      logger.log('Deleting program', { id });
      await apiClient.delete(`/programs/${id}`);
      logger.log('Program deleted successfully', { id });
    } catch (error: any) {
      logger.error('Failed to delete program', error, { id });
      
      // Retry once on 404 (some backends may return 404 for already deleted items)
      if (error?.response?.status === 404) {
        try {
          logger.log('Retrying program deletion after 404', { id });
          await apiClient.delete(`/programs/${id}`);
          return;
        } catch (retryError: any) {
          // If retry also fails with 404, consider it successful (idempotent delete)
          if (retryError?.response?.status === 404) {
            logger.log('Program already deleted (404 on retry)', { id });
            return;
          }
          logger.error('Retry failed', retryError, { id });
          throw handleApiError(retryError, { endpoint: `/programs/${id}`, method: 'DELETE' });
        }
      }
      
      throw handleApiError(error, { endpoint: `/programs/${id}`, method: 'DELETE' });
    }
  },
};
