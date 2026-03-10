import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

import { roomsApi } from '../api/roomsApi';

export const useRooms = (initialParams = {}) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});
  const [params, setParams] = useState(initialParams);
  const { socket, isConnected } = useSocket();

  // Fetch rooms
  const fetchRooms = async (queryParams = params) => {
    try {
      setLoading(true);
      setError(null);
      const response = await roomsApi.getAll(queryParams);
      if (response.success) {
        setRooms(response.data?.rooms || response.data || []);
      }
    } catch (err) {
      setError(err.message);
      toast.error('Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async (queryParams = params) => {
    try {
      const response = await roomsApi.getStats(queryParams);
      if (response.success) {
        setStats(response.data || {});
      }
    } catch (err) {
      console.error('Failed to fetch room stats:', err);
    }
  };

  // Create room
  const createRoom = async (roomData) => {
    try {
      setLoading(true);
      const response = await roomsApi.create(roomData);
      if (response.success) {
        setRooms(prev => [...prev, response.data]);
        toast.success('Room created successfully');
        return { success: true, data: response.data };
      }
      return { success: false, error: response.message };
    } catch (err) {
      setError(err.message);
      toast.error('Failed to create room');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update room
  const updateRoom = async (id, roomData) => {
    try {
      setLoading(true);
      const response = await roomsApi.update(id, roomData);
      if (response.success) {
        setRooms(prev => 
          prev.map(room => room.id === id ? response.data : room)
        );
        toast.success('Room updated successfully');
        return { success: true, data: response.data };
      }
      return { success: false, error: response.message };
    } catch (err) {
      setError(err.message);
      toast.error('Failed to update room');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update room status
  const updateRoomStatus = async (id, status) => {
    try {
      setLoading(true);
      const response = await roomsApi.updateStatus(id, { status });
      if (response.success) {
        setRooms(prev => 
          prev.map(room => room.id === id ? { ...room, ...response.data } : room)
        );
        toast.success(`Room status updated to ${status}`);
        return { success: true, data: response.data };
      }
      return { success: false, error: response.message };
    } catch (err) {
      setError(err.message);
      toast.error('Failed to update room status');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete room
  const deleteRoom = async (id) => {
    try {
      setLoading(true);
      const response = await roomsApi.delete(id);
      if (response.success) {
        setRooms(prev => prev.filter(room => room.id !== id));
        toast.success('Room deleted successfully');
        return { success: true };
      }
      return { success: false, error: response.message };
    } catch (err) {
      setError(err.message);
      toast.error('Failed to delete room');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchRooms();
    fetchStats();
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleResourceUpdate = (data) => {
      if (data.type === 'room') {
        setRooms(prev => 
          prev.map(room => room.id === data.data.id ? { ...room, ...data.data } : room)
        );
      }
    };

    const handleResourceCreate = (data) => {
      if (data.type === 'room') {
        setRooms(prev => [...prev, data.data]);
      }
    };

    const handleResourceDelete = (data) => {
      if (data.type === 'room') {
        setRooms(prev => prev.filter(room => room.id !== data.id));
      }
    };

    socket.on('resource:updated', handleResourceUpdate);
    socket.on('resource:created', handleResourceCreate);
    socket.on('resource:deleted', handleResourceDelete);

    return () => {
      socket.off('resource:updated', handleResourceUpdate);
      socket.off('resource:created', handleResourceCreate);
      socket.off('resource:deleted', handleResourceDelete);
    };
  }, [socket, isConnected]);

  return {
    rooms,
    loading,
    error,
    stats,
    params,
    setParams,
    fetchRooms,
    fetchStats,
    createRoom,
    updateRoom,
    updateRoomStatus,
    deleteRoom,
  };
};
