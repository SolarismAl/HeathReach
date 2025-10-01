import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/neumorphism';

const { width, height } = Dimensions.get('window');

export default function NotAvailableScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/');
    } catch (error) {
      console.error('Sign out error:', error);
      router.replace('/');
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'health_worker':
        return 'Health Worker';
      default:
        return 'User';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gradient}>
        {/* Background Icons */}
        <View style={styles.backgroundIcons}>
          <Ionicons name="desktop" size={40} color="rgba(255, 255, 255, 0.05)" style={[styles.bgIcon, { top: '15%', left: '10%' }]} />
          <Ionicons name="laptop" size={35} color="rgba(255, 255, 255, 0.05)" style={[styles.bgIcon, { top: '25%', right: '15%' }]} />
          <Ionicons name="globe" size={30} color="rgba(255, 255, 255, 0.05)" style={[styles.bgIcon, { top: '45%', left: '15%' }]} />
          <Ionicons name="business" size={45} color="rgba(255, 255, 255, 0.05)" style={[styles.bgIcon, { top: '60%', right: '10%' }]} />
          <Ionicons name="settings" size={38} color="rgba(255, 255, 255, 0.05)" style={[styles.bgIcon, { top: '75%', left: '20%' }]} />
        </View>

        {/* Main Content */}
        <View style={styles.contentContainer}>
          {/* Top Section - Icon & Message */}
          <View style={styles.topSection}>
            <View style={styles.iconContainer}>
              <Ionicons name="desktop-outline" size={80} color="#FFFFFF" />
            </View>
            
            <Text style={styles.title}>
              {getRoleDisplayName(user?.role || '')} Access
            </Text>
            
            <Text style={styles.subtitle}>
              Not Available on Mobile
            </Text>
            
            <Text style={styles.description}>
              {user?.role === 'admin' ? 'Administrator' : 'Health Worker'} features are only available on the web platform. Please access your dashboard through a web browser.
            </Text>

            <View style={styles.webAccessInfo}>
              <View style={styles.infoItem}>
                <Ionicons name="globe-outline" size={24} color="rgba(255, 255, 255, 0.9)" />
                <Text style={styles.infoText}>Access via Web Browser</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Ionicons name="desktop-outline" size={24} color="rgba(255, 255, 255, 0.9)" />
                <Text style={styles.infoText}>Full Dashboard Features</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Ionicons name="settings-outline" size={24} color="rgba(255, 255, 255, 0.9)" />
                <Text style={styles.infoText}>Complete Management Tools</Text>
              </View>
            </View>
          </View>

          {/* Bottom Section - Actions */}
          <View style={styles.bottomSection}>
            <Text style={styles.userInfo}>
              Signed in as: {user?.name}
            </Text>
            <Text style={styles.userRole}>
              Role: {getRoleDisplayName(user?.role || '')}
            </Text>
            
            <TouchableOpacity 
              style={styles.signOutButton}
              onPress={handleSignOut}
              activeOpacity={0.9}
            >
              <Ionicons name="log-out-outline" size={20} color="#4A90E2" />
              <Text style={styles.signOutText}>Sign Out</Text>
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
    paddingHorizontal: spacing.lg,
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xxl + spacing.lg,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: borderRadius.xxl + borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...shadows.floating,
  },
  title: {
    ...typography.h2,
    color: colors.surface,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.h4,
    fontWeight: '300',
    color: colors.surface,
    textAlign: 'center',
    marginBottom: spacing.lg,
    opacity: 0.9,
  },
  description: {
    ...typography.body1,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  webAccessInfo: {
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  infoText: {
    ...typography.body1,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: spacing.md,
    fontWeight: '500',
  },
  bottomSection: {
    paddingBottom: spacing.xxl + spacing.md,
    alignItems: 'center',
  },
  userInfo: {
    ...typography.body1,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  userRole: {
    ...typography.body2,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  signOutButton: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.round,
    alignItems: 'center',
    flexDirection: 'row',
    ...shadows.floating,
  },
  signOutText: {
    ...typography.body1,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: spacing.sm,
  },
});
