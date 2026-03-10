import { apiRequest } from './axiosInstance';

export const equipmentApi = {
  // Get all equipment
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return await apiRequest.get(`/equipment${queryParams ? '?' + queryParams : ''}`);
  },

  // Get equipment by ID
  getById: async (id) => {
    return await apiRequest.get(`/equipment/${id}`);
  },

  // Create new equipment
  create: async (equipmentData) => {
    return await apiRequest.post('/equipment', equipmentData);
  },

  // Update equipment
  update: async (id, equipmentData) => {
    return await apiRequest.put(`/equipment/${id}`, equipmentData);
  },

  // Update equipment status
  updateStatus: async (id, statusData) => {
    return await apiRequest.patch(`/equipment/${id}/status`, statusData);
  },

  // Schedule maintenance
  scheduleMaintenance: async (id, data) => {
    return await apiRequest.post(`/equipment/${id}/schedule-maintenance`, data);
  },

  // Complete maintenance
  completeMaintenance: async (id, data) => {
    return await apiRequest.post(`/equipment/${id}/complete-maintenance`, data);
  },

  // Delete equipment
  delete: async (id) => {
    return await apiRequest.delete(`/equipment/${id}`);
  },

  // Get equipment statistics
  getStats: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return await apiRequest.get(`/equipment/stats${queryParams ? '?' + queryParams : ''}`);
  },
};
