import { useState, useMemo } from 'react';
import Navbar from '../components/common/Navbar';
import BedFilters from '../components/beds/BedFilters';
import BedGrid from '../components/beds/BedGrid';
import BedCreateModal from '../components/beds/BedCreateModal';
import { useBeds } from '../hooks/useBeds';
import { useAuth } from '../hooks/useAuth';
import './Beds.css';

const Beds = () => {
  const { beds, loading, updateBed, createBed } = useBeds();
  const { user } = useAuth();
  const [selectedWard, setSelectedWard] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredBeds = useMemo(() => {
    let filtered = beds;

    // Filter by ward
    if (selectedWard) {
      filtered = filtered.filter(bed => bed.ward === selectedWard);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(bed => 
        bed.number.toString().includes(query) ||
        (bed.patientId && bed.patientId.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [beds, selectedWard, searchQuery]);

  const stats = useMemo(() => {
    const available = filteredBeds.filter(bed => bed.status === 'available').length;
    const occupied = filteredBeds.filter(bed => bed.status === 'occupied').length;
    const maintenance = filteredBeds.filter(bed => bed.status === 'maintenance').length;

    return {
      total: filteredBeds.length,
      available,
      occupied,
      maintenance
    };
  }, [filteredBeds]);

  const handleBedUpdate = async (updatedBed) => {
    await updateBed(updatedBed._id, updatedBed);
  };

  const handleBedCreate = async (bedData) => {
    await createBed(bedData);
  };

  const canAddBeds = user?.role === 'admin';

  return (
    <div className="beds-page">
      <Navbar />
      <div className="beds-container">
        <div className="beds-header">
          <div className="beds-title-section">
            <h1 className="page-title">Bed Management</h1>
            {canAddBeds && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="add-bed-btn"
              >
                + Add Bed
              </button>
            )}
          </div>
          <div className="beds-stats">
            <div className="stat-badge available">
              <span className="stat-number">{stats.available}</span>
              <span className="stat-label">Available</span>
            </div>
            <div className="stat-badge occupied">
              <span className="stat-number">{stats.occupied}</span>
              <span className="stat-label">Occupied</span>
            </div>
            <div className="stat-badge maintenance">
              <span className="stat-number">{stats.maintenance}</span>
              <span className="stat-label">Maintenance</span>
            </div>
            <div className="stat-badge total">
              <span className="stat-number">{stats.total}</span>
              <span className="stat-label">Total</span>
            </div>
          </div>
        </div>

        <BedFilters
          selectedWard={selectedWard}
          onWardChange={setSelectedWard}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          resultCount={filteredBeds.length}
        />

        <BedGrid
          beds={filteredBeds}
          loading={loading}
          onUpdate={handleBedUpdate}
        />
      </div>

      {isCreateModalOpen && (
        <BedCreateModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleBedCreate}
        />
      )}
    </div>
  );
};

export default Beds;
