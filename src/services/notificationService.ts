import api from '@/lib/api';

// Récupérer l'historique des notifications
export const getNotificationHistory = async () => {
  const response = await api.get('/admin/notifications/history');
  return response.data.data;
};

// Récupérer les statistiques
export const getNotificationStatistics = async () => {
  const response = await api.get('/admin/notifications/statistics');
  return response.data.data;
};

// Envoyer une notification
export const sendNotification = async (data: {
  title: string;
  message: string;
  targetRole?: 'VIP' | 'NORMAL' | 'COMMERCIAL' | 'ADMIN' | null; // null = TOUS
  targetUserId?: number | null; // Pour envoyer à un seul utilisateur
  deepLink?: string | null;
  urgent?: boolean;
}) => {
  const response = await api.post('/admin/notifications/send', data);
  return response.data;
};
