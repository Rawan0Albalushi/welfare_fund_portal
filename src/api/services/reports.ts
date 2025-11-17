import apiClient from '../axios';
import { logger } from '../../utils/logger';

export interface DonationsReportParams {
  from_date?: string; // Y-m-d format
  to_date?: string; // Y-m-d format
  status?: 'pending' | 'paid' | 'failed' | 'expired';
  type?: 'quick' | 'gift';
  program_id?: number;
  campaign_id?: number;
  per_page?: number;
  page?: number;
}

export interface DonationsReportStats {
  total_count: number;
  total_amount: number;
  paid_count: number;
  paid_amount: number;
  pending_count: number;
  pending_amount: number;
  failed_count: number;
  expired_count: number;
}

export interface DonationsReportResponse {
  message: string;
  data: any[];
  stats: DonationsReportStats;
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface FinancialReportParams {
  from_date?: string; // Y-m-d format
  to_date?: string; // Y-m-d format
  period?: 'daily' | 'weekly' | 'monthly';
}

export interface FinancialReportSummary {
  total_donations: number;
  paid_donations: number;
  pending_donations: number;
  donors_count: number;
  anonymous_count: number;
  average_donation: number;
}

export interface FinancialReportByStatus {
  status: string;
  count: number;
  total: number;
}

export interface FinancialReportByType {
  type: string;
  count: number;
  total: number;
}

export interface FinancialReportOverTime {
  year: number;
  month: number;
  count: number;
  total: number;
}

export interface FinancialReportResponse {
  message: string;
  data: {
    period: {
      from: string;
      to: string;
      type: string;
    };
    summary: FinancialReportSummary;
    by_status: FinancialReportByStatus[];
    by_type: FinancialReportByType[];
    over_time: FinancialReportOverTime[];
  };
}

export const reportsService = {
  // Donations Report - JSON
  getDonationsReport: async (params?: DonationsReportParams): Promise<DonationsReportResponse> => {
    const cleanedParams = params
      ? Object.fromEntries(
          Object.entries(params).filter(([_, value]) => value !== '' && value !== undefined && value !== null)
        )
      : undefined;

    const response = await apiClient.get('/reports/donations', { params: cleanedParams });
    return response.data;
  },

  // Donations Report - Export Excel
  exportDonationsReportExcel: async (params?: DonationsReportParams): Promise<void> => {
    const cleanedParams = params
      ? Object.fromEntries(
          Object.entries(params).filter(([_, value]) => value !== '' && value !== undefined && value !== null)
        )
      : undefined;

    const response = await apiClient.get('/reports/donations/export/excel', {
      params: cleanedParams,
      responseType: 'blob',
    });

    // Create download link
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Get filename from Content-Disposition header or use default
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'donations_report.xlsx';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Donations Report - Export PDF
  exportDonationsReportPDF: async (params?: DonationsReportParams): Promise<void> => {
    const cleanedParams = params
      ? Object.fromEntries(
          Object.entries(params).filter(([_, value]) => value !== '' && value !== undefined && value !== null)
        )
      : undefined;

    const response = await apiClient.get('/reports/donations/export/pdf', {
      params: cleanedParams,
      responseType: 'blob',
    });

    // Create download link
    const blob = new Blob([response.data], {
      type: 'application/pdf',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Get filename from Content-Disposition header or use default
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'donations_report.pdf';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Financial Report - JSON
  getFinancialReport: async (params?: FinancialReportParams): Promise<FinancialReportResponse> => {
    const cleanedParams = params
      ? Object.fromEntries(
          Object.entries(params).filter(([_, value]) => value !== '' && value !== undefined && value !== null)
        )
      : undefined;

    const response = await apiClient.get('/reports/financial', { params: cleanedParams });
    
    // Debug logging for financial report
    logger.debug('Financial report fetched', {
      hasData: !!response.data,
      hasSummary: !!response.data?.data?.summary
    });
    
    return response.data;
  },

  // Financial Report - Export Excel
  exportFinancialReportExcel: async (params?: FinancialReportParams): Promise<void> => {
    const cleanedParams = params
      ? Object.fromEntries(
          Object.entries(params).filter(([_, value]) => value !== '' && value !== undefined && value !== null)
        )
      : undefined;

    const response = await apiClient.get('/reports/financial/export/excel', {
      params: cleanedParams,
      responseType: 'blob',
    });

    // Create download link
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Get filename from Content-Disposition header or use default
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'financial_report.xlsx';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Financial Report - Export PDF
  exportFinancialReportPDF: async (params?: FinancialReportParams): Promise<void> => {
    const cleanedParams = params
      ? Object.fromEntries(
          Object.entries(params).filter(([_, value]) => value !== '' && value !== undefined && value !== null)
        )
      : undefined;

    const response = await apiClient.get('/reports/financial/export/pdf', {
      params: cleanedParams,
      responseType: 'blob',
    });

    // Create download link
    const blob = new Blob([response.data], {
      type: 'application/pdf',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Get filename from Content-Disposition header or use default
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'financial_report.pdf';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

