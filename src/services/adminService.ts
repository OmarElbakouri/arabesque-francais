import api from '@/lib/api';

export const adminService = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  getSalesReps: async () => {
    const response = await api.get('/admin/dashboard/sales-reps');
    return response.data;
  },

  getSalesRepById: async (id: string) => {
    const response = await api.get(`/admin/dashboard/sales-reps/${id}`);
    return response.data;
  },

  // User Management
  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  getUsersByRole: async (role: string) => {
    const response = await api.get(`/admin/users/role/${role}`);
    return response.data;
  },

  getUserById: async (id: string) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  updateUserRole: async (id: string, role: string) => {
    const response = await api.put(`/admin/users/${id}/role`, null, {
      params: { role },
    });
    return response.data;
  },

  updateUserStatus: async (id: string, active: boolean) => {
    const response = await api.put(`/admin/users/${id}/status`, null, {
      params: { active },
    });
    return response.data;
  },

  updateUserCredits: async (id: string, credits: number) => {
    const response = await api.put(`/admin/users/${id}/credits`, null, {
      params: { credits },
    });
    return response.data;
  },

  createCommercial: async (data: any) => {
    const response = await api.post('/admin/users/commercial', data);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Payments
  getPendingPayments: async () => {
    const response = await api.get('/admin/payments/pending');
    return response.data;
  },

  getPaymentsByStatus: async (status: string) => {
    const response = await api.get('/admin/payments', {
      params: { status },
    });
    return response.data;
  },

  getPaymentById: async (id: string) => {
    const response = await api.get(`/admin/payments/${id}`);
    return response.data;
  },

  validatePayment: async (data: { paymentId: string; status: string; adminNotes: string }) => {
    const response = await api.post('/admin/payments/validate', data);
    return response.data;
  },

  rejectPayment: async (id: string, reason: string) => {
    const response = await api.post(`/admin/payments/${id}/reject`, null, {
      params: { reason },
    });
    return response.data;
  },

  getPaymentStatistics: async () => {
    const response = await api.get('/admin/payments/statistics');
    return response.data;
  },

  // Promo Codes
  getAllPromoCodes: async () => {
    const response = await api.get('/admin/promo-codes');
    return response.data;
  },

  getActivePromoCodes: async () => {
    const response = await api.get('/admin/promo-codes/active');
    return response.data;
  },

  getPromoCodesByCommercial: async (commercialId: string) => {
    const response = await api.get(`/admin/promo-codes/commercial/${commercialId}`);
    return response.data;
  },

  createPromoCode: async (data: any) => {
    const response = await api.post('/admin/promo-codes', data);
    return response.data;
  },

  updatePromoCode: async (id: string, data: any) => {
    const response = await api.put(`/admin/promo-codes/${id}`, data);
    return response.data;
  },

  deletePromoCode: async (id: string) => {
    const response = await api.delete(`/admin/promo-codes/${id}`);
    return response.data;
  },

  // Notifications
  sendNotification: async (data: any) => {
    const response = await api.post('/admin/notifications/send', data);
    return response.data;
  },

  broadcastNotification: async (title: string, message: string, deepLink?: string) => {
    const response = await api.post('/admin/notifications/broadcast', null, {
      params: { title, message, deepLink },
    });
    return response.data;
  },
};
