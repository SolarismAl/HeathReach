import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import apiService from '../../services/api';
import notificationService from '../../services/notifications';
import FirebaseAuthService from '../../services/firebase';
import { colors } from '../../styles/neumorphism';
import { useAuth } from '../../contexts/AuthContext';
import { HealthCenter, Service, CreateAppointmentData } from '../../types';


export default function BookAppointmentScreen() {
  const { user } = useAuth();
  const [healthCenters, setHealthCenters] = useState<HealthCenter[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedHealthCenter, setSelectedHealthCenter] = useState<HealthCenter | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [showHealthCenters, setShowHealthCenters] = useState(false);
  const [showServices, setShowServices] = useState(false);
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingHealthCenters, setLoadingHealthCenters] = useState(true);
  const [loadingServices, setLoadingServices] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  useEffect(() => {
    loadHealthCenters();
  }, []);

  useEffect(() => {
    if (selectedHealthCenter) {
      loadServices();
    }
  }, [selectedHealthCenter]);

  useEffect(() => {
    if (selectedService && selectedDate) {
      loadAvailableTimeSlots();
    }
  }, [selectedService, selectedDate]);

  const loadHealthCenters = async () => {
    setLoadingHealthCenters(true);
    setError(null);
    
    try {
      console.log('Loading health centers from Firebase...');
      const response = await apiService.getHealthCenters();
      
      if (response.success && response.data && response.data.length > 0) {
        console.log('Health centers loaded from Firebase:', response.data);
        setHealthCenters(response.data);
        setError(null); // Clear any previous errors
      } else {
        console.log('No health centers found in Firebase');
        setHealthCenters([]);
        // Show the error message from the API if available
        setError(response.message || 'No health centers available. Please contact an administrator.');
      }
    } catch (error: any) {
      console.error('Error loading health centers:', error);
      setHealthCenters([]);
      setError(error.message || 'Failed to load health centers. Please check your connection and try again.');
    } finally {
      setLoadingHealthCenters(false);
    }
  };

  const loadServices = async () => {
    if (!selectedHealthCenter) return;
    
    setLoadingServices(true);
    
    try {
      console.log('Loading services for health center:', selectedHealthCenter.health_center_id);
      const response = await apiService.getServices({ 
        health_center_id: selectedHealthCenter.health_center_id 
      });
      
      if (response.success && response.data && response.data.length > 0) {
        console.log('Services loaded from Firebase:', response.data);
        // Filter only active services
        const activeServices = response.data.filter((service: Service) => service.is_active);
        setServices(activeServices);
      } else {
        console.log('No services found for this health center');
        setServices([]);
      }
    } catch (error) {
      console.error('Error loading services:', error);
      setServices([]);
    } finally {
      setLoadingServices(false);
    }
  };

  const loadAvailableTimeSlots = async () => {
    if (!selectedService || !selectedDate) return;
    
    try {
      console.log('Loading booked appointments for date:', selectedDate);
      const response = await apiService.getAppointments({
        health_center_id: selectedService.health_center_id,
        appointment_date: selectedDate,
        status: ['confirmed', 'pending'] // Don't show cancelled/completed as booked
      });
      
      if (response.success && response.data) {
        const bookedTimes = response.data.map((appointment: any) => appointment.time);
        setBookedSlots(bookedTimes);
        console.log('Booked time slots for', selectedDate, ':', bookedTimes);
        
        // Calculate available slots
        const available = timeSlots.filter(slot => !bookedTimes.includes(slot));
        setAvailableTimeSlots(available);
      } else {
        // No bookings found, all slots available
        setBookedSlots([]);
        setAvailableTimeSlots(timeSlots);
      }
    } catch (error) {
      console.error('Error loading available time slots:', error);
      // On error, show all slots as available
      setBookedSlots([]);
      setAvailableTimeSlots(timeSlots);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedHealthCenter || !selectedService || !selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Please log in to book an appointment');
      return;
    }

    setLoading(true);
    
    try {
      const appointmentData: CreateAppointmentData = {
        user_id: user.user_id,
        health_center_id: selectedHealthCenter.health_center_id,
        service_id: selectedService.service_id,
        appointment_date: selectedDate,
        appointment_time: selectedTime,
        notes: notes.trim() || undefined,
      };

      console.log('Booking appointment with data:', appointmentData);
      const response = await apiService.createAppointment(appointmentData);
      console.log('Booking response:', response);
      console.log('Response success:', response.success);
      console.log('Response type:', typeof response.success);
      
      if (response && response.success === true) {
        console.log('Booking successful, showing alert...');
        
        // Show success alert immediately
        Alert.alert(
          '🎉 Booking Successful!',
          `Your appointment has been booked successfully!\n\n📅 Date: ${formatDate(selectedDate)}\n⏰ Time: ${formatTime(selectedTime)}\n🏥 Health Center: ${selectedHealthCenter?.name}\n💊 Service: ${selectedService?.service_name}\n\nYou will receive a confirmation once the health worker reviews your appointment.`,
          [
            {
              text: '📋 View My Appointments',
              onPress: () => {
                resetForm();
                router.replace('/(patient)/appointments');
              },
              style: 'default'
            },
            {
              text: '✅ Got it!',
              onPress: () => {
                resetForm();
                router.back();
              },
              style: 'cancel'
            }
          ]
        );
        
        // Reset form after successful booking
        resetForm();
      } else {
        console.log('Booking failed:', response);
        Alert.alert('❌ Booking Failed', response?.message || 'Failed to book appointment. Please try again.');
      }
    } catch (error: any) {
      console.error('Appointment booking error:', error);
      Alert.alert('Error', error.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedHealthCenter(null);
    setSelectedService(null);
    setSelectedDate('');
    setSelectedTime('');
    setNotes('');
    setServices([]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} translucent={false} />
      <ScrollView style={styles.container}>
      {/* Error Message */}
      {error && (
        <View style={styles.errorBanner}>
          <View style={styles.errorContent}>
            <Ionicons name="information-circle" size={20} color="#FF9800" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadHealthCenters}
          >
            <Ionicons name="refresh" size={16} color="#FF9800" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Booking Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressStep}>
          <View style={[styles.progressDot, selectedHealthCenter ? styles.progressDotCompleted : {}]}>
            <Text style={styles.progressNumber}>1</Text>
          </View>
          <Text style={styles.progressLabel}>Health Center</Text>
        </View>
        <View style={styles.progressLine} />
        <View style={styles.progressStep}>
          <View style={[styles.progressDot, selectedService ? styles.progressDotCompleted : {}]}>
            <Text style={styles.progressNumber}>2</Text>
          </View>
          <Text style={styles.progressLabel}>Service</Text>
        </View>
        <View style={styles.progressLine} />
        <View style={styles.progressStep}>
          <View style={[styles.progressDot, selectedDate ? styles.progressDotCompleted : {}]}>
            <Text style={styles.progressNumber}>3</Text>
          </View>
          <Text style={styles.progressLabel}>Date & Time</Text>
        </View>
      </View>

      {/* Health Center Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Health Center</Text>
        {loadingHealthCenters ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.loadingText}>Loading health centers...</Text>
            <Text style={styles.loadingSubtext}>This may take a moment, please wait</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setShowHealthCenters(true)}
            >
              <Text style={[styles.selectorText, !selectedHealthCenter ? styles.placeholderText : {}]}>
                {selectedHealthCenter?.name || 'Choose a health center'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
            {selectedHealthCenter && (
              <View style={styles.selectedInfo}>
                <Ionicons name="location" size={16} color="#666" />
                <Text style={styles.selectedInfoText}>{selectedHealthCenter.address || selectedHealthCenter.location}</Text>
              </View>
            )}
          </>
        )}
      </View>

      {/* Service Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Service</Text>
        {loadingServices ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#4A90E2" />
            <Text style={styles.loadingText}>Loading services...</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.selector, !selectedHealthCenter ? styles.selectorDisabled : {}]}
              onPress={() => selectedHealthCenter && setShowServices(true)}
              disabled={!selectedHealthCenter}
            >
              <Text style={[styles.selectorText, !selectedService ? styles.placeholderText : {}]}>
                {selectedService?.service_name || 'Choose a service'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
            {selectedService && (
              <View style={styles.selectedInfo}>
                <Ionicons name="medical" size={16} color="#666" />
                <Text style={styles.selectedInfoText}>
                  {selectedService.description}
                </Text>
                {selectedService.price && (
                  <View style={styles.priceInfo}>
                    <Ionicons name="card" size={16} color="#4A90E2" />
                    <Text style={styles.priceText}>${selectedService.price}</Text>
                  </View>
                )}
              </View>
            )}
          </>
        )}
      </View>

      {/* Date Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Date</Text>
        <Calendar
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={selectedDate ? {
            [selectedDate]: {
              selected: true,
              selectedColor: '#4A90E2',
            },
          } : {}}
          minDate={getMinDate()}
          theme={{
            selectedDayBackgroundColor: '#4A90E2',
            todayTextColor: '#4A90E2',
            arrowColor: '#4A90E2',
          }}
        />
        {selectedDate && (
          <View style={styles.selectedDateContainer}>
            <Text style={styles.selectedDateText}>
              Selected: {formatDate(selectedDate)}
            </Text>
          </View>
        )}
      </View>

      {/* Time Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Time</Text>
        <TouchableOpacity
          style={[styles.selector, !selectedDate ? styles.selectorDisabled : {}]}
          onPress={() => selectedDate && setShowTimeSlots(true)}
          disabled={!selectedDate}
        >
          <Text style={[styles.selectorText, !selectedTime ? styles.placeholderText : {}]}>
            {selectedTime ? formatTime(selectedTime) : 'Choose a time slot'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Notes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Notes (Optional)</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Any specific concerns or requirements..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* Booking Summary */}
      {selectedHealthCenter && selectedService && selectedDate && selectedTime && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Summary</Text>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <Ionicons name="business" size={20} color="#4A90E2" />
              <View style={styles.summaryText}>
                <Text style={styles.summaryLabel}>Health Center</Text>
                <Text style={styles.summaryValue}>{selectedHealthCenter.name}</Text>
                <Text style={styles.summarySubtext}>{selectedHealthCenter.address || selectedHealthCenter.location}</Text>
              </View>
            </View>
            
            <View style={styles.summaryItem}>
              <Ionicons name="medical" size={20} color="#4A90E2" />
              <View style={styles.summaryText}>
                <Text style={styles.summaryLabel}>Service</Text>
                <Text style={styles.summaryValue}>{selectedService.service_name}</Text>
                {selectedService.price && (
                  <Text style={styles.summarySubtext}>${selectedService.price}</Text>
                )}
              </View>
            </View>
            
            <View style={styles.summaryItem}>
              <Ionicons name="calendar" size={20} color="#4A90E2" />
              <View style={styles.summaryText}>
                <Text style={styles.summaryLabel}>Date & Time</Text>
                <Text style={styles.summaryValue}>{formatDate(selectedDate)}</Text>
                <Text style={styles.summarySubtext}>{formatTime(selectedTime)}</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Book Button */}
      <View style={styles.bookSection}>
        <TouchableOpacity
          style={[styles.bookButton, loading ? styles.bookButtonDisabled : {}]}
          onPress={handleBookAppointment}
          disabled={loading || !selectedHealthCenter || !selectedService || !selectedDate || !selectedTime}
        >
          <Text style={styles.bookButtonText}>
            {loading ? 'Booking...' : 'Book Appointment'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Health Centers Modal */}
      <Modal visible={showHealthCenters} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Health Center</Text>
              <TouchableOpacity onPress={() => setShowHealthCenters(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {healthCenters.length > 0 ? (
                healthCenters.map((center) => (
                  <TouchableOpacity
                    key={center.health_center_id}
                    style={styles.modalItem}
                    onPress={() => {
                      setSelectedHealthCenter(center);
                      setSelectedService(null);
                      setServices([]); // Clear services when changing health center
                      setShowHealthCenters(false);
                    }}
                  >
                    <Text style={styles.modalItemTitle}>{center.name}</Text>
                    <Text style={styles.modalItemSubtitle}>{center.address || center.location}</Text>
                    {center.contact_number && (
                      <Text style={styles.modalItemDescription}>{center.contact_number}</Text>
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="business-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyStateText}>No health centers available</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Services Modal */}
      <Modal visible={showServices} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Service</Text>
              <TouchableOpacity onPress={() => setShowServices(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {services.length > 0 ? (
                services.map((service) => (
                  <TouchableOpacity
                    key={service.service_id}
                    style={styles.modalItem}
                    onPress={() => {
                      setSelectedService(service);
                      setShowServices(false);
                    }}
                  >
                    <View style={styles.serviceHeader}>
                      <Text style={styles.modalItemTitle}>{service.service_name}</Text>
                      {service.price && (
                        <Text style={styles.servicePrice}>${service.price}</Text>
                      )}
                    </View>
                    <Text style={styles.modalItemDescription}>{service.description}</Text>
                    {service.duration_minutes && (
                      <Text style={styles.serviceDuration}>
                        Duration: {service.duration_minutes} minutes
                      </Text>
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="medical-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyStateText}>
                    {selectedHealthCenter ? 'No services available for this health center' : 'Please select a health center first'}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Time Slots Modal */}
      <Modal visible={showTimeSlots} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Time</Text>
              <TouchableOpacity onPress={() => setShowTimeSlots(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.timeSlotsGrid}>
              {timeSlots.map((time) => {
                const isBooked = bookedSlots.includes(time);
                const isAvailable = availableTimeSlots.includes(time);
                
                return (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeSlot,
                      selectedTime === time ? styles.timeSlotSelected : {},
                      isBooked ? styles.timeSlotBooked : {},
                      !isAvailable ? styles.timeSlotDisabled : {}
                    ]}
                    onPress={() => {
                      if (isAvailable && !isBooked) {
                        setSelectedTime(time);
                        setShowTimeSlots(false);
                      }
                    }}
                    disabled={isBooked || !isAvailable}
                  >
                    <Text style={[
                      styles.timeSlotText,
                      selectedTime === time ? styles.timeSlotTextSelected : {},
                      isBooked ? styles.timeSlotTextBooked : {},
                      !isAvailable ? styles.timeSlotTextDisabled : {}
                    ]}>
                      {formatTime(time)}
                    </Text>
                    {isBooked && (
                      <Text style={styles.bookedLabel}>Booked</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#FAFAFA',
  },
  selectorDisabled: {
    backgroundColor: '#F5F5F5',
    opacity: 0.6,
  },
  selectorText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  placeholderText: {
    color: '#999',
  },
  selectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  selectedInfoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  selectedDateContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  selectedDateText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '600',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    minHeight: 100,
  },
  bookSection: {
    margin: 16,
  },
  bookButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: '#B0B0B0',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalList: {
    padding: 20,
  },
  modalItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  modalItemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  modalItemDescription: {
    fontSize: 12,
    color: '#999',
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 12,
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
    minWidth: 80,
    alignItems: 'center',
  },
  timeSlotSelected: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  timeSlotText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  timeSlotTextSelected: {
    color: '#FFFFFF',
  },
  // New styles for enhanced functionality
  errorBanner: {
    flexDirection: 'column',
    backgroundColor: '#FFF3E0',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#E65100',
    marginLeft: 8,
    flex: 1,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FF9800',
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    fontSize: 14,
    color: '#FF9800',
    fontWeight: '600',
    marginLeft: 4,
  },
  loadingContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    fontWeight: '600',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  priceText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 12,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  serviceDuration: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  // Time slot booking styles
  timeSlotBooked: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
    opacity: 0.6,
  },
  timeSlotDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
    opacity: 0.4,
  },
  timeSlotTextBooked: {
    color: '#F44336',
  },
  timeSlotTextDisabled: {
    color: '#BDBDBD',
  },
  bookedLabel: {
    fontSize: 10,
    color: '#F44336',
    marginTop: 2,
    fontWeight: '600',
  },
  // Progress indicator styles
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
  },
  progressDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  progressDotCompleted: {
    backgroundColor: '#4A90E2',
  },
  progressNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  progressLine: {
    height: 2,
    backgroundColor: '#E0E0E0',
    flex: 0.5,
    marginHorizontal: 8,
    marginBottom: 20,
  },
  // Summary styles
  summaryContainer: {
    gap: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  summaryText: {
    flex: 1,
    marginLeft: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginBottom: 2,
  },
  summarySubtext: {
    fontSize: 14,
    color: '#666',
  },
});
