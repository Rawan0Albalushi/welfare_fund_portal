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
  name_ar: string;
  name_en: string;
  status: 'active' | 'inactive';
  deleted_at?: string;
}

export interface CreateCategoryRequest {
  name_ar: string;
  name_en: string;
  status: 'active' | 'inactive';
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}

// Program types
export interface Program extends BaseEntity {
  category_id: number;
  title_ar: string;
  title_en: string;
  description_ar?: string;
  description_en?: string;
  status: 'active' | 'inactive';
  deleted_at?: string;
}

export interface CreateProgramRequest {
  category_id: number;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  status: 'active' | 'inactive';
}

export interface UpdateProgramRequest extends Partial<CreateProgramRequest> {}

// Banner types
export interface Banner extends BaseEntity {
  title_ar: string;
  title_en: string;
  description_ar?: string | null;
  description_en?: string | null;
  image?: string | null;
  image_url?: string | null;
  link?: string | null;
  status: 'active' | 'inactive';
  order?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  deleted_at?: string | null;
}

export interface CreateBannerRequest {
  title_ar: string;
  title_en: string;
  description_ar?: string;
  description_en?: string;
  image?: string;
  link?: string;
  status: 'active' | 'inactive';
  order?: number;
  start_date?: string;
  end_date?: string;
}

export interface UpdateBannerRequest extends Partial<CreateBannerRequest> {}

// Campaign types
export interface Campaign extends BaseEntity {
  category_id?: number | null;
  title_ar: string;
  title_en: string;
  description_ar?: string | null;
  description_en?: string | null;
  goal_amount?: number | null;
  image?: string | null;
  image_url?: string | null;
  status?: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  start_date?: string | null;
  end_date?: string | null;
  target_donors?: number | null;
  impact_description_ar?: string | null;
  impact_description_en?: string | null;
  campaign_highlights?: string[] | null;
  deleted_at?: string | null;
}

// Donation types
export interface Donation extends BaseEntity {
  donation_id: string;
  program_id?: number;
  campaign_id?: number | null;
  amount: number;
  donor_name: string;
  donor_email?: string | null;
  donor_phone?: string | null;
  type: 'quick' | 'gift';
  status: 'pending' | 'paid' | 'failed' | 'expired';
  payment_method?: string | null;
  is_anonymous?: boolean;
  message?: string | null;
  payload?: Record<string, any> | null;
  user_id?: number | null;
  note?: string | null;
  expires_at?: string | null;
  paid_at?: string | null;
  payment_session_id?: string | null;
  payment_url?: string | null;
  paid_amount?: number | null;
  program?: Program;
  campaign?: Campaign;
  user?: User;
}

// Student Registration types
export interface StudentRegistration extends BaseEntity {
  registration_id: string;
  user_id?: number | null;
  program_id?: number | null;
  // New direct fields (preferred)
  student_name?: string | null;
  student_id?: string | null;
  email?: string | null;
  phone?: string | null;
  university?: string | null;
  college?: string | null;
  major?: string | null;
  academic_year?: string | null;
  gpa?: number | null;
  family_income?: number | null;
  family_members?: number | null;
  support_needed?: string | null;
  notes?: string | null;
  // Legacy JSON fields (still optional for backward-compat)
  personal_json?: {
    name?: string;
    phone?: string;
    email?: string;
  } | null;
  academic_json?: {
    university?: string;
    major?: string;
    gpa?: string;
  } | null;
  financial_json?: {
    income?: number;
    expenses?: number;
  } | null;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  reject_reason?: string | null;
  id_card_image?: string | null;
  user?: User;
  program?: Program;
}

export interface StudentRegistrationCard extends BaseEntity {
  headline_ar: string;
  headline_en: string;
  subtitle_ar?: string | null;
  subtitle_en?: string | null;
  background?: string | null;
  background_image?: string | null;
  background_image_path?: string | null;
  background_image_url?: string | null;
  status: 'active' | 'inactive';
}

export interface UpdateStudentRegistrationCardRequest {
  headline_ar?: string;
  headline_en?: string;
  subtitle_ar?: string;
  subtitle_en?: string;
  background?: string | Record<string, any> | any[] | null;
  background_image?: string;
  background_image_path?: string | null;
  status?: 'active' | 'inactive';
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
  email: string;
  password: string;
}

export interface LoginResponse {
  admin: AdminUser;
  token: string;
}

export interface AuthUser {
  admin: AdminUser;
  token: string;
}

// Admin User types
export interface AdminUser extends BaseEntity {
  name: string;
  email: string;
  role: 'super_admin' | 'admin';
  permissions: string[];
  is_active: boolean;
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
  type?: string;
  category_id?: number;
  program_id?: number;
  campaign_id?: number;
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
export type StatusType = 'active' | 'inactive' | 'pending' | 'approved' | 'rejected' | 'under_review' | 'draft' | 'paused' | 'archived' | 'paid' | 'failed' | 'expired';

export interface StatusOption {
  value: StatusType;
  label: string;
  color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}
