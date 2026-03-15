import { useMemo } from 'react';
import { useEquipment } from '../../hooks/useEquipment';
import { EQUIPMENT_TYPES } from '../../constants/equipmentTypes';
import MiniBar from '../common/MiniBar';
import './EquipmentSummary.css';

const EquipmentSummary = () => {
  const { equipment } = useEquipment();

  const equipmentStats = useMemo(() => {
    return EQUIPMENT_TYPES.map(type => {
      const typeEquipment = equipment.filter(item => item.type === type);
      const available = typeEquipment.filter(item => item.status === 'available').length;
      const total = typeEquipment.length;
      
      return {
        type,
        available,
        total,
        percentage: total > 0 ? (available / total) * 100 : 0
      };
    });
  }, [equipment]);

  return (
    <div className="equipment-summary">
      <h3 className="summary-title">Equipment Availability</h3>
      <div className="equipment-stats">
        {equipmentStats.map((stat) => (
          <div key={stat.type} className="equipment-stat">
            <div className="stat-header">
              <span className="stat-type">{stat.type}</span>
              <span className="stat-count">
                {stat.available}/{stat.total}
              </span>
            </div>
            <MiniBar value={stat.available} max={stat.total} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default EquipmentSummary;
