import { useState, useEffect } from 'react';
import { bedService } from '../services/bedService';
import { useSocketEvent } from './useSocket';
import { SOCKET_EVENTS } from '../constants/socketEvents';

export const useBeds = () => {
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch beds on mount
  const fetchBeds = async (wardFilter = null) => {
    try {
      setLoading(true);
      setError(null);
      const data = await bedService.getBeds(wardFilter);
      setBeds(data.data || data);
    } catch (err) {
      setError(err.message || 'Failed to fetch beds');
    } finally {
      setLoading(false);
    }
  };

  // Create new bed
  const createBed = async (bedData) => {
    try {
      const newBed = await bedService.createBed(bedData);
      return newBed;
    } catch (err) {
      setError(err.message || 'Failed to create bed');
      throw err;
    }
  };

  // Update bed status
  const updateBed = async (id, data) => {
    try {
      const updatedBed = await bedService.updateBedStatus(id, data);
      return updatedBed;
    } catch (err) {
      setError(err.message || 'Failed to update bed');
      throw err;
    }
  };

  // Filter beds by ward
  const filterByWard = (ward) => {
    return beds.filter(bed => bed.ward === ward);
  };

  // Listen for real-time updates
  useSocketEvent(SOCKET_EVENTS.BED_UPDATED, (updatedBed) => {
    setBeds(prevBeds => 
      prevBeds.map(bed => 
        bed._id === updatedBed._id ? updatedBed : bed
      )
    );
  });

  useEffect(() => {
    fetchBeds();
  }, []);

  return {
    beds,
    loading,
    error,
    createBed,
    updateBed,
    filterByWard,
    fetchBeds,
    refetch: fetchBeds
  };
};
