import { EQUIPMENT_TYPES } from '../../constants/equipmentTypes';
import { WARDS } from '../../constants/wards';
import clsx from 'clsx';
import './EquipmentFilters.css';

const EquipmentFilters = ({ selectedType, onTypeChange, selectedLocation, onLocationChange }) => {
  return (
    <div className="equipment-filters">
      <div className="filter-section">
        <div className="filter-label">Filter by Type:</div>
        <div className="type-buttons">
          <button
            className={clsx('filter-btn', { active: selectedType === null })}
            onClick={() => onTypeChange(null)}
          >
            All Types
          </button>
          {EQUIPMENT_TYPES.map((type) => (
            <button
              key={type}
              className={clsx('filter-btn', { active: selectedType === type })}
              onClick={() => onTypeChange(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-label">Filter by Location:</div>
        <select
          value={selectedLocation || ''}
          onChange={(e) => onLocationChange(e.target.value || null)}
          className="location-select"
        >
          <option value="">All Locations</option>
          {WARDS.map((ward) => (
            <option key={ward} value={ward}>
              {ward}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default EquipmentFilters;
