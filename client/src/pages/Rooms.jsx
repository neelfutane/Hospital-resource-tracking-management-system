import { useState, useMemo } from 'react';
import Navbar from '../components/common/Navbar';
import RoomGrid from '../components/rooms/RoomGrid';
import { useRooms } from '../hooks/useRooms';
import clsx from 'clsx';
import './Rooms.css';

const Rooms = () => {
  const { rooms, loading, updateRoom } = useRooms();
  const [selectedType, setSelectedType] = useState(null);

  const filteredRooms = useMemo(() => {
    if (!selectedType) return rooms;
    return rooms.filter(room => room.type === selectedType);
  }, [rooms, selectedType]);

  const roomTypes = useMemo(() => {
    const types = [...new Set(rooms.map(room => room.type))];
    return types.sort();
  }, [rooms]);

  const stats = useMemo(() => {
    const available = filteredRooms.filter(room => room.status === 'available').length;
    const occupied = filteredRooms.filter(room => room.status === 'occupied').length;
    const cleaning = filteredRooms.filter(room => room.status === 'cleaning').length;

    return {
      total: filteredRooms.length,
      available,
      occupied,
      cleaning
    };
  }, [filteredRooms]);

  const handleRoomUpdate = async (updatedRoom) => {
    await updateRoom(updatedRoom._id, updatedRoom);
  };

  return (
    <div className="rooms-page">
      <Navbar />
      <div className="rooms-container">
        <div className="rooms-header">
          <h1 className="page-title">Room Management</h1>
          <div className="rooms-stats">
            <div className="stat-badge available">
              <span className="stat-number">{stats.available}</span>
              <span className="stat-label">Available</span>
            </div>
            <div className="stat-badge occupied">
              <span className="stat-number">{stats.occupied}</span>
              <span className="stat-label">Occupied</span>
            </div>
            <div className="stat-badge cleaning">
              <span className="stat-number">{stats.cleaning}</span>
              <span className="stat-label">Cleaning</span>
            </div>
            <div className="stat-badge total">
              <span className="stat-number">{stats.total}</span>
              <span className="stat-label">Total</span>
            </div>
          </div>
        </div>

        <div className="room-filters">
          <div className="filter-label">Filter by Room Type:</div>
          <div className="type-tabs">
            <button
              className={clsx('type-tab', { active: selectedType === null })}
              onClick={() => setSelectedType(null)}
            >
              All Types
            </button>
            {roomTypes.map((type) => (
              <button
                key={type}
                className={clsx('type-tab', { active: selectedType === type })}
                onClick={() => setSelectedType(type)}
              >
                {type} ({rooms.filter(room => room.type === type).length})
              </button>
            ))}
          </div>
        </div>

        <RoomGrid
          rooms={filteredRooms}
          loading={loading}
          onUpdate={handleRoomUpdate}
        />
      </div>
    </div>
  );
};

export default Rooms;
