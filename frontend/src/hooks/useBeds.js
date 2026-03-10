import { useState, useEffect } from 'react';
import { bedsApi } from '../api/bedsApi';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

export const useBeds = (initialParams = {}) => {
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});
  const [params, setParams] = useState(initialParams);
  const { socket, isConnected } = useSocket();

  // Fetch beds
  const fetchBeds = async (queryParams = params) => {
    try {
      setLoading(true);
      setError(null);
      const response = await bedsApi.getAll(queryParams);
      if (response.success) {
        setBeds(response.data?.beds || response.data || []);
      }
    } catch (err) {
      setError(err.message);
      toast.error('Failed to fetch beds');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async (queryParams = params) => {
    try {
      const response = await bedsApi.getStats(queryParams);
      if (response.success) {
        setStats(response.data || {});
      }
    } catch (err) {
      console.error('Failed to fetch bed stats:', err);
    }
  };

  // Create bed
  const createBed = async (bedData) => {
    try {
      setLoading(true);
      const response = await bedsApi.create(bedData);
      if (response.success) {
        setBeds(prev => [...prev, response.data]);
        toast.success('Bed created successfully');
        return { success: true, data: response.data };
      }
      return { success: false, error: response.message };
    } catch (err) {
      setError(err.message);
      toast.error('Failed to create bed');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update bed
  const updateBed = async (id, bedData) => {
    try {
      setLoading(true);
      const response = await bedsApi.update(id, bedData);
      if (response.success) {
        setBeds(prev => 
          prev.map(bed => bed.id === id ? response.data : bed)
        );
        toast.success('Bed updated successfully');
        return { success: true, data: response.data };
      }
      return { success: false, error: response.message };
    } catch (err) {
      setError(err.message);
      toast.error('Failed to update bed');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update bed status
  const updateBedStatus = async (id, status) => {
    try {
      setLoading(true);
      const response = await bedsApi.updateStatus(id, { status });
      if (response.success) {
        setBeds(prev => 
          prev.map(bed => bed.id === id ? { ...bed, ...response.data } : bed)
        );
        toast.success(`Bed status updated to ${status}`);
        return { success: true, data: response.data };
      }
      return { success: false, error: response.message };
    } catch (err) {
      setError(err.message);
      toast.error('Failed to update bed status');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete bed
  const deleteBed = async (id) => {
    try {
      setLoading(true);
      const response = await bedsApi.delete(id);
      if (response.success) {
        setBeds(prev => prev.filter(bed => bed.id !== id));
        toast.success('Bed deleted successfully');
        return { success: true };
      }
      return { success: false, error: response.message };
    } catch (err) {
      setError(err.message);
      toast.error('Failed to delete bed');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchBeds();
    fetchStats();
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleResourceUpdate = (data) => {
      if (data.type === 'bed') {
        setBeds(prev => 
          prev.map(bed => bed.id === data.data.id ? { ...bed, ...data.data } : bed)
        );
      }
    };

    const handleResourceCreate = (data) => {
      if (data.type === 'bed') {
        setBeds(prev => [...prev, data.data]);
      }
    };

    const handleResourceDelete = (data) => {
      if (data.type === 'bed') {
        setBeds(prev => prev.filter(bed => bed.id !== data.data.id));
      }
    };

    const handleStatusChange = (data) => {
      if (data.type === 'bed') {
        setBeds(prev => 
          prev.map(bed => bed.id === data.data.id ? { ...bed, ...data.data } : bed)
        );
        toast.success(`Bed ${data.data.bedNumber} status changed to ${data.data.status}`);
      }
    };

    socket.on('resource-update', handleResourceUpdate);
    socket.on('resource-create', handleResourceCreate);
    socket.on('resource-delete', handleResourceDelete);
    socket.on('status-change', handleStatusChange);

    return () => {
      socket.off('resource-update', handleResourceUpdate);
      socket.off('resource-create', handleResourceCreate);
      socket.off('resource-delete', handleResourceDelete);
      socket.off('status-change', handleStatusChange);
    };
  }, [socket, isConnected]);

  return {
    beds,
    loading,
    error,
    stats,
    params,
    setParams,
    fetchBeds,
    fetchStats,
    createBed,
    updateBed,
    updateBedStatus,
    deleteBed,
  };
};
