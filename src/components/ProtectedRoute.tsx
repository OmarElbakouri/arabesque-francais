import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore, UserRole } from '@/stores/authStore';
import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  const [orientationChecked, setOrientationChecked] = useState(false);
  const [needsOrientation, setNeedsOrientation] = useState(false);
  const previousPathRef = useRef<string>('');

  useEffect(() => {
    // Reset states when coming from orientation test page
    if (previousPathRef.current === '/orientation-test' && location.pathname !== '/orientation-test') {
      setNeedsOrientation(false);
      setOrientationChecked(true);
      previousPathRef.current = location.pathname;
      return;
    }
    previousPathRef.current = location.pathname;

    const checkOrientation = async () => {
      // Skip for ADMIN and COMMERCIAL users
      if (user?.role === 'ADMIN' || user?.role === 'COMMERCIAL') {
        setOrientationChecked(true);
        return;
      }

      // Skip if already on orientation test page
      if (location.pathname === '/orientation-test') {
        setOrientationChecked(true);
        return;
      }

      try {
        const response = await api.get('/orientation-test/status');
        if (!response.data.completed) {
          setNeedsOrientation(true);
        } else {
          setNeedsOrientation(false);
        }
      } catch (error) {
        console.error('Failed to check orientation status:', error);
      } finally {
        setOrientationChecked(true);
      }
    };

    if (isAuthenticated && user) {
      checkOrientation();
    } else {
      setOrientationChecked(true);
    }
  }, [isAuthenticated, user, location.pathname]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect COMMERCIAL users to their dashboard
  if (user?.role === 'COMMERCIAL') {
    return <Navigate to="/commercial" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/courses" replace />;
  }

  // Wait for orientation check
  if (!orientationChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to orientation test if needed
  if (needsOrientation && location.pathname !== '/orientation-test') {
    return <Navigate to="/orientation-test" replace />;
  }

  return <>{children}</>;
};
