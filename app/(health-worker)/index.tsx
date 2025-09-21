import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';
import notificationService from '../../services/notifications';
import { Appointment } from '../../types';
import { ProtectedRoute } from '../../components/ProtectedRoute';

export default function ManageAppointmentsScreen() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('pending');

  useEffect(() => {
    loadAppointments();
  }, [filter]);

  const loadAppointments = async () => {
    try {
      const params = filter === 'all' ? {} : { status: filter };
      const response = await apiService.getHealthWorkerAppointments(params);
      
      if (response.success) {
        setAppointments(response.data || []);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAppointments();
    setRefreshing(false);
  };

  const handleApproveAppointment = async (appointmentId: string) => {
    try {
      const response = await apiService.approveAppointment(appointmentId);
      if (response.success) {
        Alert.alert('Success', 'Appointment approved successfully');
        loadAppointments();
      } else {
        Alert.alert('Error', response.message || 'Failed to approve appointment');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to approve appointment');
    }
  };

  const handleUpdateStatus = async (appointmentId: string, status: 'confirmed' | 'cancelled' | 'completed') => {
    try {
      const response = await apiService.updateAppointmentStatus(appointmentId, status);
      if (response.success) {
        setAppointments(prev => 
          prev.map(apt => 
            apt.appointment_id === appointmentId 
              ? { ...apt, status }
              : apt
          )
        );
        
        // Send notification to patient about status change
        const appointment = appointments.find(apt => apt.appointment_id === appointmentId);
        if (appointment) {
          await notificationService.notifyAppointmentStatusChange(
            appointmentId.toString(),
            status,
            appointment.user?.name
          );
        }
        
        Alert.alert('Success', `Appointment ${status} successfully`);
      } else {
        Alert.alert('Error', response.message || `Failed to ${status} appointment`);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || `Failed to ${status} appointment`);
    }
  };

  const handleRejectAppointment = async (appointmentId: string) => {
    Alert.alert(
      'Reject Appointment',
      'Are you sure you want to reject this appointment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiService.rejectAppointment(appointmentId, 'Rejected by health worker');
              if (response.success) {
                Alert.alert('Success', 'Appointment rejected');
                loadAppointments();
              } else {
                Alert.alert('Error', response.message || 'Failed to reject appointment');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to reject appointment');
            }
          }
        }
      ]
    );
  };

  const handleCompleteAppointment = async (appointmentId: string) => {
    Alert.alert(
      'Complete Appointment',
      'Mark this appointment as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            try {
              const response = await apiService.completeAppointment(appointmentId, 'Consultation completed');
              if (response.success) {
                Alert.alert('Success', 'Appointment marked as completed');
                loadAppointments();
              } else {
                Alert.alert('Error', response.message || 'Failed to complete appointment');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to complete appointment');
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

  const renderAppointment = ({ item }: { item: Appointment }) => (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <View style={styles.dateTimeContainer}>
          <Text style={styles.dateText}>{formatDate(item.date)}</Text>
          <Text style={styles.timeText}>{formatTime(item.time)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.appointmentBody}>
        <Text style={styles.serviceName}>{'General Consultation'}</Text>
        
        <View style={styles.patientInfo}>
          <Ionicons name="person" size={16} color="#666" />
          <Text style={styles.patientName}>{item.user?.name}</Text>
        </View>

        <View style={styles.contactInfo}>
          <Ionicons name="mail" size={16} color="#666" />
          <Text style={styles.contactText}>{item.user?.email}</Text>
        </View>

        {item.user?.contact_number && (
          <View style={styles.contactInfo}>
            <Ionicons name="call" size={16} color="#666" />
            <Text style={styles.contactText}>{item.user.contact_number}</Text>
          </View>
        )}

        {item.remarks && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Patient Notes:</Text>
            <Text style={styles.notesText}>{item.remarks}</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {item.status === 'pending' && (
          <View style={styles.pendingActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleApproveAppointment(item.appointment_id)}
            >
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleRejectAppointment(item.appointment_id)}
            >
              <Ionicons name="close" size={16} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
        {item.status === 'confirmed' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => handleCompleteAppointment(item.appointment_id)}
          >
            <Ionicons name="checkmark-done" size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Complete</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const filterButtons = [
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'completed', label: 'Completed' },
    { key: 'all', label: 'All' },
  ];

  return (
    <ProtectedRoute allowedRoles={['health_worker']}>
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
              onPress={() => setFilter(item.key as any)}
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
                ? "No appointments assigned to you yet."
                : `No ${filter} appointments found.`
              }
            </Text>
          </View>
        }
      />
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  filterButtonActive: {
    backgroundColor: '#2E7D32',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateTimeContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  appointmentBody: {
    marginBottom: 16,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginLeft: 8,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  notesContainer: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  pendingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  completeButton: {
    backgroundColor: '#2196F3',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
