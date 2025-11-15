import api from '@/lib/api';

export interface Course {
  id: string;
  title: string;
  description: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  duration: number;
  price: number;
  published: boolean;
  thumbnailUrl?: string;
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  level: string;
  duration: number;
  price: number;
  published: boolean;
  thumbnailUrl?: string;
}

export const courseService = {
  getAllCourses: async () => {
    const response = await api.get('/courses');
    return response.data.data;
  },

  getCourseStats: async () => {
    const response = await api.get('/admin/courses/stats');
    return response.data.data;
  },

  getPublishedCourses: async () => {
    const response = await api.get('/courses/published');
    return response.data.data;
  },

  getCourseById: async (id: string) => {
    const response = await api.get(`/courses/${id}`);
    return response.data.data;
  },

  getCoursesByLevel: async (level: string) => {
    const response = await api.get(`/courses/level/${level}`);
    return response.data.data;
  },

  searchCourses: async (keyword: string) => {
    const response = await api.get(`/courses/search`, {
      params: { keyword },
    });
    return response.data.data;
  },

  createCourse: async (adminId: string, data: CreateCourseRequest) => {
    const response = await api.post('/admin/courses', data, {
      params: { adminId }
    });
    return response.data.data;
  },

  updateCourse: async (courseId: string, adminId: string, data: Partial<CreateCourseRequest>) => {
    const response = await api.put(`/admin/courses/${courseId}`, data, {
      params: { adminId }
    });
    return response.data.data;
  },

  deleteCourse: async (courseId: string, adminId: string) => {
    const response = await api.delete(`/admin/courses/${courseId}`, {
      params: { adminId }
    });
    return response.data;
  },
};
