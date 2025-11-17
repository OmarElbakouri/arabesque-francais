import api from '@/lib/api';

export const adminService = {
  // Dashboard Stats
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data.data;
  },

  getMonthlyRevenue: async () => {
    const response = await api.get('/admin/dashboard/monthly-revenue');
    return response.data.data;
  },

  getRegistrations: async (days: number = 30) => {
    const response = await api.get('/admin/dashboard/registrations', {
      params: { days }
    });
    return response.data.data;
  },

  getRecentActivities: async (limit: number = 10) => {
    const response = await api.get('/admin/dashboard/recent-activities', {
      params: { limit }
    });
    return response.data.data;
  },

  getCommercialSales: async () => {
    const response = await api.get('/admin/dashboard/commercial-sales');
    return response.data.data;
  },

  getCommercialUsers: async (commercialId: number) => {
    const response = await api.get(`/admin/commercial/${commercialId}/users`);
    return response.data.data;
  },

  // User Management
  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data.data;
  },

  getUserStats: async () => {
    const response = await api.get('/admin/users/stats');
    return response.data.data;
  },

  searchUsers: async (query: string) => {
    const response = await api.get('/admin/users/search', {
      params: { query }
    });
    return response.data.data;
  },

  filterUsersByRole: async (role: string) => {
    const response = await api.get(`/admin/users/filter/role/${role}`);
    return response.data.data;
  },

  filterUsersByStatus: async (status: string) => {
    const response = await api.get(`/admin/users/filter/status/${status}`);
    return response.data.data;
  },

  getUserById: async (userId: string) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data.data;
  },

  // User update methods - backend uses specific endpoints for each field
  updateUser: async (userId: string, data: any) => {
    // This is a wrapper that calls individual endpoints based on what fields are being updated
    // Update role first if it's being changed, as it may affect other operations
    try {
      if (data.role !== undefined) {
        await api.put(`/admin/users/${userId}/role`, null, {
          params: { role: data.role }
        });
      }
      
      if (data.status !== undefined) {
        await api.put(`/admin/users/${userId}/user-status`, null, {
          params: { status: data.status }
        });
      }
      
      if (data.creditBalance !== undefined) {
        await api.put(`/admin/users/${userId}/credits`, null, {
          params: { credits: data.creditBalance }
        });
      }
      
      // Update plan last, only for USER/NORMAL roles
      if (data.plan !== undefined) {
        await api.put(`/admin/users/${userId}/plan`, null, {
          params: { planName: data.plan }
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  deleteUser: async (userId: string, adminId: string) => {
    const response = await api.delete(`/admin/users/${userId}`, {
      params: { adminId }
    });
    return response.data;
  },

  // Commercial Users Management
  getAllCommercials: async () => {
    const response = await api.get('/admin/commercial-users');
    return response.data.data;
  },

  createCommercial: async (data: { firstName: string; lastName: string; email: string; phone?: string; commissionPercentage: number }) => {
    const response = await api.post('/admin/users/commercial', data);
    return response.data.data;
  },

  getCommercialStats: async (commercialId: string) => {
    const response = await api.get(`/commercial/${commercialId}/dashboard/stats`);
    return response.data.data;
  },

  getCommercialUsers: async (commercialId: string) => {
    const response = await api.get(`/commercial/${commercialId}/users`);
    return response.data.data;
  },

  searchCommercialUsers: async (commercialId: string, query: string) => {
    const response = await api.get(`/commercial/${commercialId}/users/search`, {
      params: { query }
    });
    return response.data.data;
  },

  deactivateCommercial: async (id: string, adminId: string, reason: string) => {
    const response = await api.put(`/admin/commercial-users/${id}/deactivate`, null, {
      params: { adminId, reason }
    });
    return response.data;
  },

  reactivateCommercial: async (id: string, adminId: string) => {
    const response = await api.put(`/admin/commercial-users/${id}/reactivate`, null, {
      params: { adminId }
    });
    return response.data;
  },

  resetCommercialPassword: async (id: string, adminId: string) => {
    const response = await api.post(`/admin/commercial-users/${id}/reset-password`, null, {
      params: { adminId }
    });
    return response.data;
  },

  // Payments
  getPendingPayments: async () => {
    const response = await api.get('/admin/payments/pending');
    return response.data.data;
  },

  getPaymentsByStatus: async (status: string) => {
    const response = await api.get('/admin/payments', {
      params: { status },
    });
    return response.data.data;
  },

  getPaymentById: async (id: string) => {
    const response = await api.get(`/admin/payments/${id}`);
    return response.data.data;
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
    return response.data.data;
  },

  // Promo Codes
  getAllPromoCodes: async () => {
    const response = await api.get('/admin/promo-codes');
    return response.data.data;
  },

  getActivePromoCodes: async () => {
    const response = await api.get('/admin/promo-codes/active');
    return response.data.data;
  },

  getPromoCodesByCommercial: async (commercialId: string) => {
    const response = await api.get(`/admin/promo-codes/commercial/${commercialId}`);
    return response.data.data;
  },

  createPromoCode: async (data: any) => {
    const response = await api.post('/admin/promo-codes', data);
    return response.data.data;
  },

  updatePromoCode: async (id: string, data: any) => {
    const response = await api.put(`/admin/promo-codes/${id}`, data);
    return response.data.data;
  },

  deletePromoCode: async (id: string) => {
    const response = await api.delete(`/admin/promo-codes/${id}`);
    return response.data;
  },

  // Notifications
  getAllNotifications: async () => {
    const response = await api.get('/admin/notifications');
    return response.data.data;
  },

  getNotificationStats: async () => {
    const response = await api.get('/admin/notifications/stats');
    return response.data.data;
  },

  createNotification: async (adminId: string, data: any) => {
    const response = await api.post('/admin/notifications', data, {
      params: { adminId }
    });
    return response.data.data;
  },

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

  // Payment Management
  getAllPayments: async () => {
    const response = await api.get('/admin/payments/all');
    return response.data.data;
  },

  updatePayment: async (paymentId: number, data: {
    status?: string;
    paymentMethod?: string;
    amount?: number;
  }) => {
    const response = await api.put('/admin/payments/update', {
      paymentId,
      ...data
    });
    return response.data.data;
  },
};
