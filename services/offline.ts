import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Appointment, Notification, HealthCenter, Service } from '../types';

interface OfflineData {
  user?: User;
  appointments: Appointment[];
  notifications: Notification[];
  healthCenters: HealthCenter[];
  services: Service[];
  lastSync: string;
}

interface SyncQueue {
  id: string;
  action: 'create' | 'update' | 'delete';
  endpoint: string;
  data?: any;
  timestamp: string;
}

class OfflineService {
  private readonly STORAGE_KEYS = {
    USER: 'offline_user',
    APPOINTMENTS: 'offline_appointments',
    NOTIFICATIONS: 'offline_notifications',
    HEALTH_CENTERS: 'offline_health_centers',
    SERVICES: 'offline_services',
    SYNC_QUEUE: 'offline_sync_queue',
    LAST_SYNC: 'offline_last_sync',
    OFFLINE_MODE: 'offline_mode_enabled',
  };

  // Cache Management
  async cacheUserData(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to cache user data:', error);
    }
  }

  async getCachedUserData(): Promise<User | null> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.USER);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get cached user data:', error);
      return null;
    }
  }

  async cacheAppointments(appointments: Appointment[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
      await this.updateLastSync();
    } catch (error) {
      console.error('Failed to cache appointments:', error);
    }
  }

  async getCachedAppointments(): Promise<Appointment[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.APPOINTMENTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get cached appointments:', error);
      return [];
    }
  }

  async cacheNotifications(notifications: Notification[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
      await this.updateLastSync();
    } catch (error) {
      console.error('Failed to cache notifications:', error);
    }
  }

  async getCachedNotifications(): Promise<Notification[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.NOTIFICATIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get cached notifications:', error);
      return [];
    }
  }

  async cacheHealthCenters(healthCenters: HealthCenter[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEYS.HEALTH_CENTERS, JSON.stringify(healthCenters));
      await this.updateLastSync();
    } catch (error) {
      console.error('Failed to cache health centers:', error);
    }
  }

  async getCachedHealthCenters(): Promise<HealthCenter[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.HEALTH_CENTERS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get cached health centers:', error);
      return [];
    }
  }

  async cacheServices(services: Service[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEYS.SERVICES, JSON.stringify(services));
      await this.updateLastSync();
    } catch (error) {
      console.error('Failed to cache services:', error);
    }
  }

  async getCachedServices(): Promise<Service[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.SERVICES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get cached services:', error);
      return [];
    }
  }

  // Sync Queue Management
  async addToSyncQueue(action: 'create' | 'update' | 'delete', endpoint: string, data?: any): Promise<void> {
    try {
      const queue = await this.getSyncQueue();
      const queueItem: SyncQueue = {
        id: Date.now().toString(),
        action,
        endpoint,
        data,
        timestamp: new Date().toISOString(),
      };
      queue.push(queueItem);
      await AsyncStorage.setItem(this.STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to add to sync queue:', error);
    }
  }

  async getSyncQueue(): Promise<SyncQueue[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.SYNC_QUEUE);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get sync queue:', error);
      return [];
    }
  }

  async clearSyncQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEYS.SYNC_QUEUE, JSON.stringify([]));
    } catch (error) {
      console.error('Failed to clear sync queue:', error);
    }
  }

  async removeFromSyncQueue(id: string): Promise<void> {
    try {
      const queue = await this.getSyncQueue();
      const updatedQueue = queue.filter(item => item.id !== id);
      await AsyncStorage.setItem(this.STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(updatedQueue));
    } catch (error) {
      console.error('Failed to remove from sync queue:', error);
    }
  }

  // Offline Mode Management
  async setOfflineMode(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEYS.OFFLINE_MODE, JSON.stringify(enabled));
    } catch (error) {
      console.error('Failed to set offline mode:', error);
    }
  }

  async isOfflineModeEnabled(): Promise<boolean> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.OFFLINE_MODE);
      return data ? JSON.parse(data) : false;
    } catch (error) {
      console.error('Failed to check offline mode:', error);
      return false;
    }
  }

  // Sync Management
  async updateLastSync(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    } catch (error) {
      console.error('Failed to update last sync:', error);
    }
  }

  async getLastSync(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.STORAGE_KEYS.LAST_SYNC);
    } catch (error) {
      console.error('Failed to get last sync:', error);
      return null;
    }
  }

  async getTimeSinceLastSync(): Promise<number | null> {
    try {
      const lastSync = await this.getLastSync();
      if (!lastSync) return null;
      
      const lastSyncTime = new Date(lastSync).getTime();
      const currentTime = new Date().getTime();
      return currentTime - lastSyncTime;
    } catch (error) {
      console.error('Failed to calculate time since last sync:', error);
      return null;
    }
  }

  // Data Synchronization
  async syncWithServer(apiService: any): Promise<{ success: boolean; message: string }> {
    try {
      const queue = await this.getSyncQueue();
      let successCount = 0;
      let failureCount = 0;

      // Process sync queue
      for (const item of queue) {
        try {
          let response;
          switch (item.action) {
            case 'create':
              response = await apiService.post(item.endpoint, item.data);
              break;
            case 'update':
              response = await apiService.put(item.endpoint, item.data);
              break;
            case 'delete':
              response = await apiService.delete(item.endpoint);
              break;
          }

          if (response?.success) {
            await this.removeFromSyncQueue(item.id);
            successCount++;
          } else {
            failureCount++;
          }
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          failureCount++;
        }
      }

      // Fetch fresh data from server
      try {
        const [appointmentsResponse, notificationsResponse, healthCentersResponse, servicesResponse] = await Promise.all([
          apiService.getAppointments(),
          apiService.getNotifications(),
          apiService.getHealthCenters(),
          apiService.getServices(),
        ]);

        if (appointmentsResponse?.success) {
          await this.cacheAppointments(appointmentsResponse.data?.data || []);
        }

        if (notificationsResponse?.success) {
          await this.cacheNotifications(notificationsResponse.data?.data || []);
        }

        if (healthCentersResponse?.success) {
          await this.cacheHealthCenters(healthCentersResponse.data?.data || []);
        }

        if (servicesResponse?.success) {
          await this.cacheServices(servicesResponse.data?.data || []);
        }

        await this.updateLastSync();
      } catch (error) {
        console.error('Failed to fetch fresh data during sync:', error);
      }

      const message = `Sync completed: ${successCount} successful, ${failureCount} failed`;
      return { success: failureCount === 0, message };
    } catch (error) {
      console.error('Sync failed:', error);
      return { success: false, message: 'Sync failed due to an error' };
    }
  }

  // Utility Methods
  async getAllCachedData(): Promise<OfflineData> {
    try {
      const [user, appointments, notifications, healthCenters, services, lastSync] = await Promise.all([
        this.getCachedUserData(),
        this.getCachedAppointments(),
        this.getCachedNotifications(),
        this.getCachedHealthCenters(),
        this.getCachedServices(),
        this.getLastSync(),
      ]);

      return {
        user: user || undefined,
        appointments,
        notifications,
        healthCenters,
        services,
        lastSync: lastSync || '',
      };
    } catch (error) {
      console.error('Failed to get all cached data:', error);
      return {
        appointments: [],
        notifications: [],
        healthCenters: [],
        services: [],
        lastSync: '',
      };
    }
  }

  async clearAllCache(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(this.STORAGE_KEYS.USER),
        AsyncStorage.removeItem(this.STORAGE_KEYS.APPOINTMENTS),
        AsyncStorage.removeItem(this.STORAGE_KEYS.NOTIFICATIONS),
        AsyncStorage.removeItem(this.STORAGE_KEYS.HEALTH_CENTERS),
        AsyncStorage.removeItem(this.STORAGE_KEYS.SERVICES),
        AsyncStorage.removeItem(this.STORAGE_KEYS.SYNC_QUEUE),
        AsyncStorage.removeItem(this.STORAGE_KEYS.LAST_SYNC),
      ]);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  async getCacheSize(): Promise<number> {
    try {
      const keys = Object.values(this.STORAGE_KEYS);
      let totalSize = 0;

      for (const key of keys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          totalSize += new Blob([data]).size;
        }
      }

      return totalSize;
    } catch (error) {
      console.error('Failed to calculate cache size:', error);
      return 0;
    }
  }

  // Offline-specific operations
  async createOfflineAppointment(appointmentData: any): Promise<string> {
    try {
      const tempId = `offline_${Date.now()}`;
      const appointment = {
        ...appointmentData,
        id: tempId,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const appointments = await this.getCachedAppointments();
      appointments.push(appointment);
      await this.cacheAppointments(appointments);

      // Add to sync queue
      await this.addToSyncQueue('create', '/appointments', appointmentData);

      return tempId;
    } catch (error) {
      console.error('Failed to create offline appointment:', error);
      throw error;
    }
  }

  async updateOfflineAppointment(id: string, updateData: any): Promise<void> {
    try {
      const appointments = await this.getCachedAppointments();
      const existingIndex = appointments.findIndex(a => a.appointment_id === id);
      
      if (existingIndex !== -1) {
        appointments[existingIndex] = {
          ...appointments[existingIndex],
          ...updateData,
          updated_at: new Date().toISOString(),
        };
        await this.cacheAppointments(appointments);

        // Add to sync queue
        await this.addToSyncQueue('update', `/appointments/${id}`, updateData);
      }
    } catch (error) {
      console.error('Failed to update offline appointment:', error);
      throw error;
    }
  }

  async deleteOfflineAppointment(id: string): Promise<void> {
    try {
      const appointments = await this.getCachedAppointments();
      const filteredAppointments = appointments.filter(apt => apt.appointment_id !== id);
      await this.cacheAppointments(filteredAppointments);

      // Add to sync queue
      await this.addToSyncQueue('delete', `/appointments/${id}`);
    } catch (error) {
      console.error('Failed to delete offline appointment:', error);
      throw error;
    }
  }

  async markNotificationAsRead(id: string): Promise<void> {
    try {
      const notifications = await this.getCachedNotifications();
      const existingIndex = notifications.findIndex(n => n.id === id);
      
      if (existingIndex !== -1) {
        notifications[existingIndex] = {
          ...notifications[existingIndex],
          is_read: true,
        };
        await this.cacheNotifications(notifications);

        // Add to sync queue
        await this.addToSyncQueue('update', `/notifications/${id}/read`, {});
      }
    } catch (error) {
      console.error('Failed to mark notification as read offline:', error);
      throw error;
    }
  }

  // Additional methods for apiWithOffline compatibility
  async clearAllData(): Promise<void> {
    await this.clearAllCache();
    await this.setOfflineMode(false);
  }

  async queueOfflineAction(action: string, data: any): Promise<void> {
    // Map action types to appropriate endpoints
    let endpoint = '';
    let method: 'create' | 'update' | 'delete' = 'create';

    switch (action) {
      case 'createAppointment':
        endpoint = '/appointments';
        method = 'create';
        break;
      case 'updateAppointment':
        endpoint = `/appointments/${data.id}`;
        method = 'update';
        break;
      case 'updateAppointmentStatus':
        endpoint = `/appointments/${data.id}/status`;
        method = 'update';
        break;
      default:
        console.warn(`Unknown offline action: ${action}`);
        return;
    }

    await this.addToSyncQueue(method, endpoint, data);
  }
}

export default new OfflineService();
