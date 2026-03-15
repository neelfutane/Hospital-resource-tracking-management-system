import { useMemo } from 'react';
import RoomCard from './RoomCard';
import Loader from '../common/Loader';
import './RoomGrid.css';

const RoomGrid = ({ rooms, loading }) => {
  const roomsByType = useMemo(() => {
    const grouped = {};
    rooms.forEach(room => {
      if (!grouped[room.type]) {
        grouped[room.type] = [];
      }
      grouped[room.type].push(room);
    });
    return grouped;
  }, [rooms]);

  if (loading) {
    return (
      <div className="room-grid-container">
        <Loader size="large" />
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="room-grid-container">
        <div className="empty-state">
          <div className="empty-icon">🚪</div>
          <h3>No rooms found</h3>
          <p>Try adjusting your filters or check back later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="room-grid-container">
      {Object.entries(roomsByType).map(([type, roomList]) => (
        <div key={type} className="room-section">
          <h3 className="room-section-title">
            {type} ({roomList.length})
          </h3>
          <div className="room-grid">
            {roomList.map((room) => (
              <RoomCard 
                key={room._id} 
                room={room}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoomGrid;
