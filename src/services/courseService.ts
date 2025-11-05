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
    return response.data;
  },

  getPublishedCourses: async () => {
    const response = await api.get('/courses/published');
    return response.data;
  },

  getCourseById: async (id: string) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  getCoursesByLevel: async (level: string) => {
    const response = await api.get(`/courses/level/${level}`);
    return response.data;
  },

  searchCourses: async (keyword: string) => {
    const response = await api.get(`/courses/search`, {
      params: { keyword },
    });
    return response.data;
  },

  createCourse: async (data: CreateCourseRequest) => {
    const response = await api.post('/courses', data);
    return response.data;
  },

  updateCourse: async (id: string, data: Partial<CreateCourseRequest>) => {
    const response = await api.put(`/courses/${id}`, data);
    return response.data;
  },

  deleteCourse: async (id: string) => {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },
};
