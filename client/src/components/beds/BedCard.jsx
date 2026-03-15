import { useState } from 'react';
import StatusBadge from '../common/StatusBadge';
import BedUpdateModal from './BedUpdateModal';
import './BedCard.css';

const BedCard = ({ bed, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  const handleUpdate = (updatedBed) => {
    onUpdate(updatedBed);
    setIsModalOpen(false);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <div className="bed-card" onClick={handleCardClick}>
        <div className="bed-header">
          <div className="bed-info">
            <span className="bed-number">Bed {bed.number}</span>
            <span className="bed-ward">{bed.ward}</span>
          </div>
          <StatusBadge status={bed.status} />
        </div>
        
        {bed.patientId && (
          <div className="bed-patient">
            <span className="patient-label">Patient:</span>
            <span className="patient-id">{bed.patientId}</span>
          </div>
        )}
        
        <div className="bed-footer">
          <span className="last-updated">
            Updated: {formatTime(bed.lastUpdated)}
          </span>
        </div>
      </div>

      <BedUpdateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        bed={bed}
        onUpdate={handleUpdate}
      />
    </>
  );
};

export default BedCard;
