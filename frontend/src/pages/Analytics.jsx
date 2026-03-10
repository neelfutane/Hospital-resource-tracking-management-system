import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Activity,
  Users,
  Bed,
  Home,
  Wrench,
  Calendar,
  Download
} from 'lucide-react';
import { formatDate } from '../utils/formatDate';
import { DEPARTMENTS } from '../utils/constants';

const Analytics = () => {
  const { user } = useAuth();
  const { isConnected } = useSocket();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d'); // 1d, 7d, 30d, 90d
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [analytics, setAnalytics] = useState({
    overview: {
      totalBeds: 0,
      totalRooms: 0,
      totalEquipment: 0,
      averageOccupancy: 0,
      totalAlerts: 0,
      resolvedAlerts: 0,
    },
    trends: {
      bedOccupancy: [],
      roomUtilization: [],
      equipmentUsage: [],
      alertFrequency: [],
    },
    departments: [],
    topAlerts: [],
  });

  // Mock API functions (you'll need to implement these in backend)
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockAnalytics = {
        overview: {
          totalBeds: 150,
          totalRooms: 45,
          totalEquipment: 320,
          averageOccupancy: 78.5,
          totalAlerts: 156,
          resolvedAlerts: 134,
        },
        trends: {
          bedOccupancy: [
            { date: '2024-01-01', value: 75, label: 'Jan 1' },
            { date: '2024-01-02', value: 78, label: 'Jan 2' },
            { date: '2024-01-03', value: 82, label: 'Jan 3' },
            { date: '2024-01-04', value: 79, label: 'Jan 4' },
            { date: '2024-01-05', value: 85, label: 'Jan 5' },
            { date: '2024-01-06', value: 77, label: 'Jan 6' },
            { date: '2024-01-07', value: 80, label: 'Jan 7' },
          ],
          roomUtilization: [
            { date: '2024-01-01', value: 68, label: 'Jan 1' },
            { date: '2024-01-02', value: 72, label: 'Jan 2' },
            { date: '2024-01-03', value: 75, label: 'Jan 3' },
            { date: '2024-01-04', value: 70, label: 'Jan 4' },
            { date: '2024-01-05', value: 78, label: 'Jan 5' },
            { date: '2024-01-06', value: 73, label: 'Jan 6' },
            { date: '2024-01-07', value: 76, label: 'Jan 7' },
          ],
          equipmentUsage: [
            { date: '2024-01-01', value: 85, label: 'Jan 1' },
            { date: '2024-01-02', value: 88, label: 'Jan 2' },
            { date: '2024-01-03', value: 82, label: 'Jan 3' },
            { date: '2024-01-04', value: 90, label: 'Jan 4' },
            { date: '2024-01-05', value: 86, label: 'Jan 5' },
            { date: '2024-01-06', value: 91, label: 'Jan 6' },
            { date: '2024-01-07', value: 87, label: 'Jan 7' },
          ],
          alertFrequency: [
            { date: '2024-01-01', value: 12, label: 'Jan 1' },
            { date: '2024-01-02', value: 8, label: 'Jan 2' },
            { date: '2024-01-03', value: 15, label: 'Jan 3' },
            { date: '2024-01-04', value: 6, label: 'Jan 4' },
            { date: '2024-01-05', value: 18, label: 'Jan 5' },
            { date: '2024-01-06', value: 10, label: 'Jan 6' },
            { date: '2024-01-07', value: 14, label: 'Jan 7' },
          ],
        },
        departments: [
          { 
            name: 'ICU', 
            beds: 20, 
            occupiedBeds: 18, 
            rooms: 8, 
            occupiedRooms: 7, 
            equipment: 45, 
            inUseEquipment: 42,
            alerts: 25,
            occupancyRate: 90,
          },
          { 
            name: 'ER', 
            beds: 30, 
            occupiedBeds: 25, 
            rooms: 12, 
            occupiedRooms: 10, 
            equipment: 60, 
            inUseEquipment: 55,
            alerts: 35,
            occupancyRate: 83.3,
          },
          { 
            name: 'GENERAL', 
            beds: 60, 
            occupiedBeds: 45, 
            rooms: 20, 
            occupiedRooms: 15, 
            equipment: 120, 
            inUseEquipment: 95,
            alerts: 45,
            occupancyRate: 75,
          },
          { 
            name: 'PEDIATRICS', 
            beds: 25, 
            occupiedBeds: 20, 
            rooms: 5, 
            occupiedRooms: 4, 
            equipment: 50, 
            inUseEquipment: 40,
            alerts: 20,
            occupancyRate: 80,
          },
          { 
            name: 'CARDIOLOGY', 
            beds: 15, 
            occupiedBeds: 12, 
            rooms: 6, 
            occupiedRooms: 5, 
            equipment: 45, 
            inUseEquipment: 38,
            alerts: 15,
            occupancyRate: 80,
          },
        ],
        topAlerts: [
          { type: 'THRESHOLD', count: 45, percentage: 28.8 },
          { type: 'MAINTENANCE', count: 38, percentage: 24.4 },
          { type: 'STATUS_CHANGE', count: 32, percentage: 20.5 },
          { type: 'CAPACITY', count: 25, percentage: 16.0 },
          { type: 'SYSTEM', count: 16, percentage: 10.3 },
        ],
      };
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, selectedDepartment]);

  // Simple bar chart component
  const SimpleBarChart = ({ data, title, color = 'bg-blue-500' }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-16 text-sm text-gray-600">{item.label}</div>
              <div className="flex-1 flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                  <div 
                    className={`h-6 rounded-full ${color}`}
                    style={{ width: `${(item.value / maxValue) * 100}%` }}
                  ></div>
                </div>
                <div className="w-12 text-sm font-medium text-gray-900 text-right">{item.value}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Simple pie chart component
  const SimplePieChart = ({ data, title }) => {
    const total = data.reduce((sum, item) => sum + item.count, 0);
    
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div 
                  className={`w-4 h-4 rounded`}
                  style={{ 
                    backgroundColor: ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6'][index] 
                  }}
                ></div>
                <span className="text-sm text-gray-700">{item.type}</span>
              </div>
              <div className="text-sm font-medium text-gray-900">
                {item.count} ({item.percentage.toFixed(1)}%)
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600">Comprehensive insights and performance metrics</p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input"
          >
            <option value="1d">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="input"
          >
            <option value="all">All Departments</option>
            {DEPARTMENTS.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <button className="btn-secondary">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Bed className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Beds</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalBeds}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Home className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Rooms</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalRooms}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Wrench className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Equipment</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalEquipment}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Users className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Occupancy</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.averageOccupancy}%</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <Activity className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalAlerts}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Resolved Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.resolvedAlerts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SimpleBarChart 
          data={analytics.trends.bedOccupancy} 
          title="Bed Occupancy Trend (%)" 
          color="bg-blue-500"
        />
        <SimpleBarChart 
          data={analytics.trends.roomUtilization} 
          title="Room Utilization Trend (%)" 
          color="bg-green-500"
        />
        <SimpleBarChart 
          data={analytics.trends.equipmentUsage} 
          title="Equipment Usage Trend (%)" 
          color="bg-purple-500"
        />
        <SimpleBarChart 
          data={analytics.trends.alertFrequency} 
          title="Alert Frequency" 
          color="bg-red-500"
        />
      </div>

      {/* Department Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Performance</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Beds</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Occupancy</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alerts</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.departments.map((dept, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{dept.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{dept.occupiedBeds}/{dept.beds}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full ${
                              dept.occupancyRate >= 90 ? 'bg-red-500' :
                              dept.occupancyRate >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${dept.occupancyRate}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium">{dept.occupancyRate}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{dept.inUseEquipment}/{dept.equipment}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{dept.alerts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <SimplePieChart 
          data={analytics.topAlerts} 
          title="Alert Types Distribution"
        />
      </div>
    </div>
  );
};

export default Analytics;
