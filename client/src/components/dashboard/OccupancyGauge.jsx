import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useBeds } from '../../hooks/useBeds';
import './OccupancyGauge.css';

const OccupancyGauge = () => {
  const { beds } = useBeds();

  const gaugeData = useMemo(() => {
    const totalBeds = beds.length;
    const occupiedBeds = beds.filter(bed => bed.status === 'occupied').length;
    const occupancyPercentage = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
    
    return {
      occupied: occupiedBeds,
      available: totalBeds - occupiedBeds,
      percentage: occupancyPercentage
    };
  }, [beds]);

  const getGaugeColor = (percentage) => {
    if (percentage < 65) return '#10b981'; // green
    if (percentage < 85) return '#f59e0b'; // orange
    return '#ef4444'; // red
  };

  const pieData = [
    { name: 'occupied', value: gaugeData.occupied },
    { name: 'available', value: gaugeData.available }
  ];

  return (
    <div className="occupancy-gauge">
      <h3 className="gauge-title">Hospital Occupancy</h3>
      <div className="gauge-container">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              startAngle={180}
              endAngle={0}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={0}
              dataKey="value"
            >
              <Cell fill={getGaugeColor(gaugeData.percentage)} />
              <Cell fill="#e2e8f0" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="gauge-center">
          <div 
            className="gauge-percentage"
            style={{ color: getGaugeColor(gaugeData.percentage) }}
          >
            {gaugeData.percentage}%
          </div>
          <div className="gauge-label">Occupied</div>
        </div>
      </div>
      <div className="gauge-details">
        <div className="detail-item">
          <span className="detail-label">Total Beds:</span>
          <span className="detail-value">{gaugeData.occupied + gaugeData.available}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Occupied:</span>
          <span className="detail-value">{gaugeData.occupied}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Available:</span>
          <span className="detail-value">{gaugeData.available}</span>
        </div>
      </div>
    </div>
  );
};

export default OccupancyGauge;
