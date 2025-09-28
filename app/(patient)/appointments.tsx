import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';
import { Appointment } from '../../types';
import { ProtectedRoute } from '../../components/ProtectedRoute';

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
    backgroundColor: '#4A90E2',
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  appointmentBody: {
    marginBottom: 12,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#F0F8FF',
    padding: 8,
    borderRadius: 6,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 6,
  },
  healthCenterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  healthCenter: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
    marginLeft: 4,
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    marginLeft: 20,
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  priceText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
    marginLeft: 4,
  },
  durationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  durationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  serviceText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  healthWorkerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  healthWorkerText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
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
  appointmentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FFEBEE',
  },
  cancelButtonText: {
    fontSize: 12,
    color: '#F44336',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
});
