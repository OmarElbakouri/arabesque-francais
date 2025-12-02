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

// Nouvelles interfaces pour les APIs publiques
export interface CoursePublic {
  id: number;
  name: string;
  description: string;
  level: string;
  imageUrl: string | null;
  pdfUrl: string | null;
  durationHours: number;
  totalStudents: number;
  publishedAt: string;
  status: string;
  totalChapters: number;
  publishedChapters: number | null;
  chapters?: ChapterPublic[];
}

export interface ChapterPublic {
  id: number;
  title: string;
  description: string | null;
  content?: string;
  videoUrl: string | null;
  pdfUrl: string | null;
  durationMinutes: number;
  displayOrder: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  isLocked: boolean;
  lockReason: string | null;
  hasVideo?: boolean;
  hasPdf?: boolean;
}

// ===== INTERFACES STUDENT API =====

export interface StudentCourseDTO {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
  level: string;
  durationHours: number;
  price: number;
  status: string;
  totalStudents: number;
  publishedAt: string;
  totalChapters: number;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  chapters: StudentChapterDTO[];
}

export interface StudentChapterDTO {
  id: number;
  title: string;
  description: string | null;
  orderIndex: number;
  locked: boolean;
  lockedReason: string | null;
  // Médias directs du chapitre (nouvelle structure)
  videoUrl: string | null;
  audioUrl: string | null;
  pdfUrl: string | null;
  content: string | null;
  duration: number | null;
  completed: boolean;
  completedAt: string | null;
  // Ancienne structure avec leçons (peut être vide)
  totalLessons: number;
  completedLessons: number;
  lessons: StudentLessonDTO[];
}

export interface StudentLessonDTO {
  id: number;
  title: string;
  description: string | null;
  displayOrder: number;
  videoUrl: string | null;
  pdfUrl: string | null;
  audioUrl: string | null;
  content: string | null;
  completed: boolean;
  completedAt: string | null;
  previousLessonId: number | null;
  nextLessonId: number | null;
  chapterId: number;
  chapterTitle: string;
}

export interface CourseProgressDTO {
  courseId: number;
  courseName: string;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  currentLessonId: number | null;
  currentLessonTitle: string | null;
}

export interface StudentPlanDTO {
  planName: string;
  hasFullAccess: boolean;
  message: string;
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

  // ===== NOUVELLES APIs PUBLIQUES =====
  
  // Liste des cours publiés (frontend public)
  getPublicCourses: async (): Promise<CoursePublic[]> => {
    const response = await api.get('/courses');
    return response.data.data;
  },

  // Détails d'un cours avec chapitres (frontend public)
  getPublicCourseById: async (courseId: number): Promise<CoursePublic> => {
    const response = await api.get(`/courses/${courseId}`);
    return response.data.data;
  },

  // Contenu d'un chapitre spécifique (frontend public)
  getChapterContent: async (courseId: number, chapterId: number): Promise<ChapterPublic> => {
    const response = await api.get(`/courses/${courseId}/chapters/${chapterId}`);
    return response.data.data;
  },

  // ===== STUDENT API =====

  // Obtenir un cours avec ses chapitres et leçons (étudiant authentifié)
  getStudentCourse: async (courseId: number): Promise<StudentCourseDTO> => {
    const response = await api.get(`/student/courses/${courseId}`);
    // L'API peut retourner { data: {...} } ou directement l'objet
    return response.data?.data || response.data;
  },

  // Obtenir une leçon spécifique
  getStudentLesson: async (lessonId: number): Promise<StudentLessonDTO> => {
    const response = await api.get(`/student/lessons/${lessonId}`);
    return response.data?.data || response.data;
  },

  // Obtenir les leçons d'un chapitre
  getChapterLessons: async (chapterId: number): Promise<StudentLessonDTO[]> => {
    const response = await api.get(`/student/chapters/${chapterId}/lessons`);
    return response.data?.data || response.data;
  },

  // Marquer une leçon comme terminée
  markLessonComplete: async (lessonId: number): Promise<StudentLessonDTO> => {
    const response = await api.post(`/student/lessons/${lessonId}/complete`);
    return response.data?.data || response.data;
  },

  // Annuler la complétion d'une leçon
  markLessonIncomplete: async (lessonId: number): Promise<StudentLessonDTO> => {
    const response = await api.post(`/student/lessons/${lessonId}/incomplete`);
    return response.data?.data || response.data;
  },

  // Obtenir la progression d'un cours
  getCourseProgress: async (courseId: number): Promise<CourseProgressDTO> => {
    const response = await api.get(`/student/courses/${courseId}/progress`);
    return response.data?.data || response.data;
  },

  // Obtenir les infos du plan de l'utilisateur
  getStudentPlan: async (): Promise<StudentPlanDTO> => {
    const response = await api.get(`/student/plan`);
    return response.data?.data || response.data;
  },
};
