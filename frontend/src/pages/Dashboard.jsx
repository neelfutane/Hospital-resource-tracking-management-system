import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useBeds } from '../hooks/useBeds';
import { useRooms } from '../hooks/useRooms';
import { useEquipment } from '../hooks/useEquipment';
import { dashboardApi } from '../api/dashboardApi';
import { alertsApi } from '../api/alertsApi';
import { 
  Bed, 
  Home, 
  Activity, 
  Users, 
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';
import { getStatusColor } from '../utils/statusColors';
import { formatRelativeTime } from '../utils/formatDate';
import StatusBadge from '../components/common/StatusBadge';

const Dashboard = () => {
  const { user } = useAuth();
  const { isConnected } = useSocket();
  const { beds, loading: bedsLoading, fetchBeds } = useBeds();
  const { rooms, loading: roomsLoading, fetchRooms } = useRooms();
  const { equipment, loading: equipmentLoading, fetchEquipment } = useEquipment();
  const [stats, setStats] = useState({
    beds: { total: 0, available: 0, occupied: 0, maintenance: 0 },
    rooms: { total: 0, available: 0, occupied: 0, maintenance: 0 },
    equipment: { total: 0, available: 0, occupied: 0, maintenance: 0 },
    alerts: { total: 0, critical: 0, high: 0, medium: 0 }
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const fetchDashboardData = async () => {
    try {
      const dbResponse = await dashboardApi.getStats();
      if (dbResponse.success) {
        setRecentActivity(dbResponse.data.recentActivity || []);
      }

      const alertsResponse = await alertsApi.getAll({ isActive: 'true' });
      if (alertsResponse.success) {
        setAlerts(alertsResponse.data.alerts || alertsResponse.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    // Calculate stats directly from the lists since they are already fetched
    setStats(prev => ({
      ...prev,
      beds: {
        total: beds.length,
        available: beds.filter(b => b.status === 'AVAILABLE').length,
        occupied: beds.filter(b => b.status === 'OCCUPIED').length,
        maintenance: beds.filter(b => b.status === 'MAINTENANCE').length,
      },
      rooms: {
        total: rooms.length,
        available: rooms.filter(r => r.status === 'AVAILABLE').length,
        occupied: rooms.filter(r => r.status === 'OCCUPIED').length,
        maintenance: rooms.filter(r => r.status === 'MAINTENANCE').length,
      },
      equipment: {
        total: equipment.length,
        available: equipment.filter(e => e.status === 'AVAILABLE').length,
        occupied: equipment.filter(e => e.status === 'OCCUPIED' || e.status === 'IN_USE').length,
        maintenance: equipment.filter(e => e.status === 'MAINTENANCE').length,
      },
      alerts: {
        total: alerts.length,
        critical: alerts.filter(a => a.priority === 'CRITICAL').length,
        high: alerts.filter(a => a.priority === 'HIGH').length,
        medium: alerts.filter(a => a.priority === 'MEDIUM').length,
      }
    }));
  }, [beds, rooms, equipment, alerts]);



  const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      {trend && (
        <div className="mt-2 flex items-center text-sm">
          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
          <span className="text-green-600">{trend}</span>
        </div>
      )}
    </div>
  );

  const ActivityItem = ({ activity }) => {
    // Generate derived values since auditLog uses standard schema format
    const rName = activity.resourceName || `${activity.resourceType} ${activity.resourceId?.substring(0, 8) || ''}`;
    let detailText = activity.details || '';
    if (!detailText) {
       if (activity.action === 'UPDATE' && activity.newValue?.status) {
         detailText = `Status: ${activity.newValue.status}`;
       } else {
         detailText = `${activity.action} operation on ${activity.resourceType}`;
       }
    }
    const userName = activity.user ? `${activity.user.firstName} ${activity.user.lastName}` : (activity.userName || 'System');

    return (
    <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
      <div className={`p-2 rounded-full ${
        activity.action === 'CREATE' ? 'bg-green-100' :
        activity.action === 'UPDATE' ? 'bg-blue-100' :
        'bg-red-100'
      }`}>
        {
          activity.action === 'CREATE' ? <CheckCircle className="h-4 w-4 text-green-600" /> :
          activity.action === 'UPDATE' ? <Activity className="h-4 w-4 text-blue-600" /> :
          <AlertTriangle className="h-4 w-4 text-red-600" />
        }
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">
          {rName}
        </p>
        <p className="text-xs text-gray-500">
          {detailText} by {userName}
        </p>
      </div>
      <div className="text-xs text-gray-400 whitespace-nowrap">
        {formatRelativeTime(activity.timestamp || activity.createdAt)}
      </div>
    </div>
  )};

  const AlertItem = ({ alert }) => (
    <div className={`p-3 rounded-lg border-l-4 ${
      alert.priority === 'CRITICAL' ? 'bg-red-50 border-red-400' :
      alert.priority === 'HIGH' ? 'bg-orange-50 border-orange-400' :
      'bg-yellow-50 border-yellow-400'
    }`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">
            {alert.title}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {alert.message}
          </p>
          <div className="flex items-center mt-2 text-xs text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            {formatRelativeTime(alert.timestamp || alert.createdAt)}
            {alert.department && (
              <>
                <span className="mx-2">•</span>
                {alert.department}
              </>
            )}
          </div>
        </div>
        <div className={`px-2 py-1 text-xs font-medium rounded-full ${
          alert.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' :
          alert.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {alert.priority}
        </div>
      </div>
    </div>
  );

  if (bedsLoading && roomsLoading && equipmentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">
                Welcome back, {user?.firstName} {user?.lastName}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Beds"
            value={stats.beds.total}
            subtitle={`${stats.beds.available} available`}
            icon={Bed}
            color="bg-blue-500"
            trend="85% occupancy"
          />
          <StatCard
            title="Total Rooms"
            value={stats.rooms.total}
            subtitle={`${stats.rooms.available} available`}
            icon={Home}
            color="bg-green-500"
            trend="70% occupancy"
          />
          <StatCard
            title="Equipment"
            value={stats.equipment.total}
            subtitle={`${stats.equipment.available} available`}
            icon={Activity}
            color="bg-purple-500"
            trend="90% operational"
          />
          <StatCard
            title="Active Alerts"
            value={stats.alerts.total}
            subtitle={`${stats.alerts.critical} critical`}
            icon={AlertTriangle}
            color="bg-red-500"
            trend="2 new today"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Beds */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Beds</h2>
              <button className="text-sm text-primary-600 hover:text-primary-500">
                View all
              </button>
            </div>
            <div className="space-y-3">
              {beds.slice(0, 5).map((bed) => (
                <div key={bed.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      bed.status === 'AVAILABLE' ? 'bg-green-100' :
                      bed.status === 'OCCUPIED' ? 'bg-red-100' :
                      bed.status === 'MAINTENANCE' ? 'bg-yellow-100' :
                      'bg-gray-100'
                    }`}>
                      <Bed className={`h-4 w-4 ${
                        bed.status === 'AVAILABLE' ? 'text-green-600' :
                        bed.status === 'OCCUPIED' ? 'text-red-600' :
                        bed.status === 'MAINTENANCE' ? 'text-yellow-600' :
                        'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{bed.bedNumber}</p>
                      <p className="text-xs text-gray-500">{bed.department}</p>
                    </div>
                  </div>
                  <StatusBadge status={bed.status} size="sm" />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                <button className="text-sm text-primary-600 hover:text-primary-500">
                  View all
                </button>
              </div>
              <div className="space-y-2">
                {recentActivity.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            </div>
          </div>

          {/* Active Alerts */}
          <div>
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Active Alerts</h2>
                <button className="text-sm text-primary-600 hover:text-primary-500">
                  View all
                </button>
              </div>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <AlertItem key={alert.id} alert={alert} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
