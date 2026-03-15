import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Loader from '../components/common/Loader';
import StatusBadge from '../components/common/StatusBadge';
import api from '../services/api';
import './ActivityLog.css';

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/logs');
      setLogs(response.data.data || response.data);
    } catch (err) {
      setError('Failed to fetch activity logs');
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available': return '🟢';
      case 'occupied': return '🟡';
      case 'in-use': return '🔵';
      case 'cleaning': return '🔵';
      case 'maintenance': return '🔴';
      case 'critical': return '🚨';
      default: return '⚪';
    }
  };

  const getResourceTypeIcon = (type) => {
    switch (type) {
      case 'bed': return '🛏️';
      case 'equipment': return '🏥';
      case 'room': return '🚪';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <div className="activity-log-page">
        <Navbar />
        <div className="activity-log-container">
          <Loader size="large" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="activity-log-page">
        <Navbar />
        <div className="activity-log-container">
          <div className="error-state">
            <span className="error-icon">❌</span>
            <h3>Error Loading Activity Logs</h3>
            <p>{error}</p>
            <button onClick={fetchLogs} className="btn btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="activity-log-page">
      <Navbar />
      <div className="activity-log-container">
        <div className="activity-log-header">
          <h1 className="page-title">Activity Log</h1>
          <div className="log-info">
            <span className="log-count">{logs.length} entries</span>
          </div>
        </div>

        <div className="activity-log-content">
          {logs.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📋</span>
              <h3>No Activity Found</h3>
              <p>No activity logs are available at this time.</p>
            </div>
          ) : (
            <div className="log-entries">
              {logs.map((log) => (
                <div key={log._id} className="log-entry">
                  <div className="log-main">
                    <div className="log-resource">
                      <span className="resource-icon">
                        {getResourceTypeIcon(log.resourceType)}
                      </span>
                      <span className="resource-type">{log.resourceType}</span>
                      <span className="resource-id">{log.resourceId}</span>
                    </div>
                    <div className="log-change">
                      <div className="status-change old">
                        <span className="status-icon">{getStatusIcon(log.oldStatus)}</span>
                        <StatusBadge status={log.oldStatus} />
                      </div>
                      <span className="change-arrow">→</span>
                      <div className="status-change new">
                        <span className="status-icon">{getStatusIcon(log.newStatus)}</span>
                        <StatusBadge status={log.newStatus} />
                      </div>
                    </div>
                  </div>
                  <div className="log-meta">
                    <div className="user-info">
                      <span className="user-avatar">👤</span>
                      <span className="user-name">{log.updatedBy?.name || 'Unknown'}</span>
                      <span className="user-role">{log.updatedBy?.role || ''}</span>
                    </div>
                    <span className="log-time">{formatTime(log.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
