import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useBeds } from '../../hooks/useBeds';
import { WARDS } from '../../constants/wards';
import './WardOccupancyChart.css';

const WardOccupancyChart = () => {
  const { beds } = useBeds();

  const chartData = useMemo(() => {
    return WARDS.map(ward => {
      const wardBeds = beds.filter(bed => bed.ward === ward);
      const occupied = wardBeds.filter(bed => bed.status === 'occupied').length;
      const available = wardBeds.filter(bed => bed.status === 'available').length;
      
      return {
        ward,
        occupied,
        available,
        total: wardBeds.length
      };
    });
  }, [beds]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="chart-tooltip">
          <div className="tooltip-title">{data.ward}</div>
          <div className="tooltip-row">
            <span className="tooltip-label">Occupied:</span>
            <span className="tooltip-value">{data.occupied}</span>
          </div>
          <div className="tooltip-row">
            <span className="tooltip-label">Available:</span>
            <span className="tooltip-value">{data.available}</span>
          </div>
          <div className="tooltip-row">
            <span className="tooltip-label">Total:</span>
            <span className="tooltip-value">{data.total}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="ward-occupancy-chart">
      <h3 className="chart-title">Ward Occupancy</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="ward" 
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={{ stroke: '#e2e8f0' }}
          />
          <YAxis 
            tick={{ fill: '#64748b', fontSize: 12 }}
            axisLine={{ stroke: '#e2e8f0' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="occupied" fill="#f59e0b" name="Occupied" />
          <Bar dataKey="available" fill="#10b981" name="Available" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WardOccupancyChart;
