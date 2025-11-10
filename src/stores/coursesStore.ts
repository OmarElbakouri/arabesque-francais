import { create } from 'zustand';

export interface Course {
  id: string;
  titre: string;
  description: string;
  niveau: string;
  prix: number;
  duree: string;
  thumbnail: string;
  enseignant: string;
  progression: number;
  chapitres: number;
  etudiants: number;
  gratuit: boolean;
  publie: boolean;
}

interface CoursesState {
  courses: Course[];
  enrolledCourses: string[];
  addCourse: (course: Course) => void;
  enrollCourse: (courseId: string) => void;
  updateProgress: (courseId: string, progress: number) => void;
}

const mockCourses: Course[] = [
  {
    id: '1',
    titre: 'Formation en français',
    description: 'Formation complète en langue française pour tous les niveaux',
    niveau: 'Tous niveaux',
    prix: 499,
    duree: '40 ساعة',
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173',
    enseignant: 'د. محمد الإدريسي',
    progression: 0,
    chapitres: 25,
    etudiants: 2790,
    gratuit: false,
    publie: true,
  },
];

export const useCoursesStore = create<CoursesState>((set) => ({
  courses: mockCourses,
  enrolledCourses: ['1', '2'],
  addCourse: (course) =>
    set((state) => ({ courses: [...state.courses, course] })),
  enrollCourse: (courseId) =>
    set((state) => ({
      enrolledCourses: [...state.enrolledCourses, courseId],
    })),
  updateProgress: (courseId, progress) =>
    set((state) => ({
      courses: state.courses.map((c) =>
        c.id === courseId ? { ...c, progression: progress } : c
      ),
    })),
}));
