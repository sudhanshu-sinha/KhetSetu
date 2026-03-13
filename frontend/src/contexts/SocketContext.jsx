import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    const token = localStorage.getItem('khetsetu-token');
    const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
    });

    newSocket.on('new-application', (data) => {
      setNotifications(prev => [...prev, { type: 'application', ...data, timestamp: Date.now() }]);
    });

    newSocket.on('application-update', (data) => {
      setNotifications(prev => [...prev, { type: 'application-update', ...data, timestamp: Date.now() }]);
    });

    newSocket.on('new-message', (data) => {
      setNotifications(prev => [...prev, { type: 'message', ...data, timestamp: Date.now() }]);
    });

    newSocket.on('payment-received', (data) => {
      setNotifications(prev => [...prev, { type: 'payment', ...data, timestamp: Date.now() }]);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [isAuthenticated]);

  const clearNotifications = () => setNotifications([]);

  return (
    <SocketContext.Provider value={{ socket, notifications, clearNotifications }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within SocketProvider');
  return context;
}
