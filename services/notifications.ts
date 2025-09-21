import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import apiService from './api';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
});

export interface NotificationData {
  type: 'appointment' | 'service' | 'admin' | 'general';
  id?: string;
  title: string;
  body: string;
  data?: any;
}

class NotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;

  async initialize(): Promise<void> {
    try {
      // Register for push notifications
      const token = await this.registerForPushNotifications();
      if (token) {
        this.expoPushToken = token;
        // Send token to backend
        await this.registerDeviceToken(token);
      }

      // Set up notification listeners
      this.setupNotificationListeners();
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  private async registerForPushNotifications(): Promise<string | null> {
    let token = null;

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Failed to get push token for push notification!');
        return null;
      }

      try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
        if (!projectId) {
          throw new Error('Project ID not found');
        }
        
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      } catch (error) {
        console.error('Error getting Expo push token:', error);
        // Fallback to device push token
        try {
          token = (await Notifications.getDevicePushTokenAsync()).data;
        } catch (fallbackError) {
          console.error('Error getting device push token:', fallbackError);
        }
      }
    } else {
      console.warn('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });

      // Create specific channels for different notification types
      await Notifications.setNotificationChannelAsync('appointments', {
        name: 'Appointments',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2196F3',
        description: 'Notifications about appointments',
      });

      await Notifications.setNotificationChannelAsync('services', {
        name: 'Services',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4CAF50',
        description: 'Notifications about health services',
      });

      await Notifications.setNotificationChannelAsync('admin', {
        name: 'Admin Announcements',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FFD32F2F',
        description: 'Important announcements from administrators',
      });
    }

    return token;
  }

  private async registerDeviceToken(token: string): Promise<void> {
    try {
      // Get current user ID from secure storage
      const userId = await SecureStore.getItemAsync('user_id');
      if (!userId) {
        console.warn('No user ID found, cannot register device token');
        return;
      }
      
      await apiService.saveDeviceToken({ 
        user_id: userId,
        token, 
        platform: Platform.OS as 'ios' | 'android' | 'web' 
      });
    } catch (error) {
      console.error('Failed to register device token:', error);
    }
  }

  private setupNotificationListeners(): void {
    // Handle notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      this.handleNotificationReceived(notification);
    });

    // Handle user tapping on notifications
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      this.handleNotificationResponse(response);
    });
  }

  private handleNotificationReceived(notification: Notifications.Notification): void {
    const { title, body, data } = notification.request.content;
    
    // You can add custom logic here based on notification type
    if (data?.type) {
      switch (data.type) {
        case 'appointment':
          // Handle appointment notifications
          break;
        case 'service':
          // Handle service notifications
          break;
        case 'admin':
          // Handle admin notifications
          break;
        default:
          // Handle general notifications
          break;
      }
    }
  }

  private handleNotificationResponse(response: Notifications.NotificationResponse): void {
    const { notification } = response;
    const { data } = notification.request.content;

    // Navigate to appropriate screen based on notification type
    if (data?.type && data?.id) {
      switch (data.type) {
        case 'appointment':
          // Navigate to appointment details
          // router.push(`/appointments/${data.id}`);
          break;
        case 'service':
          // Navigate to service details
          // router.push(`/services/${data.id}`);
          break;
        case 'admin':
          // Navigate to admin announcement
          // router.push(`/announcements/${data.id}`);
          break;
        default:
          // Navigate to notifications screen
          // router.push('/notifications');
          break;
      }
    }
  }

  async scheduleLocalNotification(notificationData: NotificationData): Promise<string> {
    const { type, title, body, data } = notificationData;
    
    const channelId = this.getChannelId(type);
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { ...data, type },
        sound: true,
      },
      trigger: null, // Show immediately
      ...(Platform.OS === 'android' && { 
        identifier: channelId 
      }),
    });

    return notificationId;
  }

  async scheduleNotification(
    notificationData: NotificationData,
    trigger: Date | Notifications.NotificationTriggerInput
  ): Promise<string> {
    const { type, title, body, data } = notificationData;
    
    const channelId = this.getChannelId(type);
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { ...data, type },
        ...(Platform.OS === 'android' && { 
          channelId 
        }),
      },
      trigger: trigger as any,
    });

    return notificationId;
  }

  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  async clearBadge(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
  }

  private getChannelId(type: string): string {
    switch (type) {
      case 'appointment':
        return 'appointments';
      case 'service':
        return 'services';
      case 'admin':
        return 'admin';
      default:
        return 'default';
    }
  }

  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  cleanup(): void {
    if (this.notificationListener) {
      this.notificationListener.remove();
    }
    if (this.responseListener) {
      this.responseListener.remove();
    }
  }

  // Utility methods for common notification scenarios
  async notifyAppointmentReminder(appointmentId: string, title: string, body: string, scheduledTime: Date): Promise<string> {
    return this.scheduleNotification(
      {
        type: 'appointment',
        id: appointmentId,
        title,
        body,
        data: { appointmentId }
      },
      scheduledTime
    );
  }

  async notifyAppointmentStatusChange(appointmentId: string, status: string, patientName?: string): Promise<string> {
    const title = `Appointment ${status}`;
    const body = patientName 
      ? `Appointment with ${patientName} has been ${status.toLowerCase()}`
      : `Your appointment has been ${status.toLowerCase()}`;
    
    return this.scheduleLocalNotification({
      type: 'appointment',
      id: appointmentId,
      title,
      body,
      data: { appointmentId, status }
    });
  }

  async notifyNewService(serviceId: string, serviceName: string): Promise<string> {
    return this.scheduleLocalNotification({
      type: 'service',
      id: serviceId,
      title: 'New Service Available',
      body: `${serviceName} is now available for booking`,
      data: { serviceId }
    });
  }

  async notifyAdminAnnouncement(announcementId: string, title: string, body: string): Promise<string> {
    return this.scheduleLocalNotification({
      type: 'admin',
      id: announcementId,
      title,
      body,
      data: { announcementId }
    });
  }
}

export default new NotificationService();
