import { apiRequest } from './axiosInstance';

export const roomsApi = {
  // Get all rooms
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return await apiRequest.get(`/rooms${queryParams ? '?' + queryParams : ''}`);
  },

  // Get room by ID
  getById: async (id) => {
    return await apiRequest.get(`/rooms/${id}`);
  },

  // Create new room
  create: async (roomData) => {
    return await apiRequest.post('/rooms', roomData);
  },

  // Update room
  update: async (id, roomData) => {
    return await apiRequest.put(`/rooms/${id}`, roomData);
  },

  // Update room status
  updateStatus: async (id, statusData) => {
    return await apiRequest.patch(`/rooms/${id}/status`, statusData);
  },

  // Delete room
  delete: async (id) => {
    return await apiRequest.delete(`/rooms/${id}`);
  },

  // Get room statistics
  getStats: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return await apiRequest.get(`/rooms/stats${queryParams ? '?' + queryParams : ''}`);
  },
};
