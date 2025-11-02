import apiClient from '../axios';
import { type StudentRegistration, type PaginatedResponse, type QueryParams } from '../../types';

export const applicationsService = {
  getApplications: async (params?: QueryParams): Promise<PaginatedResponse<StudentRegistration>> => {
    // Remove empty strings/nulls from params to prevent over-filtering on backend
    const cleanedParams = params
      ? Object.fromEntries(
          Object.entries(params).filter(([_, value]) => value !== '' && value !== undefined && value !== null)
        )
      : undefined;

    try {
      const response = await apiClient.get('/applications', { params: cleanedParams });
      const payload = response.data?.data ?? response.data;
      
      // Debug logging for applications
      console.log('📝 [Applications] Raw response:', response.data);
      console.log('📝 [Applications] Payload:', payload);
      if (payload?.data && Array.isArray(payload.data)) {
        console.log('📝 [Applications] Sample application:', payload.data[0]);
        console.log('📝 [Applications] Total applications count:', payload.data.length);
        console.log('📝 [Applications] Pending applications count:', payload.data.filter((a: StudentRegistration) => a.status === 'pending').length);
      }

      // Normalize to consistent paginated response
      const normalized: PaginatedResponse<StudentRegistration> = {
        data: Array.isArray((payload as any)?.data)
          ? (payload as any).data
          : Array.isArray(payload)
            ? (payload as StudentRegistration[])
            : [],
        current_page: (payload as any)?.current_page ?? params?.page ?? 1,
        last_page: (payload as any)?.last_page ?? 1,
        per_page: (payload as any)?.per_page ?? params?.per_page ?? 10,
        total: (payload as any)?.total ?? ((Array.isArray((payload as any)?.data) ? (payload as any).data.length : Array.isArray(payload) ? (payload as any).length : 0)),
        from: (payload as any)?.from ?? 0,
        to: (payload as any)?.to ?? 0,
      };

      return normalized;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        try {
          // Retry legacy path
          const response = await apiClient.get('/applications', { params: cleanedParams });
          const payload = response.data?.data ?? response.data;
          const normalized: PaginatedResponse<StudentRegistration> = {
            data: Array.isArray((payload as any)?.data)
              ? (payload as any).data
              : Array.isArray(payload)
                ? (payload as StudentRegistration[])
                : [],
            current_page: (payload as any)?.current_page ?? params?.page ?? 1,
            last_page: (payload as any)?.last_page ?? 1,
            per_page: (payload as any)?.per_page ?? params?.per_page ?? 10,
            total: (payload as any)?.total ?? ((Array.isArray((payload as any)?.data) ? (payload as any).data.length : Array.isArray(payload) ? (payload as any).length : 0)),
            from: (payload as any)?.from ?? 0,
            to: (payload as any)?.to ?? 0,
          };
          return normalized;
        } catch (legacyError: any) {
          if (legacyError?.response?.status === 404) {
            console.warn('⚠️ [Applications] 404 received on both paths - returning empty list');
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
          throw legacyError;
        }
      }
      throw error;
    }
  },

  getApplication: async (id: number): Promise<StudentRegistration> => {
    const response = await apiClient.get(`/applications/${id}`);
    const payload = response.data?.data ?? response.data;
    return payload as StudentRegistration;
  },

  updateApplicationStatus: async (id: number, status: string): Promise<StudentRegistration> => {
    const response = await apiClient.put(`/applications/${id}/status`, { status });
    const payload = response.data?.data ?? response.data;
    return payload as StudentRegistration;
  },
};
