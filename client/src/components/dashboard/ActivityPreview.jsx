import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useSocketEvent } from '../../hooks/useSocket';
import { SOCKET_EVENTS } from '../../constants/socketEvents';
import './ActivityPreview.css';

const ActivityPreview = () => {
  const [activities, setActivities] = useState([]);

  // Mock data for now - in real app, this would come from an API
  useEffect(() => {
    const mockActivities = [
      {
        id: 1,
        resourceType: 'bed',
        resourceId: 'BED-001',
        oldStatus: 'available',
        newStatus: 'occupied',
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        updatedBy: { name: 'Dr. Sarah Johnson' }
      },
      {
        id: 2,
        resourceType: 'equipment',
        resourceId: 'VENT-0001',
        oldStatus: 'available',
        newStatus: 'in-use',
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        updatedBy: { name: 'Nurse Emily Davis' }
      },
      {
        id: 3,
        resourceType: 'room',
        resourceId: 'OR-01',
        oldStatus: 'cleaning',
        newStatus: 'available',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        updatedBy: { name: 'Staff Michael Brown' }
      }
    ];
    setActivities(mockActivities);
  }, []);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available': return '🟢';
      case 'occupied': return '🟡';
      case 'in-use': return '🔵';
      case 'cleaning': return '🔵';
      default: return '⚪';
    }
  };

  return (
    <div className="activity-preview">
      <div className="activity-header">
        <h3 className="activity-title">Recent Activity</h3>
        <Link to="/logs" className="view-all-link">
          View all →
        </Link>
      </div>
      
      <div className="activity-list">
        {activities.length === 0 ? (
          <div className="no-activity">
            <span className="no-activity-icon">📋</span>
            <p>No recent activity</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className="activity-main">
                <div className="activity-resource">
                  <span className="resource-type">{activity.resourceType}</span>
                  <span className="resource-id">{activity.resourceId}</span>
                </div>
                <div className="activity-change">
                  <span className="status-change">
                    {getStatusIcon(activity.oldStatus)} {activity.oldStatus}
                  </span>
                  <span className="arrow">→</span>
                  <span className="status-change">
                    {getStatusIcon(activity.newStatus)} {activity.newStatus}
                  </span>
                </div>
              </div>
              <div className="activity-meta">
                <span className="activity-user">{activity.updatedBy.name}</span>
                <span className="activity-time">{formatTime(activity.timestamp)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityPreview;
