import { apiRequest } from './axiosInstance';

export const authApi = {
  // Register new user
  register: async (userData) => {
    return await apiRequest.post('/auth/register', userData);
  },

  // Login user
  login: async (credentials) => {
    return await apiRequest.post('/auth/login', credentials);
  },

  // Refresh token
  refreshToken: async () => {
    return await apiRequest.post('/auth/refresh');
  },

  // Change password
  changePassword: async (passwordData) => {
    return await apiRequest.post('/auth/change-password', passwordData);
  },

  // Get user profile
  getProfile: async () => {
    return await apiRequest.get('/auth/profile');
  },

  // Logout user
  logout: async () => {
    return await apiRequest.post('/auth/logout');
  },
};
