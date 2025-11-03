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
      const root = response.data as any;
      const hasPaginationAtRoot = (
        typeof root?.total !== 'undefined' || typeof root?.last_page !== 'undefined' || typeof root?.per_page !== 'undefined' || typeof root?.meta?.total !== 'undefined' || typeof root?.pagination?.total !== 'undefined'
      );
      // Case 1: backend returns object with pagination + data array
      if (hasPaginationAtRoot && Array.isArray(root?.data)) {
        const mappedData = root.data.map(mapApiProgramToUi);
        const explicitTotal = ((): number | undefined => {
          if (typeof root?.total === 'number') return root.total;
          if (typeof root?.total === 'string' && root.total.trim() !== '' && !Number.isNaN(Number(root.total))) return Number(root.total);
          const metaTotal = root?.meta?.total ?? root?.pagination?.total;
          if (typeof metaTotal === 'number') return metaTotal;
          if (typeof metaTotal === 'string' && metaTotal.trim() !== '' && !Number.isNaN(Number(metaTotal))) return Number(metaTotal);
          return undefined;
        })();
        const perPage = Number(root?.per_page ?? params?.per_page ?? (mappedData.length || 10));
        const lastPage = Number(root?.last_page ?? (explicitTotal ? Math.max(1, Math.ceil(explicitTotal / perPage)) : 1));
        const total = explicitTotal ?? (lastPage * perPage);
        return {
          data: mappedData,
          current_page: Number(root?.current_page ?? params?.page ?? 1),
          last_page: lastPage,
          per_page: perPage,
          total,
          from: Number(root?.from ?? 0),
          to: Number(root?.to ?? 0),
        } as PaginatedResponse<Program>;
      }
      // Case 2: backend returns plain array (no pagination info)
      const rawAny = (root?.data ?? root) as any;
      if (Array.isArray(rawAny)) {
        const mapped = rawAny.map(mapApiProgramToUi);
        const total = mapped.length;
        const currentPage = Math.max(1, Number(params?.page) || 1);
        const perPage = Math.max(1, Number(params?.per_page) || total || 1);
        const startIndex = (currentPage - 1) * perPage;
        const endIndex = startIndex + perPage;
        const sliced = mapped.slice(startIndex, endIndex);
        const lastPage = Math.max(1, Math.ceil(total / perPage));
        return {
          data: sliced,
          current_page: currentPage,
          last_page: lastPage,
          per_page: perPage,
          total,
          from: total > 0 ? Math.min(total, startIndex + 1) : 0,
          to: total > 0 ? Math.min(total, endIndex) : 0,
        } as PaginatedResponse<Program>;
      }
      const raw = root as any;
      const mappedData = Array.isArray(raw?.data) ? raw.data.map(mapApiProgramToUi) : [];
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
        : (raw?.last_page && raw?.per_page ? Number(raw.last_page) * Number(raw.per_page) : mappedData.length);
      return {
        ...raw,
        data: mappedData,
        total: totalFallback,
      } as PaginatedResponse<Program>;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        const response = await apiClient.get('/programs', { params });
        const root = response.data as any;
        const hasPaginationAtRoot = (
          typeof root?.total !== 'undefined' || typeof root?.last_page !== 'undefined' || typeof root?.per_page !== 'undefined' || typeof root?.meta?.total !== 'undefined' || typeof root?.pagination?.total !== 'undefined'
        );
        if (hasPaginationAtRoot && Array.isArray(root?.data)) {
          const mappedData = root.data.map(mapApiProgramToUi);
          const explicitTotal = ((): number | undefined => {
            if (typeof root?.total === 'number') return root.total;
            if (typeof root?.total === 'string' && root.total.trim() !== '' && !Number.isNaN(Number(root.total))) return Number(root.total);
            const metaTotal = root?.meta?.total ?? root?.pagination?.total;
            if (typeof metaTotal === 'number') return metaTotal;
            if (typeof metaTotal === 'string' && metaTotal.trim() !== '' && !Number.isNaN(Number(metaTotal))) return Number(metaTotal);
            return undefined;
          })();
          const perPage = Number(root?.per_page ?? params?.per_page ?? (mappedData.length || 10));
          const lastPage = Number(root?.last_page ?? (explicitTotal ? Math.max(1, Math.ceil(explicitTotal / perPage)) : 1));
          const total = explicitTotal ?? (lastPage * perPage);
          return {
            data: mappedData,
            current_page: Number(root?.current_page ?? params?.page ?? 1),
            last_page: lastPage,
            per_page: perPage,
            total,
            from: Number(root?.from ?? 0),
            to: Number(root?.to ?? 0),
          } as PaginatedResponse<Program>;
        }
        const rawAny = (root?.data ?? root) as any;
        if (Array.isArray(rawAny)) {
          const mapped = rawAny.map(mapApiProgramToUi);
          const total = mapped.length;
          const currentPage = Math.max(1, Number(params?.page) || 1);
          const perPage = Math.max(1, Number(params?.per_page) || total || 1);
          const startIndex = (currentPage - 1) * perPage;
          const endIndex = startIndex + perPage;
          const sliced = mapped.slice(startIndex, endIndex);
          const lastPage = Math.max(1, Math.ceil(total / perPage));
          return {
            data: sliced,
            current_page: currentPage,
            last_page: lastPage,
            per_page: perPage,
            total,
            from: total > 0 ? Math.min(total, startIndex + 1) : 0,
            to: total > 0 ? Math.min(total, endIndex) : 0,
          } as PaginatedResponse<Program>;
        }
        const raw = root as any;
        const mappedData = Array.isArray(raw?.data) ? raw.data.map(mapApiProgramToUi) : [];
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
          : (raw?.last_page && raw?.per_page ? Number(raw.last_page) * Number(raw.per_page) : mappedData.length);
        return {
          ...raw,
          data: mappedData,
          total: totalFallback,
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
