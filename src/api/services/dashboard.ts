import apiClient from '../axios';
import { type DashboardStats } from '../../types';

/**
 * Normalizes a value to a number, handling strings, nulls, and undefined
 */
const normalizeNumber = (value: any): number => {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  if (typeof value === 'number') {
    return isNaN(value) ? 0 : value;
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export const dashboardService = {
  getDashboard: async (): Promise<any> => {
    const response = await apiClient.get('/dashboard');
    return response.data?.data ?? response.data;
  },

  getStats: async (): Promise<DashboardStats> => {
    // Try /stats endpoint first
    try {
      const response = await apiClient.get('/stats');
      
      // Debug logging - log the entire response structure
      console.log('📊 [Dashboard Stats] Full response:', response);
      console.log('📊 [Dashboard Stats] Response data:', response.data);
      console.log('📊 [Dashboard Stats] Response data?.data:', response.data?.data);
      
      const payload = response.data?.data ?? response.data;
      
      console.log('📊 [Dashboard Stats] Final payload:', payload);
      console.log('📊 [Dashboard Stats] Payload keys:', payload ? Object.keys(payload) : 'payload is null/undefined');
      console.log('📊 [Dashboard Stats] Payload type:', typeof payload);
      
      // Try multiple possible field names (snake_case, camelCase, and other variations)
      const stats: DashboardStats = {
        total_donations: normalizeNumber(
          payload?.total_donations ?? 
          payload?.totalDonations ?? 
          payload?.donations_count ??
          payload?.donationsCount ??
          payload?.totalDonationsCount
        ),
        total_amount: normalizeNumber(
          payload?.total_amount ?? 
          payload?.totalAmount ?? 
          payload?.donations_total ??
          payload?.donationsTotal ??
          payload?.totalDonationsAmount
        ),
        active_programs: normalizeNumber(
          payload?.active_programs ?? 
          payload?.activePrograms ?? 
          payload?.programs_count ??
          payload?.programsCount ??
          payload?.activeProgramsCount
        ),
        pending_applications: normalizeNumber(
          payload?.pending_applications ?? 
          payload?.pendingApplications ?? 
          payload?.applications_pending ??
          payload?.applicationsPending ??
          payload?.pendingApplicationsCount
        ),
      };
      
      // Log all possible field values found
      console.log('📊 [Dashboard Stats] Found fields in payload:', {
        total_donations: payload?.total_donations,
        totalDonations: payload?.totalDonations,
        donations_count: payload?.donations_count,
        total_amount: payload?.total_amount,
        totalAmount: payload?.totalAmount,
        donations_total: payload?.donations_total,
        active_programs: payload?.active_programs,
        activePrograms: payload?.activePrograms,
        programs_count: payload?.programs_count,
        pending_applications: payload?.pending_applications,
        pendingApplications: payload?.pendingApplications,
        applications_pending: payload?.applications_pending,
      });
      
      // Log normalized values for debugging
      console.log('📊 [Dashboard Stats] Normalized stats:', stats);
      
      // Validate that we have reasonable values
      if (stats.total_donations < 0 || stats.active_programs < 0 || stats.pending_applications < 0 || stats.total_amount < 0) {
        console.warn('⚠️ [Dashboard Stats] Negative values detected, setting to 0');
        stats.total_donations = Math.max(0, stats.total_donations);
        stats.total_amount = Math.max(0, stats.total_amount);
        stats.active_programs = Math.max(0, stats.active_programs);
        stats.pending_applications = Math.max(0, stats.pending_applications);
      }
      
      // Check if all values are zero - this might indicate the API returned empty data or wrong structure
      if (stats.total_donations === 0 && stats.total_amount === 0 && stats.active_programs === 0 && stats.pending_applications === 0) {
        console.warn('⚠️ [Dashboard Stats] All stats are zero! This might indicate:');
        console.warn('  1. The API endpoint returned empty/wrong data');
        console.warn('  2. The field names don\'t match');
        console.warn('  3. There\'s actually no data in the database');
        console.warn('  Full payload for inspection:', JSON.stringify(payload, null, 2));
      }
      
      return stats;
    } catch (error: any) {
      console.warn('⚠️ [Dashboard Stats] /stats endpoint failed, trying /dashboard endpoint:', error?.response?.status);
      
      // Try /dashboard endpoint as fallback
      try {
        const dashboardResponse = await apiClient.get('/dashboard');
        console.log('📊 [Dashboard Stats] Dashboard endpoint response:', dashboardResponse.data);
        
        const dashboardPayload = dashboardResponse.data?.data ?? dashboardResponse.data;
        
        // Check if dashboard contains stats
        if (dashboardPayload?.stats) {
          const stats = dashboardPayload.stats;
          return {
            total_donations: normalizeNumber(stats?.total_donations ?? stats?.totalDonations),
            total_amount: normalizeNumber(stats?.total_amount ?? stats?.totalAmount),
            active_programs: normalizeNumber(stats?.active_programs ?? stats?.activePrograms),
            pending_applications: normalizeNumber(stats?.pending_applications ?? stats?.pendingApplications),
          };
        }
        
        // Check if dashboard data itself contains the stats fields
        if (dashboardPayload?.total_donations !== undefined || dashboardPayload?.totalDonations !== undefined) {
          return {
            total_donations: normalizeNumber(dashboardPayload?.total_donations ?? dashboardPayload?.totalDonations),
            total_amount: normalizeNumber(dashboardPayload?.total_amount ?? dashboardPayload?.totalAmount),
            active_programs: normalizeNumber(dashboardPayload?.active_programs ?? dashboardPayload?.activePrograms),
            pending_applications: normalizeNumber(dashboardPayload?.pending_applications ?? dashboardPayload?.pendingApplications),
          };
        }
        
        console.warn('⚠️ [Dashboard Stats] Dashboard endpoint did not contain stats data');
      } catch (dashboardError: any) {
        console.error('🚨 [Dashboard Stats] Both /stats and /dashboard endpoints failed');
        console.error('🚨 [Dashboard Stats] Stats error:', error);
        console.error('🚨 [Dashboard Stats] Dashboard error:', dashboardError);
        console.error('🚨 [Dashboard Stats] Stats error response:', error?.response);
        console.error('🚨 [Dashboard Stats] Stats error status:', error?.response?.status);
      }
      
      // Return default stats on error instead of throwing
      // This allows the dashboard to render with 0 values
      return {
        total_donations: 0,
        total_amount: 0,
        active_programs: 0,
        pending_applications: 0,
      };
    }
  },
};
