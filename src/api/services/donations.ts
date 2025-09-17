import apiClient from '../axios';
import { type Donation, type PaginatedResponse, type QueryParams } from '../../types';

export const donationsService = {
  getDonations: async (params?: QueryParams): Promise<PaginatedResponse<Donation>> => {
    try {
      // Remove empty strings/nulls from params to prevent over-filtering on backend
      const cleanedParams = params
        ? Object.fromEntries(
            Object.entries(params).filter(([_, value]) => value !== '' && value !== undefined && value !== null)
          )
        : undefined;

      const response = await apiClient.get('/donations', { params: cleanedParams });
      const payload = response.data?.data ?? response.data;
      
      // Debug logging for donations
      console.log('💰 [Donations] Raw response:', response.data);
      console.log('💰 [Donations] Payload:', payload);
      if (payload?.data && Array.isArray(payload.data)) {
        console.log('💰 [Donations] Sample donation:', payload.data[0]);
        console.log('💰 [Donations] Total donations count:', payload.data.length);
        console.log('💰 [Donations] Total amount sum:', payload.data.reduce((sum: number, d: Donation) => sum + (d.amount || 0), 0));
      }

      // Normalize to consistent paginated response
      const normalized: PaginatedResponse<Donation> = {
        data: Array.isArray((payload as any)?.data)
          ? (payload as any).data
          : Array.isArray(payload)
            ? (payload as Donation[])
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
          const cleanedParams = params
            ? Object.fromEntries(
                Object.entries(params).filter(([_, value]) => value !== '' && value !== undefined && value !== null)
              )
            : undefined;
          const response = await apiClient.get('/donations', { params: cleanedParams });
          const payload = response.data?.data ?? response.data;
          const normalized: PaginatedResponse<Donation> = {
            data: Array.isArray((payload as any)?.data)
              ? (payload as any).data
              : Array.isArray(payload)
                ? (payload as Donation[])
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
            console.warn('⚠️ [Donations] 404 received on both paths - returning empty list');
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
          throw legacyError;
        }
      }
      throw error;
    }
  },

  getDonation: async (id: number): Promise<Donation> => {
    const response = await apiClient.get(`/donations/${id}`);
    const payload = response.data?.data ?? response.data;
    return payload as Donation;
  },
};
