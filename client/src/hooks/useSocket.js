import { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

export const useSocketEvent = (eventName, callback) => {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket || !eventName || !callback) return;

    socket.on(eventName, callback);

    // Cleanup on unmount
    return () => {
      socket.off(eventName, callback);
    };
  }, [socket, eventName, callback]);
};

export default useSocketEvent;
