import api from '@/lib/api';

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  promoCode?: string; // Optional - codes actifs: OMAR2025, SALES2025
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    role?: string;
    type?: string;
  };
}

export const authService = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  createAdmin: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/create-admin', data, {
      headers: {
        'X-Admin-Secret': 'bclt-admin-secret-2025',
      },
    });
    return response.data;
  },
};
