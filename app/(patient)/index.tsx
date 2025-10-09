import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';
import { Appointment, Notification, User } from '../../types';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { neumorphism, colors, spacing, borderRadius, typography, shadows } from '../../styles/neumorphism';
import DebugHelper from '../../utils/debugHelper';

export default function PatientDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    loadDashboardData();
    
    // Update time every minute
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const loadDashboardData = async () => {
    try {
      DebugHelper.log('Loading dashboard data...');
      
      // Check token status before making requests
      const tokenStatus = await DebugHelper.checkTokenStatus();
      if (!tokenStatus.hasTokens) {
        DebugHelper.showErrorWithLogs(
          'No Tokens Found',
          'Cannot load dashboard data. Please login again.'
        );
        return;
      }
      
      const [profileResponse, appointmentsResponse, notificationsResponse] = await Promise.all([
        apiService.getProfile(),
        apiService.getAppointments(),
        apiService.getNotifications(),
      ]);

      if (profileResponse.success) {
        setUser(profileResponse.data || null);
        DebugHelper.log('✅ Profile loaded');
      } else {
        DebugHelper.log('❌ Profile load failed', profileResponse.message);
      }

      if (appointmentsResponse.success) {
        setUpcomingAppointments(appointmentsResponse.data || []);
        DebugHelper.log('✅ Appointments loaded', { count: appointmentsResponse.data?.length || 0 });
      } else {
        DebugHelper.log('❌ Appointments load failed', appointmentsResponse.message);
      }

      if (notificationsResponse.success) {
        setRecentNotifications(notificationsResponse.data || []);
        DebugHelper.log('✅ Notifications loaded', { count: notificationsResponse.data?.length || 0 });
      } else {
        DebugHelper.log('❌ Notifications load failed', notificationsResponse.message);
      }
    } catch (error: any) {
      DebugHelper.log('❌ Dashboard load error', error.message);
      DebugHelper.showErrorWithLogs('Error', 'Failed to load dashboard data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getCurrentPhilippinesDateTime = () => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Manila',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    const dateStr = currentDateTime.toLocaleDateString('en-US', options);
    
    const timeOptions: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Manila',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };
    const timeStr = currentDateTime.toLocaleTimeString('en-US', timeOptions);
    
    return { date: dateStr, time: timeStr };
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'confirmed':
        return styles.confirmedBadge;
      case 'pending':
        return styles.pendingBadge;
      case 'cancelled':
        return styles.cancelledBadge;
      case 'completed':
        return styles.completedBadge;
      default:
        return styles.pendingBadge;
    }
  };

  const getStatusTextStyle = (status: string) => {
    switch (status) {
      case 'confirmed':
        return styles.confirmedText;
      case 'pending':
        return styles.pendingText;
      case 'cancelled':
        return styles.cancelledText;
      case 'completed':
        return styles.completedText;
      default:
        return styles.pendingText;
    }
  };

  return (
    <ProtectedRoute allowedRoles={['patient']}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} translucent={false} />
        {loading ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="medical" size={50} color="#FFFFFF" />
            <Text style={styles.loadingText}>Loading your dashboard...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.container}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>
          Welcome back, {user?.name?.split(' ')[0] || 'Patient'}!
        </Text>
        <View style={styles.dateTimeContainer}>
          <View style={styles.dateTimeRow}>
            <Ionicons name="calendar-outline" size={16} color="rgba(255, 255, 255, 0.9)" />
            <Text style={styles.dateTimeText}>{getCurrentPhilippinesDateTime().date}</Text>
          </View>
          <View style={styles.dateTimeRow}>
            <Ionicons name="time-outline" size={16} color="rgba(255, 255, 255, 0.9)" />
            <Text style={styles.dateTimeText}>{getCurrentPhilippinesDateTime().time}</Text>
          </View>
        </View>
        <Text style={styles.welcomeSubtext}>
          How can we help you today?
        </Text>
      </View>

      {/* Debug Button - Remove after fixing */}
      <TouchableOpacity
        style={styles.debugButton}
        onPress={() => DebugHelper.showTokenStatusAlert()}
      >
        <Ionicons name="bug" size={20} color="#FFF" />
        <Text style={styles.debugButtonText}>Debug Tokens</Text>
      </TouchableOpacity>

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/(patient)/book-appointment')}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="calendar-outline" size={24} color="#4A90E2" />
            </View>
            <Text style={styles.quickActionText}>Book Appointment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/(patient)/appointments')}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="time-outline" size={24} color="#4A90E2" />
            </View>
            <Text style={styles.quickActionText}>View History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/(patient)/notifications')}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="notifications-outline" size={24} color="#4A90E2" />
            </View>
            <Text style={styles.quickActionText}>Notifications</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/(patient)/profile')}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="person-outline" size={24} color="#4A90E2" />
            </View>
            <Text style={styles.quickActionText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Upcoming Appointments */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
          <TouchableOpacity onPress={() => router.push('/(patient)/appointments')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {upcomingAppointments.length > 0 ? (
          upcomingAppointments.map((appointment) => (
            <View key={appointment.appointment_id} style={styles.appointmentCard}>
              <View style={styles.appointmentHeader}>
                <View style={styles.appointmentDate}>
                  <Text style={styles.appointmentDateText}>
                    {formatDate(appointment.date)}
                  </Text>
                  <Text style={styles.appointmentTimeText}>
                    {formatTime(appointment.time)}
                  </Text>
                </View>
                <View style={[styles.statusBadge, getStatusBadgeStyle(appointment.status)]}>
                  <Text style={[styles.statusText, getStatusTextStyle(appointment.status)]}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </Text>
                </View>
              </View>
              <Text style={styles.appointmentService}>
                {appointment.service?.service_name || 'General Consultation'}
              </Text>
              <Text style={styles.appointmentLocation}>
                📍 {appointment.health_center?.name || 'Health Center'}
              </Text>
              {appointment.health_center?.address && (
                <Text style={styles.appointmentAddress}>
                  {appointment.health_center.address}
                </Text>
              )}
              {appointment.service?.price && (
                <Text style={styles.appointmentPrice}>
                  💰 ₱{appointment.service.price.toLocaleString()}
                </Text>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={40} color="#CCC" />
            <Text style={styles.emptyStateText}>No upcoming appointments</Text>
            <TouchableOpacity
              style={styles.bookNowButton}
              onPress={() => router.push('/(patient)/book-appointment')}
            >
              <Text style={styles.bookNowText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Recent Notifications */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Notifications</Text>
          <TouchableOpacity onPress={() => router.push('/(patient)/notifications')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentNotifications.length > 0 ? (
          recentNotifications.slice(0, 3).map((notification) => (
            <View key={notification.id} style={styles.notificationCard}>
              <View style={styles.notificationIcon}>
                <Ionicons
                  name={
                    notification.type === 'appointment'
                      ? 'calendar'
                      : notification.type === 'service'
                      ? 'medical'
                      : 'information-circle'
                  }
                  size={20}
                  color="#4A90E2"
                />
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                <Text style={styles.notificationMessage} numberOfLines={2}>
                  {notification.message}
                </Text>
                <Text style={styles.notificationTime}>
                  {new Date(notification.created_at).toLocaleDateString()}
                </Text>
              </View>
              {!notification.is_read && <View style={styles.unreadDot} />}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-outline" size={40} color="#CCC" />
            <Text style={styles.emptyStateText}>No recent notifications</Text>
          </View>
        )}
      </View>
        </ScrollView>
      )}
      </SafeAreaView>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body1,
    color: '#FFFFFF',
    marginTop: spacing.md,
  },
  welcomeSection: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  welcomeText: {
    ...typography.h3,
    color: colors.surface,
    marginBottom: spacing.xs,
  },
  dateTimeContainer: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dateTimeText: {
    ...typography.body2,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: spacing.xs,
  },
  welcomeSubtext: {
    ...typography.body1,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  debugButton: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  debugButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  quickActionsSection: {
    padding: spacing.lg,
    backgroundColor: '#FFFFFF',
    marginTop: -spacing.xl,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    ...shadows.floating,
  },
  sectionTitle: {
    ...neumorphism.sectionTitle,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: '#F5F7FA',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.subtle,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quickActionText: {
    ...typography.caption,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    margin: spacing.md,
    ...shadows.subtle,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  viewAllText: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
  },
  appointmentCard: {
    backgroundColor: '#F5F7FA',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  appointmentDate: {
    flex: 1,
  },
  appointmentDateText: {
    ...typography.body2,
    fontWeight: '600',
  },
  appointmentTimeText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  confirmedBadge: {
    backgroundColor: '#E8F5E8',
  },
  pendingBadge: {
    backgroundColor: '#FFF3E0',
  },
  cancelledBadge: {
    backgroundColor: '#FFEBEE',
  },
  completedBadge: {
    backgroundColor: '#E3F2FD',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  confirmedText: {
    color: '#2E7D32',
  },
  pendingText: {
    color: '#F57C00',
  },
  cancelledText: {
    color: '#D32F2F',
  },
  completedText: {
    color: '#1976D2',
  },
  appointmentService: {
    ...typography.body1,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  appointmentLocation: {
    ...typography.body2,
    marginBottom: spacing.xs,
  },
  appointmentAddress: {
    ...typography.caption,
    marginBottom: spacing.xs,
    fontStyle: 'italic',
  },
  appointmentPrice: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    backgroundColor: '#F5F7FA',
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  notificationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    ...typography.body2,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  notificationMessage: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  notificationTime: {
    ...typography.caption,
    fontSize: 10,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginTop: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  emptyStateText: {
    ...typography.body2,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  bookNowButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    ...shadows.elevated,
  },
  bookNowText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
