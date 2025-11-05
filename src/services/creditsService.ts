import api from '@/lib/api';

export const creditsService = {
  getUserCredits: async (userId: string) => {
    const response = await api.get(`/credits/user/${userId}`);
    return response.data;
  },
};
