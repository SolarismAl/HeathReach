import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notificationService from '../services/notifications';

interface NotificationPreferences {
  appointments: boolean;
  reminders: boolean;
  services: boolean;
  admin: boolean;
  marketing: boolean;
  sound: boolean;
  vibration: boolean;
  badge: boolean;
}

const defaultPreferences: NotificationPreferences = {
  appointments: true,
  reminders: true,
  services: true,
  admin: true,
  marketing: false,
  sound: true,
  vibration: true,
  badge: true,
};

export default function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const stored = await AsyncStorage.getItem('notification_preferences');
      if (stored) {
        setPreferences({ ...defaultPreferences, ...JSON.parse(stored) });
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (newPreferences: NotificationPreferences) => {
    try {
      await AsyncStorage.setItem('notification_preferences', JSON.stringify(newPreferences));
      setPreferences(newPreferences);
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
      Alert.alert('Error', 'Failed to save notification preferences');
    }
  };

  const togglePreference = (key: keyof NotificationPreferences) => {
    const newPreferences = { ...preferences, [key]: !preferences[key] };
    savePreferences(newPreferences);
  };

  const testNotification = async () => {
    try {
      await notificationService.scheduleLocalNotification({
        type: 'general',
        title: 'Test Notification',
        body: 'This is a test notification from HealthReach',
      });
      Alert.alert('Success', 'Test notification sent!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  const clearBadge = async () => {
    try {
      await notificationService.clearBadge();
      Alert.alert('Success', 'Badge count cleared');
    } catch (error) {
      Alert.alert('Error', 'Failed to clear badge count');
    }
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all notification settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => savePreferences(defaultPreferences)
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="notifications" size={50} color="#666" />
        <Text style={styles.loadingText}>Loading notification settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="notifications" size={32} color="#2196F3" />
        <Text style={styles.headerTitle}>Notification Settings</Text>
        <Text style={styles.headerSubtitle}>
          Customize your notification preferences
        </Text>
      </View>

      {/* Notification Types */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Types</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="calendar" size={20} color="#2196F3" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Appointments</Text>
              <Text style={styles.settingDescription}>
                Booking confirmations and updates
              </Text>
            </View>
          </View>
          <Switch
            value={preferences.appointments}
            onValueChange={() => togglePreference('appointments')}
            trackColor={{ false: '#E0E0E0', true: '#2196F3' }}
            thumbColor={preferences.appointments ? '#FFFFFF' : '#F4F3F4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="alarm" size={20} color="#FF9800" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Reminders</Text>
              <Text style={styles.settingDescription}>
                Appointment reminders and follow-ups
              </Text>
            </View>
          </View>
          <Switch
            value={preferences.reminders}
            onValueChange={() => togglePreference('reminders')}
            trackColor={{ false: '#E0E0E0', true: '#FF9800' }}
            thumbColor={preferences.reminders ? '#FFFFFF' : '#F4F3F4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="medical" size={20} color="#4CAF50" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Health Services</Text>
              <Text style={styles.settingDescription}>
                New services and health updates
              </Text>
            </View>
          </View>
          <Switch
            value={preferences.services}
            onValueChange={() => togglePreference('services')}
            trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
            thumbColor={preferences.services ? '#FFFFFF' : '#F4F3F4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="shield" size={20} color="#D32F2F" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Admin Announcements</Text>
              <Text style={styles.settingDescription}>
                Important system announcements
              </Text>
            </View>
          </View>
          <Switch
            value={preferences.admin}
            onValueChange={() => togglePreference('admin')}
            trackColor={{ false: '#E0E0E0', true: '#D32F2F' }}
            thumbColor={preferences.admin ? '#FFFFFF' : '#F4F3F4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="megaphone" size={20} color="#9C27B0" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Marketing</Text>
              <Text style={styles.settingDescription}>
                Promotional offers and news
              </Text>
            </View>
          </View>
          <Switch
            value={preferences.marketing}
            onValueChange={() => togglePreference('marketing')}
            trackColor={{ false: '#E0E0E0', true: '#9C27B0' }}
            thumbColor={preferences.marketing ? '#FFFFFF' : '#F4F3F4'}
          />
        </View>
      </View>

      {/* Notification Behavior */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Behavior</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="volume-high" size={20} color="#666" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Sound</Text>
              <Text style={styles.settingDescription}>
                Play sound for notifications
              </Text>
            </View>
          </View>
          <Switch
            value={preferences.sound}
            onValueChange={() => togglePreference('sound')}
            trackColor={{ false: '#E0E0E0', true: '#666' }}
            thumbColor={preferences.sound ? '#FFFFFF' : '#F4F3F4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="phone-portrait" size={20} color="#666" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Vibration</Text>
              <Text style={styles.settingDescription}>
                Vibrate for notifications
              </Text>
            </View>
          </View>
          <Switch
            value={preferences.vibration}
            onValueChange={() => togglePreference('vibration')}
            trackColor={{ false: '#E0E0E0', true: '#666' }}
            thumbColor={preferences.vibration ? '#FFFFFF' : '#F4F3F4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="notifications" size={20} color="#666" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Badge Count</Text>
              <Text style={styles.settingDescription}>
                Show unread count on app icon
              </Text>
            </View>
          </View>
          <Switch
            value={preferences.badge}
            onValueChange={() => togglePreference('badge')}
            trackColor={{ false: '#E0E0E0', true: '#666' }}
            thumbColor={preferences.badge ? '#FFFFFF' : '#F4F3F4'}
          />
        </View>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        
        <TouchableOpacity style={styles.actionButton} onPress={testNotification}>
          <Ionicons name="send" size={20} color="#2196F3" />
          <Text style={styles.actionButtonText}>Send Test Notification</Text>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={clearBadge}>
          <Ionicons name="refresh" size={20} color="#4CAF50" />
          <Text style={styles.actionButtonText}>Clear Badge Count</Text>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={resetToDefaults}>
          <Ionicons name="refresh-circle" size={20} color="#FF9800" />
          <Text style={styles.actionButtonText}>Reset to Defaults</Text>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>
      </View>

      {/* Device Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Device Information</Text>
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceInfoText}>
            Push Token: {notificationService.getExpoPushToken() ? 'Registered' : 'Not Available'}
          </Text>
          <Text style={styles.deviceInfoText}>
            Platform: {require('react-native').Platform.OS}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    flex: 1,
    marginLeft: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  deviceInfo: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
  },
  deviceInfoText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
});
