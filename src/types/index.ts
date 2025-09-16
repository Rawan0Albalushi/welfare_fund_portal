// Base types
export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
}

// User types
export interface User extends BaseEntity {
  name: string;
  phone: string;
  email: string;
  settings: Record<string, any>;
}

// Category types
export interface Category extends BaseEntity {
  name: string;
  status: 'active' | 'inactive';
  deleted_at?: string;
}

export interface CreateCategoryRequest {
  name: string;
  status: 'active' | 'inactive';
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}

// Program types
export interface Program extends BaseEntity {
  category_id: number;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  goal_amount: number;
  start_date: string;
  end_date: string;
  category?: Category;
}

export interface CreateProgramRequest {
  category_id: number;
  title: string;
  description: string;
  goal_amount: number;
  status: 'draft' | 'active' | 'paused' | 'archived';
  start_date: string;
  end_date: string;
}

export interface UpdateProgramRequest extends Partial<CreateProgramRequest> {}

// Donation types
export interface Donation extends BaseEntity {
  donation_id: string;
  program_id?: number;
  campaign_id?: number;
  amount: number;
  donor_name: string;
  type: 'quick' | 'program' | 'campaign';
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  user_id?: number;
  note?: string;
  paid_at?: string;
  payment_session_id?: string;
  program?: Program;
  user?: User;
}

// Student Registration types
export interface StudentRegistration extends BaseEntity {
  registration_id: string;
  user_id: number;
  program_id: number;
  personal_json: {
    name: string;
    phone: string;
    email: string;
  };
  academic_json: {
    university: string;
    major: string;
    gpa: string;
  };
  financial_json: {
    income: number;
    expenses: number;
  };
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  reject_reason?: string;
  user?: User;
  program?: Program;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

// Auth types
export interface LoginRequest {
  phone: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface AuthUser {
  user: User;
  token: string;
}

// Dashboard types
export interface DashboardStats {
  total_donations: number;
  total_amount: number;
  active_programs: number;
  pending_applications: number;
}

// Filter and pagination types
export interface PaginationParams {
  page?: number;
  per_page?: number;
}

export interface FilterParams {
  search?: string;
  status?: string;
  category_id?: number;
  program_id?: number;
  date_from?: string;
  date_to?: string;
}

export interface SortParams {
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export type QueryParams = PaginationParams & FilterParams & SortParams;

// Form types
export interface FormFieldProps {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea';
  required?: boolean;
  disabled?: boolean;
  options?: { value: string | number; label: string }[];
  multiline?: boolean;
  rows?: number;
}

// Status types
export type StatusType = 'active' | 'inactive' | 'pending' | 'approved' | 'rejected' | 'under_review' | 'draft' | 'paused' | 'archived' | 'paid' | 'failed' | 'cancelled';

export interface StatusOption {
  value: StatusType;
  label: string;
  color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}
