import { apiRequest } from './axiosInstance';

export const alertsApi = {
  // Get all alerts
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return await apiRequest.get(`/alerts${queryParams ? '?' + queryParams : ''}`);
  },

  // Get alert by ID
  getById: async (id) => {
    return await apiRequest.get(`/alerts/${id}`);
  },

  // Acknowledge alert
  acknowledge: async (id) => {
    return await apiRequest.post(`/alerts/${id}/acknowledge`);
  },

  // Resolve alert
  resolve: async (id) => {
    return await apiRequest.post(`/alerts/${id}/resolve`);
  },
};
