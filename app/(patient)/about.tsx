import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { neumorphism, colors, spacing, borderRadius, typography, shadows } from '../../styles/neumorphism';

export default function AboutHealthReachScreen() {
  const handleContactPress = (type: 'email' | 'phone' | 'website') => {
    switch (type) {
      case 'email':
        Linking.openURL('mailto:support@healthreach.com');
        break;
      case 'phone':
        Linking.openURL('tel:+1234567890');
        break;
      case 'website':
        Linking.openURL('https://healthreach.com');
        break;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      {/* <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About HealthReach</Text>
        <View style={styles.placeholder} />
      </View> */}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* App Logo/Icon */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="medical" size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.appName}>HealthReach</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        {/* Mission Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="heart" size={20} color="#4A90E2" />
            <Text style={styles.sectionTitle}>Our Mission</Text>
          </View>
          <Text style={styles.sectionText}>
            HealthReach is dedicated to making healthcare more accessible and convenient for everyone. 
            We connect patients with healthcare providers, streamline appointment booking, and ensure 
            quality healthcare services are just a tap away.
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="star" size={20} color="#4A90E2" />
            <Text style={styles.sectionTitle}>Key Features</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="calendar" size={16} color="#4A90E2" />
            <Text style={styles.featureText}>Easy appointment booking</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="time" size={16} color="#4A90E2" />
            <Text style={styles.featureText}>Real-time availability checking</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="location" size={16} color="#4A90E2" />
            <Text style={styles.featureText}>Find nearby health centers</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="notifications" size={16} color="#4A90E2" />
            <Text style={styles.featureText}>Appointment reminders</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="shield-checkmark" size={16} color="#4A90E2" />
            <Text style={styles.featureText}>Secure and private</Text>
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="mail" size={20} color="#4A90E2" />
            <Text style={styles.sectionTitle}>Contact Us</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => handleContactPress('email')}
          >
            <Ionicons name="mail-outline" size={20} color="#4A90E2" />
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Email Support</Text>
              <Text style={styles.contactValue}>support@healthreach.com</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#CCC" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => handleContactPress('phone')}
          >
            <Ionicons name="call-outline" size={20} color="#4A90E2" />
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Phone Support</Text>
              <Text style={styles.contactValue}>+1 (234) 567-890</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#CCC" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => handleContactPress('website')}
          >
            <Ionicons name="globe-outline" size={20} color="#4A90E2" />
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Website</Text>
              <Text style={styles.contactValue}>www.healthreach.com</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#CCC" />
          </TouchableOpacity>
        </View>

        {/* Legal Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text" size={20} color="#4A90E2" />
            <Text style={styles.sectionTitle}>Legal</Text>
          </View>
          
          <TouchableOpacity style={styles.legalItem}>
            <Text style={styles.legalText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={16} color="#CCC" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.legalItem}>
            <Text style={styles.legalText}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={16} color="#CCC" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.legalItem}>
            <Text style={styles.legalText}>Data Usage Policy</Text>
            <Ionicons name="chevron-forward" size={16} color="#CCC" />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2025 HealthReach. All rights reserved.
          </Text>
          <Text style={styles.footerSubtext}>
            Made with ❤️ for better healthcare access
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xxl + spacing.md,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    ...typography.h6,
    color: colors.surface,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: '#FFFFFF',
    marginBottom: spacing.md,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.elevated,
  },
  appName: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  version: {
    ...typography.body2,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    ...shadows.subtle,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h6,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  sectionText: {
    ...typography.body1,
    lineHeight: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  featureText: {
    ...typography.body1,
    marginLeft: spacing.md,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  contactContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  contactLabel: {
    ...typography.body2,
    marginBottom: spacing.xs,
  },
  contactValue: {
    ...typography.body1,
    fontWeight: '500',
  },
  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  legalText: {
    ...typography.body1,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  footerText: {
    ...typography.body2,
    marginBottom: spacing.xs,
  },
  footerSubtext: {
    ...typography.caption,
  },
});
