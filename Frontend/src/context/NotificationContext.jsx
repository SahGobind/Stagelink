import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import {
  getStoredNotifications,
  saveStoredNotifications,
} from '../data/mockNotifications';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(() => getStoredNotifications());

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      saveStoredNotifications(updated);
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      saveStoredNotifications(updated);
      return updated;
    });
  }, []);

  const addNotification = useCallback((notification) => {
    setNotifications((prev) => {
      const updated = [
        {
          id: `notif-${Date.now()}`,
          timestamp: 'Just now',
          read: false,
          ...notification,
        },
        ...prev,
      ];
      saveStoredNotifications(updated);
      return updated;
    });
  }, []);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      addNotification,
    }),
    [notifications, unreadCount, markAsRead, markAllAsRead, addNotification]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
