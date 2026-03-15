import { useState, useEffect } from 'react';
import { roomService } from '../services/roomService';
import { useSocketEvent } from './useSocket';
import { SOCKET_EVENTS } from '../constants/socketEvents';

export const useRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch rooms on mount
  const fetchRooms = async (typeFilter = null) => {
    try {
      setLoading(true);
      setError(null);
      const data = await roomService.getRooms(typeFilter);
      setRooms(data.data || data);
    } catch (err) {
      setError(err.message || 'Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  // Update room status
  const updateRoom = async (id, data) => {
    try {
      const updatedRoom = await roomService.updateRoomStatus(id, data);
      return updatedRoom;
    } catch (err) {
      setError(err.message || 'Failed to update room');
      throw err;
    }
  };

  // Filter rooms by type
  const filterByType = (type) => {
    return rooms.filter(room => room.type === type);
  };

  // Filter rooms by floor
  const filterByFloor = (floor) => {
    return rooms.filter(room => room.floor === floor);
  };

  // Listen for real-time updates
  useSocketEvent(SOCKET_EVENTS.ROOM_UPDATED, (updatedRoom) => {
    setRooms(prevRooms => 
      prevRooms.map(room => 
        room._id === updatedRoom._id ? updatedRoom : room
      )
    );
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  return {
    rooms,
    loading,
    error,
    updateRoom,
    filterByType,
    filterByFloor,
    fetchRooms,
    refetch: fetchRooms
  };
};
