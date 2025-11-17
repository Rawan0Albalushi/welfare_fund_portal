import apiClient from '../axios';
import { type DashboardStats } from '../../types';
import { logger } from '../../utils/logger';
import { handleApiError } from '../../utils/errorHandler';

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
    try {
      logger.log('Fetching dashboard data');
      const response = await apiClient.get('/dashboard');
      return response.data?.data ?? response.data;
    } catch (error: any) {
      logger.error('Failed to fetch dashboard data', error);
      throw handleApiError(error, { endpoint: '/dashboard' });
    }
  },

  getStats: async (): Promise<DashboardStats> => {
    // Try /stats endpoint first
    try {
      logger.log('Fetching dashboard stats from /stats endpoint');
      const response = await apiClient.get('/stats');
      
      const payload = response.data?.data ?? response.data;
      
      logger.debug('Stats payload received', {
        hasPayload: !!payload,
        payloadKeys: payload ? Object.keys(payload) : []
      });
      
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
      
      logger.debug('Found fields in payload', {
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
      
      logger.debug('Normalized stats', stats);
      
      // Validate that we have reasonable values
      if (stats.total_donations < 0 || stats.active_programs < 0 || stats.pending_applications < 0 || stats.total_amount < 0) {
        logger.warn('Negative values detected, setting to 0');
        stats.total_donations = Math.max(0, stats.total_donations);
        stats.total_amount = Math.max(0, stats.total_amount);
        stats.active_programs = Math.max(0, stats.active_programs);
        stats.pending_applications = Math.max(0, stats.pending_applications);
      }
      
      // Check if all values are zero - this might indicate the API returned empty data or wrong structure
      if (stats.total_donations === 0 && stats.total_amount === 0 && stats.active_programs === 0 && stats.pending_applications === 0) {
        logger.warn('All stats are zero! This might indicate empty/wrong data from API', {
          payload: JSON.stringify(payload, null, 2)
        });
      }
      
      return stats;
    } catch (error: any) {
      logger.warn('/stats endpoint failed, trying /dashboard endpoint', { status: error?.response?.status });
      
      // Try /dashboard endpoint as fallback
      try {
        logger.log('Trying /dashboard endpoint as fallback');
        const dashboardResponse = await apiClient.get('/dashboard');
        logger.debug('Dashboard endpoint response received');
        
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
        
        logger.warn('Dashboard endpoint did not contain stats data');
      } catch (dashboardError: any) {
        logger.error('Both /stats and /dashboard endpoints failed', dashboardError, {
          statsError: error,
          dashboardError: dashboardError,
          statsErrorStatus: error?.response?.status
        });
      }
      
      // Return default stats on error instead of throwing
      // This allows the dashboard to render with 0 values
      logger.warn('Returning default stats (all zeros) due to errors');
      return {
        total_donations: 0,
        total_amount: 0,
        active_programs: 0,
        pending_applications: 0,
      };
    }
  },
};
