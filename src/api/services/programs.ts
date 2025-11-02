import apiClient from '../axios';
import { type Program, type CreateProgramRequest, type UpdateProgramRequest, type PaginatedResponse, type QueryParams } from '../../types';

// Normalize API <-> UI fields
const mapApiProgramToUi = (p: any): Program => ({
  id: p.id,
  created_at: p.created_at,
  updated_at: p.updated_at,
  deleted_at: p.deleted_at,
  category_id: p.category_id,
  title_ar: p.title_ar ?? '',
  title_en: p.title_en ?? '',
  description_ar: p.description_ar,
  description_en: p.description_en,
  status: p.status,
});

const mapUiToApiPayload = (data: Partial<CreateProgramRequest | UpdateProgramRequest>) => {
  const payload: Record<string, any> = {};
  if (data.category_id !== undefined) {
    payload.category_id = data.category_id;
  }
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
  return payload;
};

export const programsService = {
  getPrograms: async (params?: QueryParams): Promise<PaginatedResponse<Program>> => {
    try {
      const response = await apiClient.get('/programs', { params });
      const rawAny = (response.data?.data ?? response.data) as any;
      if (Array.isArray(rawAny)) {
        const mapped = rawAny.map(mapApiProgramToUi);
        return {
          data: mapped,
          current_page: 1,
          last_page: 1,
          per_page: mapped.length,
          total: mapped.length,
          from: mapped.length > 0 ? 1 : 0,
          to: mapped.length,
        } as PaginatedResponse<Program>;
      }
      const raw = rawAny as PaginatedResponse<any>;
      return {
        ...raw,
        data: Array.isArray(raw.data) ? raw.data.map(mapApiProgramToUi) : [],
      } as PaginatedResponse<Program>;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        const response = await apiClient.get('/programs', { params });
        const rawAny = (response.data?.data ?? response.data) as any;
        if (Array.isArray(rawAny)) {
          const mapped = rawAny.map(mapApiProgramToUi);
          return {
            data: mapped,
            current_page: 1,
            last_page: 1,
            per_page: mapped.length,
            total: mapped.length,
            from: mapped.length > 0 ? 1 : 0,
            to: mapped.length,
          } as PaginatedResponse<Program>;
        }
        const raw = rawAny as PaginatedResponse<any>;
        return {
          ...raw,
          data: Array.isArray(raw.data) ? raw.data.map(mapApiProgramToUi) : [],
        } as PaginatedResponse<Program>;
      }
      throw error;
    }
  },

  getProgram: async (id: number): Promise<Program> => {
    try {
      const response = await apiClient.get(`/programs/${id}`);
      const raw = (response.data?.data ?? response.data) as any;
      return mapApiProgramToUi(raw);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        const response = await apiClient.get(`/programs/${id}`);
        const raw = (response.data?.data ?? response.data) as any;
        return mapApiProgramToUi(raw);
      }
      throw error;
    }
  },

  createProgram: async (data: CreateProgramRequest): Promise<Program> => {
    try {
      const payload = mapUiToApiPayload(data);
      const response = await apiClient.post('/programs', payload);
      const raw = (response.data?.data ?? response.data) as any;
      return mapApiProgramToUi(raw);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        const payload = mapUiToApiPayload(data);
        const response = await apiClient.post('/programs', payload);
        const raw = (response.data?.data ?? response.data) as any;
        return mapApiProgramToUi(raw);
      }
      throw error;
    }
  },

  updateProgram: async (id: number, data: UpdateProgramRequest): Promise<Program> => {
    try {
      const payload = mapUiToApiPayload(data);
      const response = await apiClient.put(`/programs/${id}`, payload);
      const raw = (response.data?.data ?? response.data) as any;
      return mapApiProgramToUi(raw);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        const payload = mapUiToApiPayload(data);
        const response = await apiClient.put(`/programs/${id}`, payload);
        const raw = (response.data?.data ?? response.data) as any;
        return mapApiProgramToUi(raw);
      }
      throw error;
    }
  },

  deleteProgram: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/programs/${id}`);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        await apiClient.delete(`/programs/${id}`);
        return;
      }
      throw error;
    }
  },
};
