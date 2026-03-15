import { WARDS } from '../../constants/wards';
import './BedFilters.css';
import clsx from 'clsx';
const BedFilters = ({ selectedWard, onWardChange, searchQuery, onSearchChange, resultCount }) => {
  return (
    <div className="bed-filters">
      <div className="filter-section">
        <div className="filter-label">Filter by Ward:</div>
        <div className="ward-buttons">
          <button
            className={clsx('ward-btn', { active: selectedWard === null })}
            onClick={() => onWardChange(null)}
          >
            All Wards
          </button>
          {WARDS.map((ward) => (
            <button
              key={ward}
              className={clsx('ward-btn', { active: selectedWard === ward })}
              onClick={() => onWardChange(ward)}
            >
              {ward}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search bed number or patient ID..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="filter-section">
        <div className="results-count">
          {resultCount} bed{resultCount !== 1 ? 's' : ''} found
        </div>
      </div>
    </div>
  );
};

export default BedFilters;
