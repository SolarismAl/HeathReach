import { Alert } from 'react-native';
import offlineService from './offline';
import apiService from './api';

interface ConnectivityState {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
}

class ConnectivityService {
  private isConnected: boolean = true;
  private listeners: ((state: ConnectivityState) => void)[] = [];
  private checkInterval: ReturnType<typeof setInterval> | null = null;

  async initialize(): Promise<void> {
    try {
      // Check initial connection state
      await this.checkConnection();

      // Start periodic connection checks
      this.checkInterval = setInterval(() => {
        this.checkConnection();
      }, 30000); // Check every 30 seconds
    } catch (error) {
      console.error('Failed to initialize connectivity service:', error);
    }
  }

  private async handleConnectionChange(wasConnected: boolean, isConnected: boolean): Promise<void> {
    if (!wasConnected && isConnected) {
      // Just came back online
      this.handleComingOnline();
    } else if (wasConnected && !isConnected) {
      // Just went offline
      this.handleGoingOffline();
    }
  }

  private async handleComingOnline(): Promise<void> {
    try {
      console.log('Device came back online, attempting to sync...');
      
      // Attempt to sync offline data
      const syncResult = await offlineService.syncWithServer(apiService);
      
      if (syncResult.success) {
        console.log('Sync successful:', syncResult.message);
        // Optionally show success notification
      } else {
        console.warn('Sync partially failed:', syncResult.message);
        // Optionally show warning notification
      }
    } catch (error) {
      console.error('Failed to sync when coming online:', error);
    }
  }

  private handleGoingOffline(): void {
    console.log('Device went offline, switching to offline mode...');
    offlineService.setOfflineMode(true);
    
    // Optionally show offline notification
    Alert.alert(
      'Offline Mode',
      'You are now offline. Your data will be synced when you reconnect.',
      [{ text: 'OK' }]
    );
  }

  addListener(listener: (state: ConnectivityState) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  getConnectionState(): boolean {
    return this.isConnected;
  }

  async checkConnection(): Promise<ConnectivityState> {
    try {
      // Check connectivity by testing our own API endpoint instead of Google
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('https://healthreach-api.onrender.com/api/test/status', { 
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      const wasConnected = this.isConnected;
      this.isConnected = response.ok;
      
      const connectivityState: ConnectivityState = {
        isConnected: this.isConnected,
        isInternetReachable: this.isConnected,
        type: 'unknown',
      };

      // Notify listeners if state changed
      if (wasConnected !== this.isConnected) {
        this.listeners.forEach(listener => listener(connectivityState));
        await this.handleConnectionChange(wasConnected, this.isConnected);
      }

      return connectivityState;
    } catch (error) {
      console.error('Failed to check connection:', error);
      const wasConnected = this.isConnected;
      this.isConnected = false;
      
      const connectivityState: ConnectivityState = {
        isConnected: false,
        isInternetReachable: false,
        type: 'unknown',
      };

      // Notify listeners if state changed
      if (wasConnected !== this.isConnected) {
        this.listeners.forEach(listener => listener(connectivityState));
        await this.handleConnectionChange(wasConnected, this.isConnected);
      }

      return connectivityState;
    }
  }

  async forceSync(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.isConnected) {
        return { success: false, message: 'No internet connection available' };
      }

      return await offlineService.syncWithServer(apiService);
    } catch (error) {
      console.error('Force sync failed:', error);
      return { success: false, message: 'Sync failed due to an error' };
    }
  }

  cleanup(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.listeners = [];
  }
}

export default new ConnectivityService();
