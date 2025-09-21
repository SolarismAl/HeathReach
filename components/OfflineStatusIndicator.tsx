import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import connectivityService from '../services/connectivity';
import offlineService from '../services/offline';

interface OfflineStatusIndicatorProps {
  style?: any;
}

export default function OfflineStatusIndicator({ style }: OfflineStatusIndicatorProps) {
  const [isConnected, setIsConnected] = useState(true);
  const [syncQueueCount, setSyncQueueCount] = useState(0);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Initialize connectivity service
    connectivityService.initialize();

    // Listen for connectivity changes
    const unsubscribe = connectivityService.addListener((state) => {
      setIsConnected(state.isConnected);
      
      if (!state.isConnected) {
        // Show offline indicator
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else {
        // Hide offline indicator after a delay
        setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }, 2000);
      }
    });

    // Load initial sync status
    loadSyncStatus();

    // Update sync status periodically
    const interval = setInterval(loadSyncStatus, 10000); // Every 10 seconds

    return () => {
      unsubscribe();
      clearInterval(interval);
      connectivityService.cleanup();
    };
  }, []);

  const loadSyncStatus = async () => {
    try {
      const syncQueue = await offlineService.getSyncQueue();
      setSyncQueueCount(syncQueue.length);
      
      const lastSyncTime = await offlineService.getLastSync();
      setLastSync(lastSyncTime);
    } catch (error) {
      console.error('Failed to load sync status:', error);
    }
  };

  const handleForceSync = async () => {
    try {
      if (!isConnected) {
        Alert.alert('No Connection', 'Please check your internet connection and try again.');
        return;
      }

      Alert.alert(
        'Sync Data',
        'This will sync your offline data with the server. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sync',
            onPress: async () => {
              const result = await connectivityService.forceSync();
              Alert.alert(
                result.success ? 'Sync Complete' : 'Sync Failed',
                result.message
              );
              await loadSyncStatus();
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to sync data');
    }
  };

  const formatLastSync = (lastSyncTime: string | null) => {
    if (!lastSyncTime) return 'Never';
    
    const syncDate = new Date(lastSyncTime);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - syncDate.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return syncDate.toLocaleDateString();
  };

  if (isConnected && syncQueueCount === 0) {
    return null; // Don't show anything when online and no pending sync
  }

  return (
    <Animated.View style={[styles.container, style, { opacity: fadeAnim }]}>
      <TouchableOpacity style={styles.statusBar} onPress={handleForceSync}>
        <View style={styles.statusContent}>
          <Ionicons
            name={isConnected ? 'cloud-upload-outline' : 'cloud-offline-outline'}
            size={16}
            color="#FFFFFF"
          />
          <Text style={styles.statusText}>
            {!isConnected ? 'Offline Mode' : `${syncQueueCount} items to sync`}
          </Text>
          {isConnected && syncQueueCount > 0 && (
            <Text style={styles.syncText}>Tap to sync</Text>
          )}
        </View>
        
        {lastSync && (
          <Text style={styles.lastSyncText}>
            Last sync: {formatLastSync(lastSync)}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  statusBar: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  syncText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginLeft: 8,
  },
  lastSyncText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
  },
});
