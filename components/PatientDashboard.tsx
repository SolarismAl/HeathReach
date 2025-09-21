import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Appointment, Notification, User } from '../types';
import AppointmentCard from './AppointmentCard';

interface PatientDashboardProps {
  user: User;
  appointments: Appointment[];
  notifications: Notification[];
  onRefresh: () => Promise<void>;
}

export default function PatientDashboard({ 
  user, 
  appointments, 
  notifications, 
  onRefresh 
}: PatientDashboardProps) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const upcomingAppointments = appointments
    .filter(apt => apt.status === 'confirmed' || apt.status === 'pending')
    .slice(0, 3);

  const unreadNotifications = notifications.filter(notif => !notif.is_read).length;

  const quickActions = [
    {
      id: 'book',
      title: 'Book Appointment',
      icon: 'calendar-outline',
      color: 'bg-blue-500',
      route: '/(patient)/book-appointment',
    },
    {
      id: 'history',
      title: 'View History',
      icon: 'time-outline',
      color: 'bg-green-500',
      route: '/(patient)/appointments',
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: 'notifications-outline',
      color: 'bg-purple-500',
      route: '/(patient)/notifications',
      badge: unreadNotifications,
    },
    {
      id: 'profile',
      title: 'Profile',
      icon: 'person-outline',
      color: 'bg-orange-500',
      route: '/(patient)/profile',
    },
  ];

  return (
    <ScrollView 
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View className="bg-blue-500 px-6 pt-12 pb-8">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-white text-lg font-medium mb-1">
              Welcome back,
            </Text>
            <Text className="text-white text-2xl font-bold">
              {user.name}
            </Text>
          </View>
          <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center">
            <Ionicons name="person" size={24} color="white" />
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View className="px-6 -mt-4">
        <View className="bg-white rounded-2xl shadow-sm p-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                onPress={() => router.push(action.route as any)}
                className="w-[48%] mb-4"
              >
                <View className="items-center">
                  <View className={`w-16 h-16 ${action.color} rounded-2xl items-center justify-center mb-3 relative`}>
                    <Ionicons name={action.icon as any} size={28} color="white" />
                    {action.badge && action.badge > 0 && (
                      <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[20px] h-5 items-center justify-center">
                        <Text className="text-white text-xs font-bold">
                          {action.badge > 99 ? '99+' : action.badge}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-sm font-medium text-gray-700 text-center">
                    {action.title}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Upcoming Appointments */}
      <View className="px-6 mt-6">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-semibold text-gray-900">
            Upcoming Appointments
          </Text>
          {appointments.length > 3 && (
            <TouchableOpacity onPress={() => router.push('/(patient)/appointments')}>
              <Text className="text-blue-500 font-medium">View All</Text>
            </TouchableOpacity>
          )}
        </View>

        {upcomingAppointments.length > 0 ? (
          upcomingAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.appointment_id}
              appointment={appointment}
              userRole="patient"
            />
          ))
        ) : (
          <View className="bg-white rounded-xl p-8 items-center">
            <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
            <Text className="text-gray-500 text-center mt-4 text-base">
              No upcoming appointments
            </Text>
            <Text className="text-gray-400 text-center mt-2 text-sm">
              Book your first appointment to get started
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(patient)/book-appointment')}
              className="mt-4 bg-blue-500 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-medium">Book Appointment</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Recent Notifications */}
      <View className="px-6 mt-6 mb-8">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-semibold text-gray-900">
            Recent Notifications
          </Text>
          {notifications.length > 0 && (
            <TouchableOpacity onPress={() => router.push('/(patient)/notifications')}>
              <Text className="text-blue-500 font-medium">View All</Text>
            </TouchableOpacity>
          )}
        </View>

        {notifications.slice(0, 3).length > 0 ? (
          <View className="bg-white rounded-xl overflow-hidden">
            {notifications.slice(0, 3).map((notification, index) => (
              <View key={notification.id}>
                <View className="p-4 flex-row items-start">
                  <View className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                    notification.is_read ? 'bg-gray-300' : 'bg-blue-500'
                  }`} />
                  <View className="flex-1">
                    <Text className={`font-medium mb-1 ${
                      notification.is_read ? 'text-gray-600' : 'text-gray-900'
                    }`}>
                      {notification.title}
                    </Text>
                    <Text className={`text-sm leading-relaxed ${
                      notification.is_read ? 'text-gray-500' : 'text-gray-700'
                    }`}>
                      {notification.message}
                    </Text>
                    <Text className="text-xs text-gray-400 mt-2">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                {index < notifications.slice(0, 3).length - 1 && (
                  <View className="border-b border-gray-100 ml-7" />
                )}
              </View>
            ))}
          </View>
        ) : (
          <View className="bg-white rounded-xl p-8 items-center">
            <Ionicons name="notifications-outline" size={48} color="#D1D5DB" />
            <Text className="text-gray-500 text-center mt-4 text-base">
              No notifications yet
            </Text>
            <Text className="text-gray-400 text-center mt-2 text-sm">
              You'll receive updates about your appointments here
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
