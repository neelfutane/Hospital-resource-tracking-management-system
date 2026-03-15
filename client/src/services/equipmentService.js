import api from './api';

export const equipmentService = {
  getEquipment: async (filters = {}) => {
    const response = await api.get('/equipment', { params: filters });
    return response.data;
  },

  updateEquipment: async (id, data) => {
    const response = await api.patch(`/equipment/${id}`, data);
    return response.data;
  },

  createEquipment: async (equipmentData) => {
    const response = await api.post('/equipment', equipmentData);
    return response.data;
  },
};
