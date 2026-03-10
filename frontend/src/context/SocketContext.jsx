import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../utils/constants';
import toast from 'react-hot-toast';

// Create context
const SocketContext = createContext();

// Provider component
export const SocketProvider = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Initialize socket connection
  useEffect(() => {
    if (isAuthenticated && token && user) {
      // Connect to socket server
      socketRef.current = io(API_BASE_URL.replace('/api', ''), {
        auth: {
          token,
        },
        transports: ['websocket', 'polling'],
      });

      const socket = socketRef.current;

      // Connection events
      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        reconnectAttempts.current = 0;
        
        // Join user's department room if they have one
        if (user.department) {
          socket.emit('join-department', user.department);
        }
        
        // Join user's role room
        socket.emit('join-role', user.role);
        
        toast.success('Real-time connection established');
      });

      socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, don't reconnect automatically
          socket.connect();
        }
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        reconnectAttempts.current++;
        
        if (reconnectAttempts.current >= maxReconnectAttempts) {
          toast.error('Failed to establish real-time connection');
        }
      });

      // Resource update events
      socket.on('resource-update', (data) => {
        console.log('Resource update received:', data);
        // This will be handled by specific components
      });

      socket.on('resource-create', (data) => {
        console.log('Resource creation received:', data);
      });

      socket.on('resource-delete', (data) => {
        console.log('Resource deletion received:', data);
      });

      socket.on('status-change', (data) => {
        console.log('Status change received:', data);
        toast(`${data.type} status changed to ${data.data.newStatus}`, {
          icon: '🔄',
        });
      });

      socket.on('stats-update', (data) => {
        console.log('Stats update received:', data);
      });

      // Department-specific events
      socket.on('department-resource-update', (data) => {
        console.log('Department resource update:', data);
      });

      socket.on('department-status-change', (data) => {
        console.log('Department status change:', data);
        toast(`Department ${data.department}: ${data.type} status changed`, {
          icon: '🏥',
        });
      });

      // Alert events
      socket.on('new-alert', (data) => {
        console.log('New alert received:', data);
        
        const alertMessage = `${data.title}: ${data.message}`;
        const toastOptions = {
          duration: data.priority === 'CRITICAL' ? 8000 : 5000,
          icon: data.priority === 'CRITICAL' ? '🚨' : '⚠️',
        };
        
        if (data.priority === 'CRITICAL') {
          toast.error(alertMessage, toastOptions);
        } else if (data.priority === 'HIGH') {
          toast(alertMessage, toastOptions);
        } else {
          toast(alertMessage, toastOptions);
        }
      });

      socket.on('alert-acknowledged', (data) => {
        console.log('Alert acknowledged:', data);
        toast('Alert acknowledged', { icon: '✅' });
      });

      socket.on('alert-resolved', (data) => {
        console.log('Alert resolved:', data);
        toast('Alert resolved', { icon: '✅' });
      });

      socket.on('threshold-alert', (data) => {
        console.log('Threshold alert received:', data);
        toast.error(`Threshold Alert: ${data.message}`, {
          duration: 8000,
          icon: '⚠️',
        });
      });

      socket.on('emergency-alert', (data) => {
        console.log('Emergency alert received:', data);
        toast.error(`🚨 EMERGENCY: ${data.message}`, {
          duration: 10000,
          icon: '🚨',
        });
      });

      socket.on('maintenance-reminder', (data) => {
        console.log('Maintenance reminder received:', data);
        toast(`Maintenance Reminder: ${data.message}`, {
          icon: '🔧',
        });
      });

      // Notification events
      socket.on('notification', (data) => {
        console.log('Notification received:', data);
        toast(data.message, {
          icon: '📢',
        });
      });

      // System events
      socket.on('system-alert', (data) => {
        console.log('System alert received:', data);
        toast(`System: ${data.message}`, {
          icon: '⚙️',
        });
      });

      // Cleanup on unmount
      return () => {
        if (socket) {
          socket.disconnect();
          console.log('Socket disconnected on unmount');
        }
      };
    }
  }, [isAuthenticated, token, user]);

  // Re-join department/role rooms when user changes
  useEffect(() => {
    if (socketRef.current && user) {
      // Leave previous rooms
      if (user.department) {
        socketRef.current.emit('join-department', user.department);
      }
      socketRef.current.emit('join-role', user.role);
    }
  }, [user?.department, user?.role]);

  // Manual emit function
  const emit = (event, data) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  };

  // Manual join room function
  const joinRoom = (room) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('join-department', room);
    }
  };

  // Manual leave room function
  const leaveRoom = (room) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('leave-department', room);
    }
  };

  const value = {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected || false,
    emit,
    joinRoom,
    leaveRoom,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// Hook to use socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;
