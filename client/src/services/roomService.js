import api from './api';

export const roomService = {
  getRooms: async (typeFilter = null) => {
    const params = typeFilter ? { type: typeFilter } : {};
    const response = await api.get('/rooms', { params });
    return response.data;
  },

  updateRoomStatus: async (id, data) => {
    const response = await api.patch(`/rooms/${id}`, data);
    return response.data;
  }
};
