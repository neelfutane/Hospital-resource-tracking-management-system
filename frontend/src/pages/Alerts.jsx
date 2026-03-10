import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { 
  AlertTriangle, 
  Bell, 
  CheckCircle, 
  X, 
  Search, 
  Filter,
  Clock,
  AlertCircle,
  Info
} from 'lucide-react';
import { formatRelativeTime, formatDate } from '../utils/formatDate';
import toast from 'react-hot-toast';
import { DEPARTMENTS, ALERT_TYPES } from '../utils/constants';

const Alerts = () => {
  const { user } = useAuth();
  const { isConnected } = useSocket();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    acknowledged: 0,
    unacknowledged: 0,
  });

  // Mock API functions (you'll need to implement these in backend)
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockAlerts = [
        {
          id: '1',
          title: 'ICU Bed Threshold Alert',
          message: 'ICU bed availability has dropped to 3 (threshold: 5)',
          priority: 'CRITICAL',
          type: 'THRESHOLD',
          department: 'ICU',
          resourceId: 'bed-123',
          acknowledged: false,
          acknowledgedBy: null,
          acknowledgedAt: null,
          timestamp: new Date(Date.now() - 1000 * 60 * 10),
          resolved: false,
          resolvedBy: null,
          resolvedAt: null,
        },
        {
          id: '2',
          title: 'Ventilator Maintenance Due',
          message: 'Ventilator V-001 maintenance is due in 3 days',
          priority: 'HIGH',
          type: 'MAINTENANCE',
          department: 'ICU',
          resourceId: 'equipment-456',
          acknowledged: true,
          acknowledgedBy: 'Dr. Smith',
          acknowledgedAt: new Date(Date.now() - 1000 * 60 * 30),
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
          resolved: false,
          resolvedBy: null,
          resolvedAt: null,
        },
        {
          id: '3',
          title: 'ER Room Capacity Warning',
          message: 'ER room occupancy has reached 90% capacity',
          priority: 'MEDIUM',
          type: 'THRESHOLD',
          department: 'ER',
          resourceId: 'room-789',
          acknowledged: false,
          acknowledgedBy: null,
          acknowledgedAt: null,
          timestamp: new Date(Date.now() - 1000 * 60 * 120),
          resolved: true,
          resolvedBy: 'Nurse Johnson',
          resolvedAt: new Date(Date.now() - 1000 * 60 * 30),
        },
        {
          id: '4',
          title: 'Equipment Status Change',
          message: 'Defibrillator D-001 status changed to MAINTENANCE',
          priority: 'LOW',
          type: 'STATUS_CHANGE',
          department: 'ER',
          resourceId: 'equipment-012',
          acknowledged: true,
          acknowledgedBy: 'System',
          acknowledgedAt: new Date(Date.now() - 1000 * 60 * 180),
          timestamp: new Date(Date.now() - 1000 * 60 * 240),
          resolved: true,
          resolvedBy: 'System',
          resolvedAt: new Date(Date.now() - 1000 * 60 * 180),
        },
      ];
      setAlerts(mockAlerts);
      updateStats(mockAlerts);
    } catch (error) {
      toast.error('Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (alertsData) => {
    const newStats = {
      total: alertsData.length,
      critical: alertsData.filter(a => a.priority === 'CRITICAL').length,
      high: alertsData.filter(a => a.priority === 'HIGH').length,
      medium: alertsData.filter(a => a.priority === 'MEDIUM').length,
      low: alertsData.filter(a => a.priority === 'LOW').length,
      acknowledged: alertsData.filter(a => a.acknowledged).length,
      unacknowledged: alertsData.filter(a => !a.acknowledged).length,
    };
    setStats(newStats);
  };

  // Handle acknowledge alert
  const handleAcknowledge = async (alertId) => {
    try {
      // Mock API call - replace with actual API
      const updatedAlerts = alerts.map(alert => 
        alert.id === alertId 
          ? { 
              ...alert, 
              acknowledged: true, 
              acknowledgedBy: user.name,
              acknowledgedAt: new Date() 
            }
          : alert
      );
      setAlerts(updatedAlerts);
      updateStats(updatedAlerts);
      toast.success('Alert acknowledged successfully');
    } catch (error) {
      toast.error('Failed to acknowledge alert');
    }
  };

  // Handle resolve alert
  const handleResolve = async (alertId) => {
    try {
      // Mock API call - replace with actual API
      const updatedAlerts = alerts.map(alert => 
        alert.id === alertId 
          ? { 
              ...alert, 
              resolved: true, 
              resolvedBy: user.name,
              resolvedAt: new Date() 
            }
          : alert
      );
      setAlerts(updatedAlerts);
      updateStats(updatedAlerts);
      toast.success('Alert resolved successfully');
    } catch (error) {
      toast.error('Failed to resolve alert');
    }
  };

  // Filter alerts based on search and filters
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = !selectedPriority || alert.priority === selectedPriority;
    const matchesDepartment = !selectedDepartment || alert.department === selectedDepartment;
    const matchesStatus = !selectedStatus || 
      (selectedStatus === 'acknowledged' && alert.acknowledged) ||
      (selectedStatus === 'unacknowledged' && !alert.acknowledged) ||
      (selectedStatus === 'resolved' && alert.resolved) ||
      (selectedStatus === 'active' && !alert.resolved);
    return matchesSearch && matchesPriority && matchesDepartment && matchesStatus;
  });

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get priority icon
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'CRITICAL': return <AlertTriangle className="h-4 w-4" />;
      case 'HIGH': return <AlertCircle className="h-4 w-4" />;
      case 'MEDIUM': return <AlertTriangle className="h-4 w-4" />;
      case 'LOW': return <Info className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  if (loading && alerts.length === 0) {
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
        <h1 className="text-2xl font-bold text-gray-900">Alert Management</h1>
        <p className="text-gray-600">Monitor and manage system alerts and notifications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Critical</p>
              <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unacknowledged</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.unacknowledged}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Acknowledged</p>
              <p className="text-2xl font-bold text-green-600">{stats.acknowledged}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="input"
          >
            <option value="">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="input"
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="input"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="unacknowledged">Unacknowledged</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <div key={alert.id} className={`card border-l-4 ${getPriorityColor(alert.priority)}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {getPriorityIcon(alert.priority)}
                  <h3 className="text-lg font-semibold text-gray-900">{alert.title}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(alert.priority)}`}>
                    {alert.priority}
                  </span>
                  {alert.acknowledged && !alert.resolved && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      Acknowledged
                    </span>
                  )}
                  {alert.resolved && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Resolved
                    </span>
                  )}
                </div>
                <p className="text-gray-700 mb-2">{alert.message}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatRelativeTime(alert.timestamp)}
                  </span>
                  <span>Department: {alert.department}</span>
                  <span>Type: {alert.type}</span>
                </div>
                {alert.acknowledged && (
                  <div className="mt-2 text-sm text-gray-600">
                    Acknowledged by {alert.acknowledgedBy} at {formatDate(alert.acknowledgedAt, 'MMM dd, yyyy HH:mm')}
                  </div>
                )}
                {alert.resolved && (
                  <div className="mt-2 text-sm text-gray-600">
                    Resolved by {alert.resolvedBy} at {formatDate(alert.resolvedAt, 'MMM dd, yyyy HH:mm')}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2 ml-4">
                {!alert.acknowledged && (
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    className="btn-primary text-sm"
                    disabled={user?.role === 'VIEWER'}
                  >
                    Acknowledge
                  </button>
                )}
                {!alert.resolved && (
                  <button
                    onClick={() => handleResolve(alert.id)}
                    className="btn-secondary text-sm"
                    disabled={user?.role === 'VIEWER'}
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAlerts.length === 0 && (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts found</h3>
          <p className="text-gray-500">Try adjusting your filters or search terms</p>
        </div>
      )}
    </div>
  );
};

export default Alerts;
