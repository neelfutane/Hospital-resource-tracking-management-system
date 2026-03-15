import StatusBadge from '../common/StatusBadge';
import './EquipmentCard.css';

const EquipmentCard = ({ equipment }) => {
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
    <div className="equipment-card">
      <div className="equipment-header">
        <div className="equipment-info">
          <span className="equipment-type">{equipment.type}</span>
          <span className="equipment-serial">ID: {equipment.serialId}</span>
        </div>
        <StatusBadge status={equipment.status} />
      </div>
      
      <div className="equipment-location">
        <span className="location-label">Location:</span>
        <span className="location-value">{equipment.location}</span>
      </div>
      
      <div className="equipment-footer">
        <span className="last-updated">
          Updated: {formatTime(equipment.lastUpdated)}
        </span>
      </div>
    </div>
  );
};

export default EquipmentCard;
