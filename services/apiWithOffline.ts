import { ApiResponse, User, HealthCenter, Service, Appointment, Notification } from '../types';
import apiService from './api';
import offlineService from './offline';
import connectivityService from './connectivity';

class ApiWithOfflineService {
  // Authentication methods
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const isConnected = connectivityService.getConnectionState();
      
      if (!isConnected) {
        return { success: false, message: 'No internet connection. Please try again when online.' };
      }

      const response = await apiService.login(email, password);
      
      if (response.success && response.data) {
        // Cache user data for offline access
        await offlineService.cacheUserData(response.data.user);
        await offlineService.setOfflineMode(false);
      }
      
      return response;
    } catch (error: any) {
      return { success: false, message: error.message || 'Login failed' };
    }
  }

  async register(userData: any): Promise<ApiResponse> {
    try {
      const isConnected = connectivityService.getConnectionState();
      
      if (!isConnected) {
        return { success: false, message: 'No internet connection. Registration requires internet access.' };
      }

      return await apiService.register(userData);
    } catch (error: any) {
      return { success: false, message: error.message || 'Registration failed' };
    }
  }

  async logout(): Promise<ApiResponse> {
    try {
      const isConnected = connectivityService.getConnectionState();
      
      if (isConnected) {
        await apiService.logout();
      }
      
      // Clear offline data
      await offlineService.clearAllData();
      
      return { success: true, message: 'Logged out successfully' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Logout failed' };
    }
  }

  // Profile methods
  async getProfile(): Promise<ApiResponse<User>> {
    try {
      const isConnected = connectivityService.getConnectionState();
      
      if (isConnected) {
        const response = await apiService.getProfile();
        if (response.success && response.data) {
          await offlineService.cacheUserData(response.data);
        }
        return response;
      } else {
        return { success: false, message: 'No cached user data available' };
      }
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to get profile' };
    }
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const isConnected = connectivityService.getConnectionState();
      
      if (!isConnected) {
        return { success: false, message: 'Profile updates require internet connection' };
      }

      const response = await apiService.updateProfile(data);
      if (response.success && response.data) {
        await offlineService.cacheUserData(response.data);
      }
      return response;
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to update profile' };
    }
  }

  // Appointments (with offline support)
  async getAppointments(params?: any): Promise<ApiResponse<Appointment[]>> {
    try {
      const isConnected = connectivityService.getConnectionState();
      
      if (isConnected) {
        const response = await apiService.getAppointments(params);
        if (response.success && response.data) {
          await offlineService.cacheAppointments(response.data);
        }
        return response;
      } else {
        // Return cached appointments
        const cachedAppointments = await offlineService.getCachedAppointments();
        return { success: true, data: cachedAppointments };
      }
    } catch (error: any) {
      // Fallback to cached data
      const cachedAppointments = await offlineService.getCachedAppointments();
      return { success: true, data: cachedAppointments };
    }
  }

  async createAppointment(data: any): Promise<ApiResponse<Appointment>> {
    try {
      const isConnected = connectivityService.getConnectionState();
      
      if (!isConnected) {
        // Store for later sync
        await offlineService.queueOfflineAction('createAppointment', data);
        return { success: false, message: 'Appointment queued for sync when online' };
      }

      const response = await apiService.createAppointment(data);
      if (response.success) {
        // Refresh cached appointments
        const appointmentsResponse = await apiService.getAppointments();
        if (appointmentsResponse.success && appointmentsResponse.data) {
          await offlineService.cacheAppointments(appointmentsResponse.data);
        }
      }
      return response;
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to create appointment' };
    }
  }

  async updateAppointment(id: string, data: any): Promise<ApiResponse<Appointment>> {
    try {
      const isConnected = connectivityService.getConnectionState();
      
      if (!isConnected) {
        // Store for later sync
        await offlineService.queueOfflineAction('updateAppointment', { id, data });
        return { success: false, message: 'Appointment update queued for sync when online' };
      }

      const response = await apiService.updateAppointment(id, data);
      if (response.success) {
        // Refresh cached appointments
        const appointmentsResponse = await apiService.getAppointments();
        if (appointmentsResponse.success && appointmentsResponse.data) {
          await offlineService.cacheAppointments(appointmentsResponse.data);
        }
      }
      return response;
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to update appointment' };
    }
  }

  async updateAppointmentStatus(id: string, status: string): Promise<ApiResponse<Appointment>> {
    try {
      const isConnected = connectivityService.getConnectionState();
      
      if (!isConnected) {
        // Store for later sync
        await offlineService.queueOfflineAction('updateAppointmentStatus', { id, status });
        return { success: false, message: 'Status update queued for sync when online' };
      }

      const response = await apiService.updateAppointmentStatus(id, status);
      if (response.success) {
        // Refresh cached appointments
        const appointmentsResponse = await apiService.getAppointments();
        if (appointmentsResponse.success && appointmentsResponse.data) {
          await offlineService.cacheAppointments(appointmentsResponse.data);
        }
      }
      return response;
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to update appointment status' };
    }
  }

  async deleteAppointment(id: string): Promise<ApiResponse> {
    try {
      const isConnected = connectivityService.getConnectionState();
      
      if (isConnected) {
        const response = await apiService.deleteAppointment(parseInt(id));
        if (response.success) {
          // Refresh cached appointments
          const appointmentsResponse = await apiService.getAppointments();
          if (appointmentsResponse.success && appointmentsResponse.data) {
            await offlineService.cacheAppointments(appointmentsResponse.data);
          }
        }
        return response;
      } else {
        // Delete offline appointment
        await offlineService.deleteOfflineAppointment(id);
        return { success: true };
      }
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to delete appointment' };
    }
  }

  // Notifications (with offline support)
  async getNotifications(params?: any): Promise<ApiResponse<Notification[]>> {
    try {
      const isConnected = connectivityService.getConnectionState();
      
      if (isConnected) {
        const response = await apiService.getNotifications(params);
        if (response.success && response.data) {
          await offlineService.cacheNotifications(response.data);
        }
        return response;
      } else {
        // Return cached notifications
        const cachedNotifications = await offlineService.getCachedNotifications();
        return { success: true, data: cachedNotifications };
      }
    } catch (error: any) {
      // Fallback to cached data
      const cachedNotifications = await offlineService.getCachedNotifications();
      return { success: true, data: cachedNotifications };
    }
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse<any>> {
    try {
      const isConnected = connectivityService.getConnectionState();
      
      if (isConnected) {
        const response = await apiService.markNotificationAsRead(id);
        if (response.success) {
          // Refresh cached notifications
          const notificationsResponse = await apiService.getNotifications();
          if (notificationsResponse.success && notificationsResponse.data) {
            await offlineService.cacheNotifications(notificationsResponse.data);
          }
        }
        return response;
      } else {
        // Mark as read offline
        await offlineService.markNotificationAsRead(id);
        return { success: true };
      }
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to mark notification as read' };
    }
  }

  // Health Centers and Services (read-only, cached)
  async getHealthCenters(): Promise<ApiResponse<HealthCenter[]>> {
    try {
      const isConnected = connectivityService.getConnectionState();
      
      if (isConnected) {
        const response = await apiService.getHealthCenters();
        if (response.success && response.data) {
          await offlineService.cacheHealthCenters(response.data);
        }
        return response;
      } else {
        // Return cached health centers
        const cachedHealthCenters = await offlineService.getCachedHealthCenters();
        return { success: true, data: cachedHealthCenters };
      }
    } catch (error: any) {
      // Fallback to cached data
      const cachedHealthCenters = await offlineService.getCachedHealthCenters();
      return { success: true, data: cachedHealthCenters };
    }
  }

  async getServices(params?: any): Promise<ApiResponse<Service[]>> {
    try {
      const isConnected = connectivityService.getConnectionState();
      
      if (isConnected) {
        const response = await apiService.getServices(params);
        if (response.success && response.data) {
          await offlineService.cacheServices(response.data);
        }
        return response;
      } else {
        // Return cached services
        const cachedServices = await offlineService.getCachedServices();
        return { success: true, data: cachedServices };
      }
    } catch (error: any) {
      // Fallback to cached data
      const cachedServices = await offlineService.getCachedServices();
      return { success: true, data: cachedServices };
    }
  }

  // Service management (for health workers)
  async createService(data: any): Promise<ApiResponse<Service>> {
    try {
      const isConnected = connectivityService.getConnectionState();
      
      if (!isConnected) {
        return { success: false, message: 'Creating services requires internet connection' };
      }

      const response = await apiService.createService(data);
      if (response.success) {
        // Refresh cached services
        const servicesResponse = await apiService.getServices();
        if (servicesResponse.success && servicesResponse.data) {
          await offlineService.cacheServices(servicesResponse.data);
        }
      }
      return response;
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to create service' };
    }
  }

  async updateService(id: string, data: any): Promise<ApiResponse<Service>> {
    try {
      const isConnected = connectivityService.getConnectionState();
      
      if (!isConnected) {
        return { success: false, message: 'Updating services requires internet connection' };
      }

      const response = await apiService.updateService(id, data);
      if (response.success) {
        // Refresh cached services
        const servicesResponse = await apiService.getServices();
        if (servicesResponse.success && servicesResponse.data) {
          await offlineService.cacheServices(servicesResponse.data);
        }
      }
      return response;
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to update service' };
    }
  }

  async deleteService(id: string): Promise<ApiResponse<any>> {
    try {
      const isConnected = connectivityService.getConnectionState();
      
      if (!isConnected) {
        return { success: false, message: 'Deleting services requires internet connection' };
      }

      const response = await apiService.deleteService(id);
      if (response.success) {
        // Refresh cached services
        const servicesResponse = await apiService.getServices();
        if (servicesResponse.success && servicesResponse.data) {
          await offlineService.cacheServices(servicesResponse.data);
        }
      }
      return response;
    } catch (error: any) {
      return { success: false, message: error.message || 'Failed to delete service' };
    }
  }

  async updateUser(id: string, data: any): Promise<ApiResponse<User>> {
    return await apiService.updateUser(id, data);
  }

  async deleteUser(id: string): Promise<ApiResponse<any>> {
    return await apiService.deleteUser(id);
  }

  async getAdminStats(): Promise<ApiResponse> {
    const isConnected = connectivityService.getConnectionState();
    if (!isConnected) {
      return { success: false, message: 'Admin statistics require internet connection' };
    }
    return await apiService.getAdminStats();
  }

  async getActivityLogs(params?: any): Promise<ApiResponse> {
    const isConnected = connectivityService.getConnectionState();
    if (!isConnected) {
      return { success: false, message: 'Activity logs require internet connection' };
    }
    return await apiService.getActivityLogs(params);
  }

  async registerDeviceToken(data: any): Promise<ApiResponse> {
    const isConnected = connectivityService.getConnectionState();
    if (!isConnected) {
      // Queue for later sync
      await offlineService.addToSyncQueue('create', '/device-tokens', data);
      return { success: true, message: 'Device token queued for sync' };
    }
    return await apiService.saveDeviceToken(data);
  }
}

export default new ApiWithOfflineService();
