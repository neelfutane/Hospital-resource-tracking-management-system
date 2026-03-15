import api from './api';

export const bedService = {
  getBeds: async (wardFilter = null) => {
    const params = wardFilter ? { ward: wardFilter } : {};
    const response = await api.get('/beds', { params });
    return response.data;
  },

  getBedById: async (id) => {
    const response = await api.get(`/beds/${id}`);
    return response.data;
  },

  updateBedStatus: async (id, data) => {
    const response = await api.put(`/beds/${id}`, data);
    return response.data;
  },

  createBed: async (bedData) => {
    const response = await api.post('/beds', bedData);
    return response.data;
  },
};
