import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

import { equipmentApi } from '../api/equipmentApi';

export const useEquipment = (initialParams = {}) => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});
  const [params, setParams] = useState(initialParams);
  const { socket, isConnected } = useSocket();

  // Fetch equipment
  const fetchEquipment = async (queryParams = params) => {
    try {
      setLoading(true);
      setError(null);
      const response = await equipmentApi.getAll(queryParams);
      if (response.success) {
        setEquipment(response.data?.equipment || response.data || []);
      }
    } catch (err) {
      setError(err.message);
      toast.error('Failed to fetch equipment');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async (queryParams = params) => {
    try {
      const response = await equipmentApi.getStats(queryParams);
      if (response.success) {
        setStats(response.data || {});
      }
    } catch (err) {
      console.error('Failed to fetch equipment stats:', err);
    }
  };

  // Schedule maintenance
  const scheduleMaintenance = async (id, data) => {
    try {
      setLoading(true);
      const response = await equipmentApi.scheduleMaintenance(id, data);
      if (response.success) {
        setEquipment(prev => 
          prev.map(eq => eq.id === id ? { ...eq, ...response.data } : eq)
        );
        toast.success('Maintenance scheduled successfully');
        return { success: true, data: response.data };
      }
      return { success: false, error: response.message };
    } catch (err) {
      setError(err.message);
      toast.error('Failed to schedule maintenance');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Complete maintenance
  const completeMaintenance = async (id, data) => {
    try {
      setLoading(true);
      const response = await equipmentApi.completeMaintenance(id, data);
      if (response.success) {
        setEquipment(prev => 
          prev.map(eq => eq.id === id ? { ...eq, ...response.data } : eq)
        );
        toast.success('Maintenance completed successfully');
        return { success: true, data: response.data };
      }
      return { success: false, error: response.message };
    } catch (err) {
      setError(err.message);
      toast.error('Failed to complete maintenance');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Create equipment
  const createEquipment = async (equipmentData) => {
    try {
      setLoading(true);
      const response = await equipmentApi.create(equipmentData);
      if (response.success) {
        setEquipment(prev => [...prev, response.data]);
        toast.success('Equipment created successfully');
        return { success: true, data: response.data };
      }
      return { success: false, error: response.message };
    } catch (err) {
      setError(err.message);
      toast.error('Failed to create equipment');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update equipment
  const updateEquipment = async (id, equipmentData) => {
    try {
      setLoading(true);
      const response = await equipmentApi.update(id, equipmentData);
      if (response.success) {
        setEquipment(prev => 
          prev.map(eq => eq.id === id ? response.data : eq)
        );
        toast.success('Equipment updated successfully');
        return { success: true, data: response.data };
      }
      return { success: false, error: response.message };
    } catch (err) {
      setError(err.message);
      toast.error('Failed to update equipment');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update equipment status
  const updateEquipmentStatus = async (id, status) => {
    try {
      setLoading(true);
      const response = await equipmentApi.updateStatus(id, { status });
      if (response.success) {
        setEquipment(prev => 
          prev.map(eq => eq.id === id ? { ...eq, ...response.data } : eq)
        );
        toast.success(`Equipment status updated to ${status}`);
        return { success: true, data: response.data };
      }
      return { success: false, error: response.message };
    } catch (err) {
      setError(err.message);
      toast.error('Failed to update equipment status');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete equipment
  const deleteEquipment = async (id) => {
    try {
      setLoading(true);
      const response = await equipmentApi.delete(id);
      if (response.success) {
        setEquipment(prev => prev.filter(eq => eq.id !== id));
        toast.success('Equipment deleted successfully');
        return { success: true };
      }
      return { success: false, error: response.message };
    } catch (err) {
      setError(err.message);
      toast.error('Failed to delete equipment');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchEquipment();
    fetchStats();
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleResourceUpdate = (data) => {
      if (data.type === 'equipment') {
        setEquipment(prev => 
          prev.map(eq => eq.id === data.data.id ? { ...eq, ...data.data } : eq)
        );
      }
    };

    const handleResourceCreate = (data) => {
      if (data.type === 'equipment') {
        setEquipment(prev => [...prev, data.data]);
      }
    };

    const handleResourceDelete = (data) => {
      if (data.type === 'equipment') {
        setEquipment(prev => prev.filter(eq => eq.id !== data.id));
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
    equipment,
    loading,
    error,
    stats,
    params,
    setParams,
    fetchEquipment,
    fetchStats,
    createEquipment,
    updateEquipment,
    updateEquipmentStatus,
    deleteEquipment,
    scheduleMaintenance,
    completeMaintenance,
  };
};
