import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface CommercialRouteProps {
  children: React.ReactNode;
}

export const CommercialRoute = ({ children }: CommercialRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'COMMERCIAL') {
    return <Navigate to="/courses" replace />;
  }

  return <>{children}</>;
};
