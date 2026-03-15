import StatusBadge from '../common/StatusBadge';
import './RoomCard.css';

const RoomCard = ({ room }) => {
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
    <div className="room-card">
      <div className="room-header">
        <div className="room-info">
          <span className="room-id">{room.roomId}</span>
          <span className="room-type">{room.type}</span>
        </div>
        <StatusBadge status={room.status} />
      </div>
      
      <div className="room-details">
        <div className="room-floor">
          <span className="floor-label">Floor:</span>
          <span className="floor-number">{room.floor}</span>
        </div>
      </div>
      
      <div className="room-footer">
        <span className="last-updated">
          Updated: {formatTime(room.lastUpdated)}
        </span>
      </div>
    </div>
  );
};

export default RoomCard;
