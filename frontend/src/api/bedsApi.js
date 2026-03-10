import { apiRequest } from './axiosInstance';

export const bedsApi = {
  // Get all beds
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return await apiRequest.get(`/beds${queryParams ? '?' + queryParams : ''}`);
  },

  // Get bed by ID
  getById: async (id) => {
    return await apiRequest.get(`/beds/${id}`);
  },

  // Create new bed
  create: async (bedData) => {
    return await apiRequest.post('/beds', bedData);
  },

  // Update bed
  update: async (id, bedData) => {
    return await apiRequest.put(`/beds/${id}`, bedData);
  },

  // Update bed status
  updateStatus: async (id, statusData) => {
    return await apiRequest.patch(`/beds/${id}/status`, statusData);
  },

  // Delete bed
  delete: async (id) => {
    return await apiRequest.delete(`/beds/${id}`);
  },

  // Get bed statistics
  getStats: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return await apiRequest.get(`/beds/stats${queryParams ? '?' + queryParams : ''}`);
  },
};
