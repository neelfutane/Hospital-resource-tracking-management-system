import { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';
import { SOCKET_EVENTS } from '../constants/socketEvents';

const AlertContext = createContext();

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Listen for alert events
    const handleAlertTriggered = (alertData) => {
      addAlert(alertData);
    };

    socket.on(SOCKET_EVENTS.ALERT_TRIGGERED, handleAlertTriggered);

    // Cleanup
    return () => {
      socket.off(SOCKET_EVENTS.ALERT_TRIGGERED, handleAlertTriggered);
    };
  }, [socket]);

  const addAlert = (alert) => {
    const newAlert = {
      id: Date.now() + Math.random(), // Simple unique ID
      ...alert,
      timestamp: alert.timestamp || new Date()
    };
    
    setAlerts(prev => [newAlert, ...prev]);
  };

  const removeAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  const value = {
    alerts,
    addAlert,
    removeAlert,
    clearAlerts
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};
