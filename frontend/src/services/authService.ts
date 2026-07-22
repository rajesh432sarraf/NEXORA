import apiClient from './api';
import { AuthTokens, LoginCredentials, RegisterData, User } from '../types/auth';

export const authService = {
  // Login Endpoint
  login: async (credentials: LoginCredentials): Promise<AuthTokens> => {
    const response = await apiClient.post<AuthTokens>('/auth/login', {
      email: credentials.username,
      password: credentials.password,
    });
    return response.data;
  },

  // Register Endpoint
  register: async (data: RegisterData): Promise<User> => {
    const response = await apiClient.post<User>('/auth/register', data);
    return response.data;
  },

  // Get Current User Profile Endpoint
  getMe: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },
};
