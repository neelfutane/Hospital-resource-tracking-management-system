import EquipmentCard from './EquipmentCard';
import Loader from '../common/Loader';
import './EquipmentList.css';

const EquipmentList = ({ equipment, loading }) => {
  if (loading) {
    return (
      <div className="equipment-list-container">
        <Loader size="large" />
      </div>
    );
  }

  if (equipment.length === 0) {
    return (
      <div className="equipment-list-container">
        <div className="empty-state">
          <div className="empty-icon">🏥</div>
          <h3>No equipment found</h3>
          <p>Try adjusting your filters or check back later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="equipment-list-container">
      <div className="equipment-grid">
        {equipment.map((item) => (
          <EquipmentCard 
            key={item._id} 
            equipment={item}
          />
        ))}
      </div>
    </div>
  );
};

export default EquipmentList;
