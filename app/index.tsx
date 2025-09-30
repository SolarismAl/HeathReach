import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

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
      hasRedirected.current = false; // Reset for next login
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
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>HealthReach</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
    backgroundColor: '#4A90E2',
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
    paddingHorizontal: 40,
  },
  logoIcon: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  appName: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 32,
  },
  tagline: {
    fontSize: 28,
    fontWeight: '300',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 50,
  },
  getStartedButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 32,
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 12,
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A90E2',
    letterSpacing: -0.3,
  },
  debugButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  debugText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    opacity: 0.8,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 16,
    fontWeight: '300',
    letterSpacing: -0.3,
  },
});