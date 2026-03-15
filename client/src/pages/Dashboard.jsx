import { useMemo } from 'react';
import Navbar from '../components/common/Navbar';
import AlertBanner from '../components/common/AlertBanner';
import StatCard from '../components/common/StatCard';
import WardOccupancyChart from '../components/dashboard/WardOccupancyChart';
import EquipmentSummary from '../components/dashboard/EquipmentSummary';
import OccupancyGauge from '../components/dashboard/OccupancyGauge';
import ActivityPreview from '../components/dashboard/ActivityPreview';
import { useBeds } from '../hooks/useBeds';
import { useEquipment } from '../hooks/useEquipment';
import { useRooms } from '../hooks/useRooms';
import './Dashboard.css';

const Dashboard = () => {
  const { beds } = useBeds();
  const { equipment } = useEquipment();
  const { rooms } = useRooms();

  const stats = useMemo(() => {
    const availableBeds = beds.filter(bed => bed.status === 'available').length;
    const occupiedBeds = beds.filter(bed => bed.status === 'occupied').length;
    const availableEquipment = equipment.filter(eq => eq.status === 'available').length;
    const criticalEquipment = equipment.filter(eq => eq.status === 'critical').length;
    const availableRooms = rooms.filter(room => room.status === 'available').length;

    return {
      availableBeds,
      occupiedBeds,
      availableEquipment,
      criticalEquipment,
      availableRooms
    };
  }, [beds, equipment, rooms]);

  return (
    <div className="dashboard-page">
      <Navbar />
      <div className="dashboard-container">
        <AlertBanner />
        
        <div className="stats-row">
          <StatCard
            icon="🛏️"
            label="Available Beds"
            value={stats.availableBeds}
            subtitle={`${beds.length} total`}
            borderColor="var(--color-success)"
          />
          <StatCard
            icon="👥"
            label="Occupied Beds"
            value={stats.occupiedBeds}
            subtitle={`${Math.round((stats.occupiedBeds / beds.length) * 100) || 0}% occupancy`}
            borderColor="var(--color-warning)"
          />
          <StatCard
            icon="🏥"
            label="Available Equipment"
            value={stats.availableEquipment}
            subtitle={`${equipment.length} total`}
            borderColor="var(--color-primary)"
          />
          <StatCard
            icon="⚠️"
            label="Critical Equipment"
            value={stats.criticalEquipment}
            subtitle="Needs attention"
            borderColor="var(--color-danger)"
          />
          <StatCard
            icon="🚪"
            label="Available Rooms"
            value={stats.availableRooms}
            subtitle={`${rooms.length} total`}
            borderColor="var(--color-secondary)"
          />
        </div>

        <div className="dashboard-grid">
          <div className="chart-section">
            <WardOccupancyChart />
          </div>
          <div className="summary-section">
            <EquipmentSummary />
          </div>
        </div>

        <div className="gauge-section">
          <OccupancyGauge />
        </div>

        <div className="activity-section">
          <ActivityPreview />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
