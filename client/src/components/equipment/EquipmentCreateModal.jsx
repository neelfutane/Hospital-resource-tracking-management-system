import { useState } from 'react';
import Modal from '../common/Modal';
import { EQUIPMENT_TYPES } from '../../constants/equipmentTypes';
import { WARDS } from '../../constants/wards';
import './EquipmentCreateModal.css';

const EquipmentCreateModal = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    type: EQUIPMENT_TYPES[0],
    serialId: '',
    location: WARDS[0],
    status: 'available'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onCreate(formData);
      setFormData({
        type: EQUIPMENT_TYPES[0],
        serialId: '',
        location: WARDS[0],
        status: 'available'
      });
      onClose();
    } catch (error) {
      console.error('Failed to create equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Add New Equipment"
      isOpen={isOpen}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="equipment-create-form">
        <div className="form-section">
          <label className="form-label" htmlFor="type">
            Equipment Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="form-input"
            disabled={loading}
          >
            {EQUIPMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="form-section">
          <label className="form-label" htmlFor="serialId">
            Serial ID
          </label>
          <input
            id="serialId"
            type="text"
            name="serialId"
            value={formData.serialId}
            onChange={handleChange}
            placeholder="e.g., VENT-001, MRI-002"
            className="form-input"
            required
            disabled={loading}
          />
        </div>

        <div className="form-section">
          <label className="form-label" htmlFor="location">
            Location
          </label>
          <select
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="form-input"
            disabled={loading}
          >
            {WARDS.map((ward) => (
              <option key={ward} value={ward}>
                {ward}
              </option>
            ))}
          </select>
        </div>

        <div className="form-section">
          <label className="form-label" htmlFor="status">
            Initial Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="form-input"
            disabled={loading}
          >
            <option value="available">Available</option>
            <option value="in-use">In Use</option>
            <option value="maintenance">Maintenance</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Add Equipment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EquipmentCreateModal;
