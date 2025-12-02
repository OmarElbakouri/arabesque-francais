import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/services/authService';
import { creditsService } from '@/services/creditsService';
import { courseService } from '@/services/courseService';

export type UserRole = 'USER' | 'COMMERCIAL' | 'ADMIN';
export type UserPlan = 'FREE' | 'NORMAL' | 'VIP';
export type UserStatus = 'ACTIF' | 'EXPIRE' | 'EN_ATTENTE' | 'SUSPENDU';

interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: UserRole;
  plan: UserPlan;
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
  fetchUserPlan: () => Promise<void>;
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
            
            // Store JWT token, role and plan
            localStorage.setItem('jwt_token', response.data.token);
            localStorage.setItem('role', response.data.role || 'USER');
            localStorage.setItem('plan', response.data.plan || 'FREE');
            
            // Determine role - ADMIN/COMMERCIAL have special roles, others are USER
            let role: UserRole = 'USER';
            if (response.data.role === 'ADMIN') {
              role = 'ADMIN';
            } else if (response.data.role === 'COMMERCIAL') {
              role = 'COMMERCIAL';
            }
            
            // Create user object with role and plan from backend
            const user: User = {
              id: response.data.userId,
              nom: response.data.lastName,
              prenom: response.data.firstName,
              email: response.data.email,
              telephone: '',
              role: role,
              plan: (response.data.plan as UserPlan) || 'FREE',
              status: 'ACTIF',
              dateInscription: new Date().toISOString(),
            };
            
            set({ user, isAuthenticated: true, isLoading: false });
            
            // Fetch plan and credits after login
            get().fetchUserPlan();
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
            // New registrations - plan will be fetched from dashboard
            const user: User = {
              id: response.data.userId,
              nom: response.data.lastName,
              prenom: response.data.firstName,
              email: response.data.email,
              telephone: data.telephone,
              role: 'USER',
              plan: 'FREE', // Will be updated by fetchUserPlan
              status: 'ACTIF',
              dateInscription: new Date().toISOString(),
              credits: 30, // Default credits for new users
            };
            
            set({ user, isAuthenticated: true, isLoading: false });
            
            // Fetch actual plan from dashboard
            get().fetchUserPlan();
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

      fetchUserPlan: async () => {
        try {
          const planData = await courseService.getStudentPlan();
          if (planData && planData.planName) {
            // Map planName to our plan types
            let plan: UserPlan = 'FREE';
            const planName = planData.planName.toUpperCase();
            if (planName === 'NORMAL' || planName === 'STANDARD') {
              plan = 'NORMAL';
            } else if (planName === 'VIP' || planName === 'PREMIUM') {
              plan = 'VIP';
            } else if (planName === 'FREE' || planName === 'GRATUIT') {
              plan = 'FREE';
            }
            
            console.log('Fetched plan from API:', planData.planName, '-> mapped to:', plan);
            
            set((state) => ({
              user: state.user ? { ...state.user, plan } : null,
            }));
            
            // Also update localStorage
            localStorage.setItem('plan', plan);
          }
        } catch (error) {
          console.error('Failed to fetch user plan:', error);
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
