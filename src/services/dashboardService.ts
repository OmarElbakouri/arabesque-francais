import api from '@/lib/api';

export interface DashboardResponse {
  userInfo: {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    role: 'USER' | 'COMMERCIAL' | 'ADMIN';
  };
  stats: {
    overallProgress: number;
    totalCertificates: number;
    totalBadges: number;
    totalLearningHours: number;
    completedLessons: number;
    totalLessons: number;
    totalXp: number;
    enrolledCoursesCount: number;
  };
  credits: {
    currentCredits: number;
    usedCredits: number;
    monthlyLimit: number | null;
    hasUnlimitedCredits: boolean;
  };
  enrolledCourses: Array<{
    courseId: number;
    courseName: string;
    courseDescription: string;
    courseImage: string;
    courseLevel: string;
    totalLessons: number;
    completedLessons: number;
    progressPercentage: number;
    enrolledAt: string;
  }>;
}

export const dashboardService = {
  getDashboard: async (userId: string) => {
    const response = await api.get<{ success: boolean; message: string; data: DashboardResponse }>(`/user/dashboard/${userId}`);
    // The backend returns data wrapped in a response object
    return response.data.data;
  },
};
