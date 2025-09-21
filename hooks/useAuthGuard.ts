import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { router } from 'expo-router';

interface UseAuthGuardOptions {
  allowedRoles?: ('patient' | 'health_worker' | 'admin')[];
  redirectTo?: string;
  requireAuth?: boolean;
}

export const useAuthGuard = (options: UseAuthGuardOptions = {}) => {
  const { 
    allowedRoles = ['patient', 'health_worker', 'admin'], 
    redirectTo = '/',
    requireAuth = true 
  } = options;
  
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return; // Wait for auth to load

    // If authentication is required but user is not logged in
    if (requireAuth && !user) {
      console.log('AuthGuard: User not authenticated, redirecting to:', redirectTo);
      router.replace(redirectTo as any);
      return;
    }

    // If user is authenticated, check role permissions
    if (user && allowedRoles.length > 0) {
      const hasPermission = allowedRoles.includes(user.role as any);
      
      if (!hasPermission) {
        console.log('AuthGuard: User role not allowed:', user.role, 'Allowed:', allowedRoles);
        
        // Redirect based on user's actual role
        switch (user.role) {
          case 'patient':
            router.replace('/(patient)' as any);
            break;
          case 'health_worker':
            router.replace('/(health-worker)' as any);
            break;
          case 'admin':
            router.replace('/(admin)' as any);
            break;
          default:
            router.replace('/' as any);
        }
      }
    }
  }, [user, loading, allowedRoles, redirectTo, requireAuth]);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    hasPermission: user ? allowedRoles.includes(user.role as any) : false
  };
};

export default useAuthGuard;
