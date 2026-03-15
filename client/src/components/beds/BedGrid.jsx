import BedCard from './BedCard';
import Loader from '../common/Loader';
import './BedGrid.css';

const BedGrid = ({ beds, loading, onUpdate }) => {
  if (loading) {
    return (
      <div className="bed-grid-container">
        <Loader size="large" />
      </div>
    );
  }

  if (beds.length === 0) {
    return (
      <div className="bed-grid-container">
        <div className="empty-state">
          <div className="empty-icon">🛏️</div>
          <h3>No beds found</h3>
          <p>Try adjusting your filters or check back later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bed-grid-container">
      <div className="bed-grid">
        {beds.map((bed) => (
          <BedCard 
            key={bed._id} 
            bed={bed} 
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </div>
  );
};

export default BedGrid;
