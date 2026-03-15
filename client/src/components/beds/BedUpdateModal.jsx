import { useState } from 'react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import './BedUpdateModal.css';
import clsx from 'clsx';
const BedUpdateModal = ({ isOpen, onClose, bed, onUpdate }) => {
  const [status, setStatus] = useState(bed.status);
  const [patientId, setPatientId] = useState(bed.patientId || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = { status };
      if (status === 'occupied' && patientId) {
        updateData.patientId = patientId;
      } else if (status !== 'occupied') {
        updateData.patientId = null;
      }

      await onUpdate(updateData);
    } catch (error) {
      console.error('Failed to update bed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    if (newStatus !== 'occupied') {
      setPatientId('');
    }
  };

  return (
    <Modal
      title={`Update Bed ${bed.number} - ${bed.ward}`}
      isOpen={isOpen}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="bed-update-form">
        <div className="form-section">
          <label className="form-label">Current Status:</label>
          <StatusBadge status={bed.status} />
        </div>

        <div className="form-section">
          <label className="form-label">New Status:</label>
          <div className="status-options">
            {['available', 'occupied', 'maintenance'].map((statusOption) => (
              <button
                key={statusOption}
                type="button"
                className={clsx('status-option-btn', { active: status === statusOption })}
                onClick={() => handleStatusChange(statusOption)}
              >
                <StatusBadge status={statusOption} />
              </button>
            ))}
          </div>
        </div>

        {status === 'occupied' && (
          <div className="form-section">
            <label className="form-label" htmlFor="patientId">
              Patient ID:
            </label>
            <input
              id="patientId"
              type="text"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="Enter patient ID"
              className="form-input"
              required
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
            {loading ? 'Updating...' : 'Update Bed'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default BedUpdateModal;
