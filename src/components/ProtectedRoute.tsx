import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore, UserRole } from '@/stores/authStore';
import { useEffect, useState, useRef, useCallback } from 'react';
import api from '@/lib/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  const [status, setStatus] = useState<'loading' | 'ready' | 'needs-orientation'>('loading');
  
  // Use refs to track state across renders without triggering re-renders
  const isCheckingRef = useRef(false);
  const checkedForUserRef = useRef<number | null>(null);
  const orientationCompletedRef = useRef(false);

  // Check if this user type needs orientation check
  const needsOrientationCheck = useCallback(() => {
    if (!user) return false;
    if (user.role === 'ADMIN' || user.role === 'COMMERCIAL') return false;
    if (location.pathname === '/orientation-test') return false;
    return true;
  }, [user, location.pathname]);

  useEffect(() => {
    // If coming from orientation test with success flag, mark as completed
    const fromOrientationTest = (location.state as any)?.fromOrientationTest === true;
    if (fromOrientationTest) {
      orientationCompletedRef.current = true;
      sessionStorage.setItem('orientationCompleted', 'true');
      setStatus('ready');
      return;
    }

    // Not authenticated - will redirect
    if (!isAuthenticated || !user) {
      setStatus('ready');
      return;
    }

    // Already on orientation test page - just render
    if (location.pathname === '/orientation-test') {
      setStatus('ready');
      return;
    }

    // Admin/Commercial don't need orientation
    if (!needsOrientationCheck()) {
      setStatus('ready');
      return;
    }

    // Already confirmed completed for this user
    if (orientationCompletedRef.current && checkedForUserRef.current === user.id) {
      setStatus('ready');
      return;
    }

    // User changed - reset tracking
    if (checkedForUserRef.current !== user.id) {
      checkedForUserRef.current = null;
      orientationCompletedRef.current = false;
      isCheckingRef.current = false;
    }

    // Check sessionStorage first (fast path)
    if (sessionStorage.getItem('orientationCompleted') === 'true') {
      orientationCompletedRef.current = true;
      checkedForUserRef.current = user.id;
      setStatus('ready');
      return;
    }

    // Already checking - don't start another check
    if (isCheckingRef.current) {
      return;
    }

    // Already checked for this user - use cached result
    if (checkedForUserRef.current === user.id) {
      setStatus(orientationCompletedRef.current ? 'ready' : 'needs-orientation');
      return;
    }

    // Need to check with backend
    const checkWithBackend = async () => {
      isCheckingRef.current = true;
      setStatus('loading');
      
      try {
        const response = await api.get('/orientation-test/status');
        checkedForUserRef.current = user.id;
        
        if (response.data.completed) {
          orientationCompletedRef.current = true;
          sessionStorage.setItem('orientationCompleted', 'true');
          setStatus('ready');
        } else {
          orientationCompletedRef.current = false;
          sessionStorage.removeItem('orientationCompleted');
          sessionStorage.removeItem('orientationResult');
          setStatus('needs-orientation');
        }
      } catch (error) {
        console.error('Failed to check orientation status:', error);
        // On error, allow access
        setStatus('ready');
      } finally {
        isCheckingRef.current = false;
      }
    };

    checkWithBackend();
  }, [isAuthenticated, user, location.pathname, location.state, needsOrientationCheck]);

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect COMMERCIAL users to their dashboard
  if (user?.role === 'COMMERCIAL' && !location.pathname.startsWith('/commercial')) {
    return <Navigate to="/commercial" replace />;
  }

  // Check required role
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/courses" replace />;
  }

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Needs orientation - redirect to test
  if (status === 'needs-orientation') {
    return <Navigate to="/orientation-test" replace />;
  }

  return <>{children}</>;
};
