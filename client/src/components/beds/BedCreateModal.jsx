import { useState } from 'react';
import Modal from '../common/Modal';
import { WARDS } from '../../constants/wards';
import './BedCreateModal.css';

const BedCreateModal = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    number: '',
    ward: WARDS[0],
    status: 'available',
    patientId: ''
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
        number: '',
        ward: WARDS[0],
        status: 'available',
        patientId: ''
      });
      onClose();
    } catch (error) {
      console.error('Failed to create bed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Add New Bed"
      isOpen={isOpen}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="bed-create-form">
        <div className="form-section">
          <label className="form-label" htmlFor="number">
            Bed Number
          </label>
          <input
            id="number"
            type="text"
            name="number"
            value={formData.number}
            onChange={handleChange}
            placeholder="e.g., 101, A1, ICU-01"
            className="form-input"
            required
            disabled={loading}
          />
        </div>

        <div className="form-section">
          <label className="form-label" htmlFor="ward">
            Ward
          </label>
          <select
            id="ward"
            name="ward"
            value={formData.ward}
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
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        {formData.status === 'occupied' && (
          <div className="form-section">
            <label className="form-label" htmlFor="patientId">
              Patient ID
            </label>
            <input
              id="patientId"
              type="text"
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
              placeholder="Enter patient ID"
              className="form-input"
              required
              disabled={loading}
            />
          </div>
        )}

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
            {loading ? 'Creating...' : 'Add Bed'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default BedCreateModal;
