import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/neumorphism';

const { width, height } = Dimensions.get('window');

export default function LandingPage() {
  const { user, loading, forceLogout } = useAuth();
  const hasRedirected = useRef(false);

  useEffect(() => {
    console.log('=== LANDING PAGE NAVIGATION CHECK ===');
    console.log('LandingPage - user:', user);
    console.log('LandingPage - user role:', user?.role);
    console.log('LandingPage - loading:', loading);
    console.log('LandingPage - hasRedirected:', hasRedirected.current);
    
    // Reset redirect flag when user is null (after logout)
    if (!user) {
      hasRedirected.current = false;
    }
    
    if (!loading && user && !hasRedirected.current) {
      console.log('LandingPage - User is authenticated, redirecting based on role:', user.role);
      hasRedirected.current = true;
      
      // Redirect authenticated users to their appropriate dashboard
      switch (user.role) {
        case 'admin':
        case 'health_worker':
          console.log('LandingPage - Admin/Health Worker account detected, redirecting to not-available screen');
          router.replace('/not-available');
          break;
        case 'patient':
          console.log('LandingPage - Redirecting to patient dashboard');
          router.replace('/(patient)');
          break;
        default:
          console.log('LandingPage - Unknown role, redirecting to auth:', user.role);
          router.replace('/auth');
      }
    } else if (!loading && !user) {
      console.log('LandingPage - No user, staying on landing page');
    } else {
      console.log('LandingPage - Still loading, waiting...');
    }
  }, [user, loading]);

  const handleGetStarted = () => {
    router.push('/auth');
  };


  console.log('LandingPage render - loading:', loading, 'user:', user);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.gradient, styles.loadingContainer]}>
          <View style={styles.logoIcon}>
            <Ionicons name="medical" size={60} color="#FFFFFF" />
          </View>
          <Text style={styles.appName}>HealthReach</Text>
          <ActivityIndicator size="large" color="#FFFFFF" style={{ marginTop: 20 }} />
          <Text style={styles.loadingText}>Initializing...</Text>
          <Text style={styles.loadingSubtext}>
            If this takes more than 10 seconds, please restart the app
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} translucent={false} />
      <View style={styles.gradient}>
        {/* Background Health Icons */}
        <View style={styles.backgroundIcons}>
          <Ionicons name="heart" size={40} color="rgba(255, 255, 255, 0.05)" style={[styles.bgIcon, { top: '15%', left: '10%' }]} />
          <Ionicons name="fitness" size={35} color="rgba(255, 255, 255, 0.05)" style={[styles.bgIcon, { top: '25%', right: '15%' }]} />
          <Ionicons name="medical" size={30} color="rgba(255, 255, 255, 0.05)" style={[styles.bgIcon, { top: '45%', left: '15%' }]} />
          <Ionicons name="pulse" size={45} color="rgba(255, 255, 255, 0.05)" style={[styles.bgIcon, { top: '60%', right: '10%' }]} />
          <Ionicons name="body" size={38} color="rgba(255, 255, 255, 0.05)" style={[styles.bgIcon, { top: '75%', left: '20%' }]} />
        </View>

        {/* Main Content */}
        <View style={styles.contentContainer}>
          {/* Top Section - Logo & App Name */}
          <View style={styles.topSection}>
            <View style={styles.logoIcon}>
              <Ionicons name="medical" size={60} color="#FFFFFF" />
            </View>
            <Text style={styles.appName}>HealthReach</Text>
            <Text style={styles.tagline}>
              Your health, our priority
            </Text>
            <Text style={styles.description}>
              Connect with healthcare providers and manage your wellness journey with ease
            </Text>
          </View>

          {/* Bottom Section - CTA */}
          <View style={styles.bottomSection}>
            <TouchableOpacity 
              style={styles.getStartedButton}
              onPress={handleGetStarted}
              activeOpacity={0.9}
            >
              <Text style={styles.getStartedText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    backgroundColor: colors.primary,
    position: 'relative',
  },
  backgroundIcons: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  bgIcon: {
    position: 'absolute',
  },
  contentContainer: {
    flex: 1,
    zIndex: 1,
    justifyContent: 'space-between',
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  logoIcon: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.floating,
  },
  appName: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.surface,
    letterSpacing: -0.5,
    marginBottom: spacing.xl,
  },
  tagline: {
    ...typography.h3,
    fontWeight: '300',
    color: colors.surface,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 34,
  },
  description: {
    ...typography.body1,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl + spacing.md,
  },
  getStartedButton: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md + spacing.xs,
    borderRadius: borderRadius.round,
    alignItems: 'center',
    ...shadows.floating,
  },
  getStartedText: {
    ...typography.h6,
    fontWeight: '600',
    color: colors.primary,
  },
  debugButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  debugText: {
    ...typography.body2,
    fontWeight: '500',
    color: colors.surface,
    opacity: 0.8,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.h6,
    color: colors.surface,
    marginTop: spacing.md,
    fontWeight: '300',
  },
  loadingSubtext: {
    ...typography.body2,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: spacing.sm,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
});