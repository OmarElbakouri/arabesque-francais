import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'NORMAL' | 'PREMIUM' | 'VIP' | 'ADMIN';
export type UserStatus = 'ACTIF' | 'EXPIRE' | 'EN_ATTENTE' | 'SUSPENDU';

interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  dateInscription: string;
  dateExpiration?: string;
  credits?: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        // Mock login - Admin user for testing
        const mockUser: User = {
          id: '1',
          nom: 'المسؤول',
          prenom: 'مدير',
          email,
          telephone: '+212600000000',
          role: 'ADMIN',
          status: 'ACTIF',
          dateInscription: new Date().toISOString(),
          credits: 1000,
        };
        set({ user: mockUser, isAuthenticated: true });
      },
      register: async (data: any) => {
        // Mock register
        const mockUser: User = {
          id: '1',
          ...data,
          role: 'NORMAL',
          status: 'ACTIF',
          dateInscription: new Date().toISOString(),
        };
        set({ user: mockUser, isAuthenticated: true });
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      updateUser: (data: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        }));
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
