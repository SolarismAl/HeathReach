import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';
import { Appointment, Notification, User } from '../../types';
import { ProtectedRoute } from '../../components/ProtectedRoute';

export default function PatientDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [profileResponse, appointmentsResponse, notificationsResponse] = await Promise.all([
        apiService.getProfile(),
        apiService.getAppointments(),
        apiService.getNotifications(),
      ]);

      if (profileResponse.success) {
        setUser(profileResponse.data || null);
      }

      if (appointmentsResponse.success) {
        setUpcomingAppointments(appointmentsResponse.data || []);
      }

      if (notificationsResponse.success) {
        setRecentNotifications(notificationsResponse.data || []);
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load dashboard data');
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
      {loading ? (
        <View style={styles.loadingContainer}>
          <Ionicons name="medical" size={50} color="#4A90E2" />
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
        <Text style={styles.welcomeSubtext}>
          How can we help you today?
        </Text>
      </View>

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
    </ProtectedRoute>
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
  welcomeSection: {
    backgroundColor: '#4A90E2',
    padding: 24,
    paddingBottom: 32,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  quickActionsSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginTop: -16,
    marginHorizontal: 16,
    borderRadius: 12,
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
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  section: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
  },
  appointmentCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appointmentDate: {
    flex: 1,
  },
  appointmentDateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  appointmentTimeText: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  appointmentLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  appointmentAddress: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  appointmentPrice: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '600',
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  notificationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  notificationMessage: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 10,
    color: '#999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5722',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    marginBottom: 16,
  },
  bookNowButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bookNowText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
