import { apiRequest } from './axiosInstance';

export const dashboardApi = {
  // Get dashboard statistics and recent activity
  getStats: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return await apiRequest.get(`/dashboard/stats${queryParams ? '?' + queryParams : ''}`);
  },
};
