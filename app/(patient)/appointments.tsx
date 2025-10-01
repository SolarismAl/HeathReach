import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';
import { Appointment } from '../../types';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { neumorphism, colors, spacing, borderRadius, typography, shadows } from '../../styles/neumorphism';

export default function AppointmentHistoryScreen() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    loadAppointments();
  }, [filter]);

  const loadAppointments = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const params = filter === 'all' ? {} : { status: filter };
      console.log('Loading appointments with filter:', filter, 'params:', params);
      const response = await apiService.getAppointments(params);
      console.log('Appointments response:', response);
      
      if (response.success) {
        console.log('Appointments data:', response.data);
        console.log('Filtered appointments count:', response.data?.length || 0);
        setAppointments(response.data || []);
      }
    } catch (error) {
      console.error('Load appointments error:', error);
      Alert.alert('Error', 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAppointments(false);
    setRefreshing(false);
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiService.updateAppointment(appointmentId, {
                status: 'cancelled'
              });
              
              if (response.success) {
                Alert.alert('Success', 'Appointment cancelled successfully');
                loadAppointments();
              } else {
                Alert.alert('Error', response.message || 'Failed to cancel appointment');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to cancel appointment');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'confirmed': return '#4CAF50';
      case 'completed': return '#2196F3';
      case 'cancelled': return '#F44336';
      case 'rejected': return '#9E9E9E';
      default: return '#666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'time-outline';
      case 'confirmed': return 'checkmark-circle-outline';
      case 'completed': return 'checkmark-done-outline';
      case 'cancelled': return 'close-circle-outline';
      case 'rejected': return 'ban-outline';
      default: return 'help-outline';
    }
  };

  const canCancelAppointment = (appointment: Appointment) => {
    return appointment.status === 'pending' || appointment.status === 'confirmed';
  };

  const renderAppointment = ({ item }: { item: Appointment }) => {
    console.log('Rendering appointment:', item);
    console.log('Service data:', item.service);
    return (
      <View style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <View style={styles.dateTimeContainer}>
          <Text style={styles.dateText}>
            {new Date(item.date).toLocaleDateString()} at {item.time}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Ionicons 
            name={getStatusIcon(item.status) as any} 
            size={16} 
            color={getStatusColor(item.status)} 
          />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.appointmentBody}>
        <View style={styles.serviceHeader}>
          <Ionicons name="medical" size={18} color="#4A90E2" />
          <Text style={styles.serviceName}>
            {item.service?.service_name || 'General Consultation'}
          </Text>
        </View>
        
        <View style={styles.healthCenterInfo}>
          <Ionicons name="location" size={16} color="#4A90E2" />
          <Text style={styles.healthCenter}>
            {item.health_center?.name || 'Health Center'}
          </Text>
        </View>
        
        {item.health_center?.address && (
          <Text style={styles.address}>{item.health_center.address}</Text>
        )}
        
        {item.service?.price && (
          <View style={styles.priceInfo}>
            <Ionicons name="card" size={16} color="#4A90E2" />
            <Text style={styles.priceText}>₱{item.service.price.toLocaleString()}</Text>
          </View>
        )}
        
        {item.service?.duration_minutes && (
          <View style={styles.durationInfo}>
            <Ionicons name="time" size={16} color="#666" />
            <Text style={styles.durationText}>{item.service.duration_minutes} minutes</Text>
          </View>
        )}
        
        {item.user && (
          <View style={styles.healthWorkerInfo}>
            <Ionicons name="person" size={16} color="#666" />
            <Text style={styles.healthWorkerText}>Patient: {item.user.name}</Text>
          </View>
        )}

        {item.remarks && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Notes:</Text>
            <Text style={styles.notesText}>{item.remarks}</Text>
          </View>
        )}
      </View>

      {canCancelAppointment(item) && (
        <View style={styles.appointmentActions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelAppointment(item.appointment_id)}
          >
            <Ionicons name="close-circle-outline" size={16} color="#F44336" />
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
    );
  };

  const filterButtons = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <ProtectedRoute allowedRoles={['patient']}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
        <View style={styles.container}>
      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filterButtons}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                filter === item.key && styles.filterButtonActive
              ]}
              onPress={() => {
                console.log('Filter button pressed:', item.key);
                setFilter(item.key as any);
              }}
            >
              <Text style={[
                styles.filterButtonText,
                filter === item.key && styles.filterButtonTextActive
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Appointments List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading appointments...</Text>
        </View>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.appointment_id.toString()}
          renderItem={renderAppointment}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color="#CCC" />
              <Text style={styles.emptyStateTitle}>No Appointments Found</Text>
              <Text style={styles.emptyStateText}>
                {filter === 'all' 
                  ? "You haven't booked any appointments yet."
                  : `No ${filter} appointments found.`
                }
              </Text>
            </View>
          }
        />
      )}
      </View>
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
    backgroundColor: '#F5F7FA',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: borderRadius.xl,
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    ...typography.body2,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: colors.surface,
    fontWeight: '600',
  },
  listContainer: {
    padding: spacing.md,
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.subtle,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  dateTimeContainer: {
    flex: 1,
  },
  dateText: {
    ...typography.body1,
    fontWeight: 'bold',
  },
  timeText: {
    ...typography.body2,
    marginTop: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  appointmentBody: {
    marginBottom: spacing.md,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    backgroundColor: colors.primarySoft,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  serviceName: {
    ...typography.h6,
    marginLeft: spacing.sm,
  },
  healthCenterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  healthCenter: {
    ...typography.body1,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  address: {
    ...typography.body2,
    marginBottom: spacing.sm,
    marginLeft: spacing.lg,
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  priceText: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  durationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  durationText: {
    ...typography.body2,
    marginLeft: spacing.xs,
  },
  serviceText: {
    ...typography.body2,
    marginBottom: spacing.xs,
  },
  healthWorkerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  healthWorkerText: {
    ...typography.body2,
    marginLeft: spacing.xs,
  },
  notesContainer: {
    backgroundColor: '#F5F7FA',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  notesLabel: {
    ...typography.caption,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  notesText: {
    ...typography.body2,
  },
  appointmentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.errorSoft,
    ...shadows.subtle,
  },
  cancelButtonText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  emptyState: {
    ...neumorphism.emptyState,
  },
  emptyStateTitle: {
    ...neumorphism.emptyStateTitle,
  },
  emptyStateText: {
    ...neumorphism.emptyStateText,
  },
  loadingContainer: {
    ...neumorphism.loadingContainer,
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    ...neumorphism.loadingText,
  },
});
