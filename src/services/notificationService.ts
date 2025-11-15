import api from '@/lib/api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  target: 'ALL' | 'USER' | 'COMMERCIAL' | 'ADMIN';
  status: 'SENT' | 'SCHEDULED' | 'FAILED';
  sentAt: string;
  totalRecipients: number;
  readRate: number;
}

export interface NotificationStats {
  totalNotifications: number;
  scheduledNotifications: number;
  sentNotifications: number;
  averageReadRate: number;
}

export interface CreateNotificationRequest {
  title: string;
  message: string;
  target: string;
  scheduledAt?: string;
}

export const notificationService = {
  getAllNotifications: async (): Promise<Notification[]> => {
    const response = await api.get('/admin/notifications');
    return response.data.data;
  },

  getNotificationStats: async (): Promise<NotificationStats> => {
    const response = await api.get('/admin/notifications/stats');
    return response.data.data;
  },

  createNotification: async (adminId: string, data: CreateNotificationRequest) => {
    const response = await api.post('/admin/notifications', data, {
      params: { adminId }
    });
    return response.data.data;
  },

  sendNotification: async (data: any) => {
    const response = await api.post('/admin/notifications/send', data);
    return response.data;
  },

  broadcastNotification: async (title: string, message: string) => {
    const response = await api.post('/admin/notifications/broadcast', null, {
      params: { title, message }
    });
    return response.data;
  },
};
