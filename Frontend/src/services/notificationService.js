import { mockNotifications } from '../data/mockNotifications';

export const notificationService = {
  getAll: async () => [...mockNotifications],
  markAsRead: async (_id) => true,
  markAllAsRead: async () => true,
};
