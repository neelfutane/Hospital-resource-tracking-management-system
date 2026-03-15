import { useState, useEffect } from 'react';
import { equipmentService } from '../services/equipmentService';
import { useSocketEvent } from './useSocket';
import { SOCKET_EVENTS } from '../constants/socketEvents';

export const useEquipment = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch equipment on mount
  const fetchEquipment = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await equipmentService.getEquipment(filters);
      setEquipment(data.data || data);
    } catch (err) {
      setError(err.message || 'Failed to fetch equipment');
    } finally {
      setLoading(false);
    }
  };

  // Create new equipment
  const createEquipment = async (equipmentData) => {
    try {
      const newEquipment = await equipmentService.createEquipment(equipmentData);
      return newEquipment;
    } catch (err) {
      setError(err.message || 'Failed to create equipment');
      throw err;
    }
  };

  // Update equipment
  const updateEquipment = async (id, data) => {
    try {
      const updatedEquipment = await equipmentService.updateEquipment(id, data);
      return updatedEquipment;
    } catch (err) {
      setError(err.message || 'Failed to update equipment');
      throw err;
    }
  };

  // Filter equipment by type
  const filterByType = (type) => {
    return equipment.filter(item => item.type === type);
  };

  // Filter equipment by location
  const filterByLocation = (location) => {
    return equipment.filter(item => item.location === location);
  };

  // Listen for real-time updates
  useSocketEvent(SOCKET_EVENTS.EQUIPMENT_UPDATED, (updatedEquipment) => {
    setEquipment(prevEquipment => 
      prevEquipment.map(item => 
        item._id === updatedEquipment._id ? updatedEquipment : item
      )
    );
  });

  useEffect(() => {
    fetchEquipment();
  }, []);

  return {
    equipment,
    loading,
    error,
    createEquipment,
    updateEquipment,
    filterByType,
    filterByLocation,
    fetchEquipment,
    refetch: fetchEquipment
  };
};
