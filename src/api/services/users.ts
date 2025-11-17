import apiClient from '../axios';
import { type PaginatedResponse, type QueryParams } from '../../types';
import { normalizePaginatedResponse, normalizeItemResponse } from '../../utils/pagination';
import { logger } from '../../utils/logger';
import { handleApiError } from '../../utils/errorHandler';

export interface User {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserRequest {
  name: string;
  phone?: string;
  email?: string;
  password?: string;
  role_ids?: number[];
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {}

export const usersService = {
  getUsers: async (params?: QueryParams): Promise<PaginatedResponse<User>> => {
    try {
      logger.log('Fetching users', { params });
      const response = await apiClient.get('/users', { params });
      return normalizePaginatedResponse<User>(response.data, params);
    } catch (error: any) {
      logger.error('Failed to fetch users', error, { params });
      throw handleApiError(error, { endpoint: '/users', params });
    }
  },

  getUser: async (id: number): Promise<User> => {
    try {
      logger.log('Fetching user', { id });
      const response = await apiClient.get(`/users/${id}`);
      const user = normalizeItemResponse<User>(response.data);
      logger.log('User fetched successfully', { id });
      return user;
    } catch (error: any) {
      logger.error('Failed to fetch user', error, { id });
      throw handleApiError(error, { endpoint: `/users/${id}` });
    }
  },

  createUser: async (data: CreateUserRequest): Promise<User> => {
    try {
      logger.log('Creating user', { name: data.name, email: data.email });
      const response = await apiClient.post('/users', data);
      const user = normalizeItemResponse<User>(response.data);
      logger.log('User created successfully', { id: user.id });
      return user;
    } catch (error: any) {
      logger.error('Failed to create user', error, { data });
      throw handleApiError(error, { endpoint: '/users', method: 'POST' });
    }
  },

  updateUser: async (id: number, data: UpdateUserRequest): Promise<User> => {
    try {
      logger.log('Updating user', { id });
      const response = await apiClient.put(`/users/${id}`, data);
      const user = normalizeItemResponse<User>(response.data);
      logger.log('User updated successfully', { id: user.id });
      return user;
    } catch (error: any) {
      logger.error('Failed to update user', error, { id, data });
      throw handleApiError(error, { endpoint: `/users/${id}`, method: 'PUT' });
    }
  },

  updateUserRole: async (id: number, roleId: number): Promise<User> => {
    try {
      logger.log('Updating user role', { id, roleId });
      const response = await apiClient.put(`/users/${id}/role`, { role_id: roleId });
      const user = normalizeItemResponse<User>(response.data);
      logger.log('User role updated successfully', { id: user.id });
      return user;
    } catch (error: any) {
      logger.error('Failed to update user role', error, { id, roleId });
      throw handleApiError(error, { endpoint: `/users/${id}/role`, method: 'PUT' });
    }
  },

  deleteUser: async (id: number): Promise<void> => {
    try {
      logger.log('Deleting user', { id });
      await apiClient.delete(`/users/${id}`);
      logger.log('User deleted successfully', { id });
    } catch (error: any) {
      logger.error('Failed to delete user', error, { id });
      throw handleApiError(error, { endpoint: `/users/${id}`, method: 'DELETE' });
    }
  },
};
