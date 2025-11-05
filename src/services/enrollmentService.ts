import api from '@/lib/api';

export const enrollmentService = {
  enrollUser: async (userId: string, courseId: string) => {
    const response = await api.post(`/enrollments/enroll`, null, {
      params: { userId, courseId },
    });
    return response.data;
  },

  getUserEnrollments: async (userId: string) => {
    const response = await api.get(`/enrollments/user/${userId}`);
    return response.data;
  },

  getCourseEnrollments: async (courseId: string) => {
    const response = await api.get(`/enrollments/course/${courseId}`);
    return response.data;
  },

  getEnrollmentById: async (id: string) => {
    const response = await api.get(`/enrollments/${id}`);
    return response.data;
  },

  updateEnrollmentStatus: async (id: string, status: 'IN_PROGRESS' | 'COMPLETED' | 'DROPPED') => {
    const response = await api.put(`/enrollments/${id}/status`, null, {
      params: { status },
    });
    return response.data;
  },

  unenroll: async (id: string) => {
    const response = await api.delete(`/enrollments/${id}`);
    return response.data;
  },
};
