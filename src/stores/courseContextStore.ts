import { create } from 'zustand';

interface CourseContext {
  courseId: number | null;
  courseName: string | null;
  chapterId: number | null;
  chapterTitle: string | null;
}

interface CourseContextStore extends CourseContext {
  setCourseContext: (context: CourseContext) => void;
  clearCourseContext: () => void;
}

export const useCourseContextStore = create<CourseContextStore>((set) => ({
  courseId: null,
  courseName: null,
  chapterId: null,
  chapterTitle: null,
  setCourseContext: (context) => set(context),
  clearCourseContext: () => set({ courseId: null, courseName: null, chapterId: null, chapterTitle: null }),
}));
