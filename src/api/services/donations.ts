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
      const root = response.data as any;
      const payload = root?.data ?? root;
      
      // Debug logging for donations
      console.log('💰 [Donations] Raw response:', response.data);
      console.log('💰 [Donations] Payload:', payload);
      if (payload?.data && Array.isArray(payload.data)) {
        console.log('💰 [Donations] Sample donation:', payload.data[0]);
        console.log('💰 [Donations] Sample donation amount field:', {
          amount: payload.data[0]?.amount,
          amountType: typeof payload.data[0]?.amount,
          paid_amount: payload.data[0]?.paid_amount,
          paidAmountType: typeof payload.data[0]?.paid_amount,
        });
        console.log('💰 [Donations] Total donations count:', payload.data.length);
        console.log('💰 [Donations] Total amount sum:', payload.data.reduce((sum: number, d: Donation) => sum + (d.amount || 0), 0));
      }

      // Normalize to consistent paginated response
      const rawData = Array.isArray((payload as any)?.data)
        ? (payload as any).data
        : Array.isArray(payload)
          ? (payload as Donation[])
          : [];

      // Normalize donation data - ensure amounts are numbers
      const normalizedData = rawData.map((donation: any) => {
        // Ensure amount is a number
        if (donation.amount !== undefined && donation.amount !== null) {
          donation.amount = typeof donation.amount === 'string' 
            ? parseFloat(donation.amount) || 0 
            : Number(donation.amount) || 0;
        }
        // Ensure paid_amount is a number if present
        if (donation.paid_amount !== undefined && donation.paid_amount !== null) {
          donation.paid_amount = typeof donation.paid_amount === 'string' 
            ? parseFloat(donation.paid_amount) || 0 
            : Number(donation.paid_amount) || 0;
        }
        return donation;
      });

      // Robust total detection: prefer total; accept numeric string; check meta.total; fallback to last_page*per_page; else current length
      const explicitTotal = ((): number | undefined => {
        const p: any = root;
        if (typeof p?.total === 'number') return p.total;
        if (typeof p?.total === 'string' && p.total.trim() !== '' && !Number.isNaN(Number(p.total))) return Number(p.total);
        const metaTotal = p?.meta?.total ?? p?.pagination?.total ?? (payload as any)?.total;
        if (typeof metaTotal === 'number') return metaTotal;
        if (typeof metaTotal === 'string' && metaTotal.trim() !== '' && !Number.isNaN(Number(metaTotal))) return Number(metaTotal);
        return undefined;
      })();
      const perPage = Number((root as any)?.per_page ?? (payload as any)?.per_page ?? params?.per_page ?? (normalizedData.length || 10));
      const lastPage = Number((root as any)?.last_page ?? (payload as any)?.last_page ?? (explicitTotal ? Math.max(1, Math.ceil(explicitTotal / perPage)) : 1));
      const normalized: PaginatedResponse<Donation> = {
        data: normalizedData,
        current_page: (root as any)?.current_page ?? (payload as any)?.current_page ?? params?.page ?? 1,
        last_page: lastPage,
        per_page: perPage,
        total: explicitTotal ?? (lastPage * perPage) ?? normalizedData.length,
        from: (root as any)?.from ?? (payload as any)?.from ?? 0,
        to: (root as any)?.to ?? (payload as any)?.to ?? 0,
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
          const root = response.data as any;
          const payload = root?.data ?? root;
          const rawData = Array.isArray((payload as any)?.data)
            ? (payload as any).data
            : Array.isArray(payload)
              ? (payload as Donation[])
              : [];

          // Normalize donation data - ensure amounts are numbers
          const normalizedData = rawData.map((donation: any) => {
            // Ensure amount is a number
            if (donation.amount !== undefined && donation.amount !== null) {
              donation.amount = typeof donation.amount === 'string' 
                ? parseFloat(donation.amount) || 0 
                : Number(donation.amount) || 0;
            }
            // Ensure paid_amount is a number if present
            if (donation.paid_amount !== undefined && donation.paid_amount !== null) {
              donation.paid_amount = typeof donation.paid_amount === 'string' 
                ? parseFloat(donation.paid_amount) || 0 
                : Number(donation.paid_amount) || 0;
            }
            return donation;
          });

          const explicitTotal = ((): number | undefined => {
            const p: any = root;
            if (typeof p?.total === 'number') return p.total;
            if (typeof p?.total === 'string' && p.total.trim() !== '' && !Number.isNaN(Number(p.total))) return Number(p.total);
            const metaTotal = p?.meta?.total ?? p?.pagination?.total ?? (payload as any)?.total;
            if (typeof metaTotal === 'number') return metaTotal;
            if (typeof metaTotal === 'string' && metaTotal.trim() !== '' && !Number.isNaN(Number(metaTotal))) return Number(metaTotal);
            return undefined;
          })();
          const perPage = Number((root as any)?.per_page ?? (payload as any)?.per_page ?? params?.per_page ?? (normalizedData.length || 10));
          const lastPage = Number((root as any)?.last_page ?? (payload as any)?.last_page ?? (explicitTotal ? Math.max(1, Math.ceil(explicitTotal / perPage)) : 1));
          const normalized: PaginatedResponse<Donation> = {
            data: normalizedData,
            current_page: (root as any)?.current_page ?? (payload as any)?.current_page ?? params?.page ?? 1,
            last_page: lastPage,
            per_page: perPage,
            total: explicitTotal ?? (lastPage * perPage) ?? normalizedData.length,
            from: (root as any)?.from ?? (payload as any)?.from ?? 0,
            to: (root as any)?.to ?? (payload as any)?.to ?? 0,
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
