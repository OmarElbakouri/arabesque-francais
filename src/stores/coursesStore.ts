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
    titre: 'المستوى A1 - المبتدئين',
    description: 'ابدأ رحلتك في تعلم اللغة الفرنسية من الصفر',
    niveau: 'A1',
    prix: 0,
    duree: '20 ساعة',
    thumbnail: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d',
    enseignant: 'د. محمد الإدريسي',
    progression: 65,
    chapitres: 15,
    etudiants: 1250,
    gratuit: true,
    publie: true,
  },
  {
    id: '2',
    titre: 'المستوى A2 - ابتدائي',
    description: 'طور مهاراتك الأساسية في اللغة الفرنسية',
    niveau: 'A2',
    prix: 299,
    duree: '25 ساعة',
    thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f',
    enseignant: 'د. محمد الإدريسي',
    progression: 30,
    chapitres: 18,
    etudiants: 890,
    gratuit: false,
    publie: true,
  },
  {
    id: '3',
    titre: 'المستوى B1 - متوسط',
    description: 'تعلم التواصل بثقة في المواقف اليومية',
    niveau: 'B1',
    prix: 399,
    duree: '30 ساعة',
    thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b',
    enseignant: 'د. محمد الإدريسي',
    progression: 0,
    chapitres: 20,
    etudiants: 650,
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
