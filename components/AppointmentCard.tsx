import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Appointment } from '../types';

interface AppointmentCardProps {
  appointment: Appointment;
  onCancel?: (id: string) => void;
  onEdit?: (id: string) => void;
  userRole?: 'patient' | 'health_worker' | 'admin';
}

export default function AppointmentCard({ 
  appointment, 
  onCancel, 
  onEdit, 
  userRole = 'patient' 
}: AppointmentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'time-outline';
      case 'confirmed': return 'checkmark-circle-outline';
      case 'completed': return 'checkmark-done-outline';
      case 'cancelled': return 'close-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  const getRoleTheme = () => {
    switch (userRole) {
      case 'patient': return 'border-l-blue-500';
      case 'health_worker': return 'border-l-green-500';
      case 'admin': return 'border-l-red-500';
      default: return 'border-l-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <View className={`bg-white rounded-xl shadow-sm border-l-4 ${getRoleTheme()} mb-4 overflow-hidden`}>
      {/* Header */}
      <View className="p-4 pb-3">
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900 mb-1">
              {formatDate(appointment.date)}
            </Text>
            <Text className="text-base text-gray-600">
              {formatTime(appointment.time)}
            </Text>
          </View>
          
          <View className={`px-3 py-1 rounded-full border ${getStatusColor(appointment.status)}`}>
            <View className="flex-row items-center">
              <Ionicons 
                name={getStatusIcon(appointment.status) as any} 
                size={14} 
                className="mr-1"
              />
              <Text className={`text-sm font-medium capitalize ${getStatusColor(appointment.status).split(' ')[1]}`}>
                {appointment.status}
              </Text>
            </View>
          </View>
        </View>

        {/* Health Center Info */}
        <View className="mb-3">
          <View className="flex-row items-center mb-1">
            <Ionicons name="business-outline" size={16} color="#6B7280" />
            <Text className="text-base font-medium text-gray-900 ml-2">
              {appointment.health_center?.name || 'Health Center'}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text className="text-sm text-gray-600 ml-2">
              {appointment.health_center?.location || 'Location not specified'}
            </Text>
          </View>
        </View>

        {/* Patient/User Info */}
        {appointment.user && (
          <View className="flex-row items-center mb-3">
            <Ionicons name="person-outline" size={16} color="#6B7280" />
            <Text className="text-sm text-gray-700 ml-2">
              {userRole === 'patient' ? 'Assigned to' : 'Patient'}: {appointment.user.name}
            </Text>
          </View>
        )}

        {/* Contact Info */}
        {appointment.health_center?.contact_number && (
          <View className="flex-row items-center mb-3">
            <Ionicons name="call-outline" size={16} color="#6B7280" />
            <Text className="text-sm text-gray-600 ml-2">
              {appointment.health_center.contact_number}
            </Text>
          </View>
        )}

        {/* Remarks */}
        {appointment.remarks && (
          <View className="bg-gray-50 rounded-lg p-3 mb-3">
            <Text className="text-xs font-medium text-gray-700 mb-1">Remarks:</Text>
            <Text className="text-sm text-gray-600 leading-relaxed">
              {appointment.remarks}
            </Text>
          </View>
        )}
      </View>

      {/* Actions */}
      {(onCancel || onEdit) && (
        <View className="border-t border-gray-100 px-4 py-3">
          <View className="flex-row justify-end space-x-3">
            {onEdit && (
              <TouchableOpacity
                onPress={() => onEdit(appointment.appointment_id)}
                className="flex-row items-center px-4 py-2 bg-blue-50 rounded-lg"
              >
                <Ionicons name="pencil-outline" size={16} color="#3B82F6" />
                <Text className="text-blue-600 font-medium ml-2">Edit</Text>
              </TouchableOpacity>
            )}
            
            {onCancel && appointment.status === 'pending' && (
              <TouchableOpacity
                onPress={() => onCancel(appointment.appointment_id)}
                className="flex-row items-center px-4 py-2 bg-red-50 rounded-lg"
              >
                <Ionicons name="close-circle-outline" size={16} color="#EF4444" />
                <Text className="text-red-600 font-medium ml-2">Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
}
