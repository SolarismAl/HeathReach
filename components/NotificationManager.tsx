import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import notificationService from '../services/notifications';

interface InAppNotification {
  id: string;
  title: string;
  body: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface NotificationManagerProps {
  children: React.ReactNode;
}

export default function NotificationManager({ children }: NotificationManagerProps) {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Listen for foreground notifications
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      const { title, body, data } = notification.request.content;
      
      // Show in-app notification for foreground notifications
      showInAppNotification({
        id: Date.now().toString(),
        title: title || 'New Notification',
        body: body || '',
        type: getNotificationType(data?.type as string),
        duration: 5000,
      });
    });

    return () => subscription.remove();
  }, []);

  const getNotificationType = (type?: string): 'success' | 'error' | 'warning' | 'info' => {
    switch (type) {
      case 'appointment':
        return 'info';
      case 'service':
        return 'success';
      case 'admin':
        return 'warning';
      default:
        return 'info';
    }
  };

  const showInAppNotification = (notification: InAppNotification) => {
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove after duration
    if (notification.duration) {
      setTimeout(() => {
        removeNotification(notification.id);
      }, notification.duration);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'close-circle';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'information-circle';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      case 'warning':
        return '#FF9800';
      case 'info':
      default:
        return '#2196F3';
    }
  };

  return (
    <View style={styles.container}>
      {children}
      
      {/* In-App Notifications Overlay */}
      {notifications.length > 0 && (
        <View style={styles.notificationContainer}>
          {notifications.map((notification) => (
            <Animated.View
              key={notification.id}
              style={[
                styles.notification,
                { borderLeftColor: getNotificationColor(notification.type) }
              ]}
            >
              <View style={styles.notificationContent}>
                <Ionicons
                  name={getNotificationIcon(notification.type) as any}
                  size={24}
                  color={getNotificationColor(notification.type)}
                  style={styles.notificationIcon}
                />
                <View style={styles.notificationText}>
                  <Text style={styles.notificationTitle} numberOfLines={1}>
                    {notification.title}
                  </Text>
                  <Text style={styles.notificationBody} numberOfLines={2}>
                    {notification.body}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => removeNotification(notification.id)}
                >
                  <Ionicons name="close" size={20} color="#666" />
                </TouchableOpacity>
              </View>
            </Animated.View>
          ))}
        </View>
      )}
    </View>
  );
}

// Export utility functions for showing notifications from anywhere in the app
export const showSuccessNotification = (title: string, body: string) => {
  // This would be handled by a global notification context in a real app
  console.log('Success:', title, body);
};

export const showErrorNotification = (title: string, body: string) => {
  console.log('Error:', title, body);
};

export const showWarningNotification = (title: string, body: string) => {
  console.log('Warning:', title, body);
};

export const showInfoNotification = (title: string, body: string) => {
  console.log('Info:', title, body);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notificationContainer: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  notification: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderLeftWidth: 4,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  notificationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
});
