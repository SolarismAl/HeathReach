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
    paddingHorizontal: 24,
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '300',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.9,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  webAccessInfo: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  infoText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 12,
    fontWeight: '500',
  },
  bottomSection: {
    paddingBottom: 50,
    alignItems: 'center',
  },
  userInfo: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 4,
    fontWeight: '500',
  },
  userRole: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 32,
  },
  signOutButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 32,
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 12,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
    marginLeft: 8,
    letterSpacing: -0.3,
  },
});
