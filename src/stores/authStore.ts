import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/services/authService';
import { creditsService } from '@/services/creditsService';

export type UserRole = 'FREE' | 'NORMAL' | 'PREMIUM' | 'VIP' | 'COMMERCIAL' | 'ADMIN';
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
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  fetchUserCredits: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await authService.login({ email, password });
          
          if (response.success) {
            // Clear all localStorage data before storing new login data
            localStorage.clear();
            
            // Store JWT token and role
            localStorage.setItem('jwt_token', response.data.token);
            localStorage.setItem('role', response.data.role || 'NORMAL');
            
            // Create user object with role from backend
            const user: User = {
              id: response.data.userId,
              nom: response.data.lastName,
              prenom: response.data.firstName,
              email: response.data.email,
              telephone: '',
              role: (response.data.role as UserRole) || 'NORMAL',
              status: 'ACTIF',
              dateInscription: new Date().toISOString(),
            };
            
            set({ user, isAuthenticated: true, isLoading: false });
            
            // Fetch credits after login
            get().fetchUserCredits();
          } else {
            throw new Error(response.message);
          }
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || error.message || 'Erreur de connexion',
            isLoading: false 
          });
          throw error;
        }
      },
      
      register: async (data: any) => {
        try {
          set({ isLoading: true, error: null });
          
          const registerData: any = {
            email: data.email,
            password: data.password,
            firstName: data.prenom,
            lastName: data.nom,
            phoneNumber: data.telephone,
          };
          
          // Ajouter le code promo s'il est fourni
          if (data.promoCode && data.promoCode.trim() !== '') {
            registerData.promoCode = data.promoCode.toUpperCase();
          }
          
          const response = await authService.register(registerData);
          
          if (response.success) {
            // Store JWT token
            localStorage.setItem('jwt_token', response.data.token);
            
            // Create user object
            // New registrations always get NORMAL role from backend
            const user: User = {
              id: response.data.userId,
              nom: response.data.lastName,
              prenom: response.data.firstName,
              email: response.data.email,
              telephone: data.telephone,
              role: (response.data.role as UserRole) || 'NORMAL',
              status: 'ACTIF',
              dateInscription: new Date().toISOString(),
              credits: 30, // Default credits for new users
            };
            
            set({ user, isAuthenticated: true, isLoading: false });
          } else {
            throw new Error(response.message);
          }
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || error.message || 'Erreur d\'inscription',
            isLoading: false 
          });
          throw error;
        }
      },
      
      logout: () => {
        localStorage.clear();
        set({ user: null, isAuthenticated: false });
      },
      
      updateUser: (data: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        }));
      },
      
      fetchUserCredits: async () => {
        try {
          const state = get();
          if (state.user) {
            const response = await creditsService.getUserCredits(state.user.id);
            if (response.success) {
              set((state) => ({
                user: state.user ? { ...state.user, credits: response.data.remaining } : null,
              }));
            }
          }
        } catch (error) {
          console.error('Failed to fetch credits:', error);
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
