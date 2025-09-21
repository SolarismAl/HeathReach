import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('patient' | 'health_worker' | 'admin')[];
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = ['patient', 'health_worker', 'admin'],
  redirectTo = '/'
}) => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      // User is not authenticated, redirect to login
      router.replace(redirectTo as any);
    } else if (!loading && user && allowedRoles.length > 0) {
      // User is authenticated, check role permissions
      if (!allowedRoles.includes(user.role as any)) {
        // User doesn't have required role, redirect based on their role
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
  }, [user, loading, allowedRoles, redirectTo]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Checking authentication...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Redirecting to login...</Text>
      </View>
    );
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role as any)) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Access denied. Redirecting...</Text>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
  },
});

export default ProtectedRoute;
