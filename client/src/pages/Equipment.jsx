import { useState, useMemo } from 'react';
import Navbar from '../components/common/Navbar';
import EquipmentFilters from '../components/equipment/EquipmentFilters';
import EquipmentList from '../components/equipment/EquipmentList';
import EquipmentCreateModal from '../components/equipment/EquipmentCreateModal';
import StatusBadge from '../components/common/StatusBadge';
import { useEquipment } from '../hooks/useEquipment';
import { useAuth } from '../hooks/useAuth';
import './Equipment.css';

const Equipment = () => {
  const { equipment, loading, updateEquipment, createEquipment } = useEquipment();
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredEquipment = useMemo(() => {
    let filtered = equipment;

    // Filter by type
    if (selectedType) {
      filtered = filtered.filter(item => item.type === selectedType);
    }

    // Filter by location
    if (selectedLocation) {
      filtered = filtered.filter(item => item.location === selectedLocation);
    }

    return filtered;
  }, [equipment, selectedType, selectedLocation]);

  const stats = useMemo(() => {
    const available = filteredEquipment.filter(item => item.status === 'available').length;
    const inUse = filteredEquipment.filter(item => item.status === 'in-use').length;
    const maintenance = filteredEquipment.filter(item => item.status === 'maintenance').length;
    const critical = filteredEquipment.filter(item => item.status === 'critical').length;

    return {
      total: filteredEquipment.length,
      available,
      inUse,
      maintenance,
      critical
    };
  }, [filteredEquipment]);

  const handleEquipmentUpdate = async (updatedEquipment) => {
    await updateEquipment(updatedEquipment._id, updatedEquipment);
  };

  const handleEquipmentCreate = async (equipmentData) => {
    await createEquipment(equipmentData);
  };

  const canAddEquipment = user?.role === 'admin';

  return (
    <div className="equipment-page">
      <Navbar />
      <div className="equipment-container">
        <div className="equipment-header">
          <div className="equipment-title-section">
            <h1 className="page-title">Equipment Management</h1>
            {canAddEquipment && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="add-equipment-btn"
              >
                + Add Equipment
              </button>
            )}
          </div>
          <div className="equipment-stats">
            <div className="stat-group">
              <StatusBadge status="available" />
              <span className="stat-count">{stats.available}</span>
            </div>
            <div className="stat-group">
              <StatusBadge status="in-use" />
              <span className="stat-count">{stats.inUse}</span>
            </div>
            <div className="stat-group">
              <StatusBadge status="maintenance" />
              <span className="stat-count">{stats.maintenance}</span>
            </div>
            <div className="stat-group">
              <StatusBadge status="critical" />
              <span className="stat-count">{stats.critical}</span>
            </div>
            <div className="total-count">
              <span className="total-label">Total:</span>
              <span className="total-number">{stats.total}</span>
            </div>
          </div>
        </div>

        <EquipmentFilters
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          selectedLocation={selectedLocation}
          onLocationChange={setSelectedLocation}
        />

        <EquipmentList 
          equipment={filteredEquipment} 
          loading={loading}
        />
      </div>

      {isCreateModalOpen && (
        <EquipmentCreateModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleEquipmentCreate}
        />
      )}
    </div>
  );
};

export default Equipment;
