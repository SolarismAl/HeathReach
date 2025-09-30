import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';
import { CreateNotificationData, Notification } from '../../types';

export default function AdminNotificationsScreen() {
  const [activeTab, setActiveTab] = useState<'send' | 'history'>('send');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Send notification form
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'admin' as 'appointment' | 'service' | 'admin' | 'general',
    recipient: 'all' as 'all' | 'patients' | 'health_workers',
  });

  useEffect(() => {
    if (activeTab === 'history') {
      loadNotifications();
    }
  }, [activeTab]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiService.getNotifications();
      if (response.success) {
        setNotifications(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleSendNotification = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      Alert.alert('Error', 'Please fill in both title and message');
      return;
    }

    setLoading(true);
    try {
      const notificationData: CreateNotificationData = {
        title: formData.title.trim(),
        message: formData.message.trim(),
        type: formData.type,
        role: formData.recipient === 'all' ? undefined : 
              formData.recipient === 'patients' ? 'patient' : 'health_worker',
      };

      console.log('=== SENDING ADMIN NOTIFICATION ===');
      console.log('Notification data:', notificationData);

      const response = await apiService.sendNotification(notificationData);
      
      if (response.success) {
        Alert.alert('Success', 'Notification sent successfully!');
        setFormData({
          title: '',
          message: '',
          type: 'admin',
          recipient: 'all',
        });
        // Refresh notifications if on history tab
        if (activeTab === 'history') {
          loadNotifications();
        }
      } else {
        Alert.alert('Error', response.message || 'Failed to send notification');
      }
    } catch (error: any) {
      console.error('Send notification error:', error);
      Alert.alert('Error', error.message || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment': return 'calendar';
      case 'service': return 'medical';
      case 'admin': return 'shield-checkmark';
      default: return 'information-circle';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'appointment': return '#4A90E2';
      case 'service': return '#2E7D32';
      case 'admin': return '#D32F2F';
      default: return '#666';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <View style={styles.notificationCard}>
      <View style={styles.notificationHeader}>
        <View style={[
          styles.notificationIcon,
          { backgroundColor: getNotificationColor(item.type) + '20' }
        ]}>
          <Ionicons
            name={getNotificationIcon(item.type) as any}
            size={20}
            color={getNotificationColor(item.type)}
          />
        </View>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>
            {item.title}
          </Text>
          <Text style={styles.notificationTime}>
            {formatDate(item.created_at)} • {item.type}
          </Text>
        </View>
      </View>
      
      <Text style={styles.notificationMessage}>
        {item.message}
      </Text>

      {item.data && (
        <View style={styles.notificationData}>
          <Text style={styles.notificationDataText}>
            Additional data: {JSON.stringify(item.data)}
          </Text>
        </View>
      )}
    </View>
  );

  const renderSendTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>Send Notification</Text>
        
        {/* Recipient Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Send To</Text>
          <View style={styles.recipientContainer}>
            {[
              { key: 'all', label: 'All Users', icon: 'people' },
              { key: 'patients', label: 'Patients Only', icon: 'person' },
              { key: 'health_workers', label: 'Health Workers', icon: 'medical' },
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.recipientOption,
                  formData.recipient === option.key && styles.recipientOptionActive
                ]}
                onPress={() => setFormData({ ...formData, recipient: option.key as any })}
              >
                <Ionicons
                  name={option.icon as any}
                  size={20}
                  color={formData.recipient === option.key ? '#FFFFFF' : '#666'}
                />
                <Text style={[
                  styles.recipientOptionText,
                  formData.recipient === option.key && styles.recipientOptionTextActive
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notification Type */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notification Type</Text>
          <View style={styles.typeContainer}>
            {[
              { key: 'admin', label: 'Admin Alert', color: '#D32F2F' },
              { key: 'general', label: 'General Info', color: '#666' },
              { key: 'appointment', label: 'Appointment', color: '#4A90E2' },
              { key: 'service', label: 'Service Update', color: '#2E7D32' },
            ].map((type) => (
              <TouchableOpacity
                key={type.key}
                style={[
                  styles.typeOption,
                  formData.type === type.key && { backgroundColor: type.color + '20', borderColor: type.color }
                ]}
                onPress={() => setFormData({ ...formData, type: type.key as any })}
              >
                <Text style={[
                  styles.typeOptionText,
                  formData.type === type.key && { color: type.color }
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Title Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.textInput}
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            placeholder="Enter notification title"
            maxLength={100}
          />
          <Text style={styles.charCount}>{formData.title.length}/100</Text>
        </View>

        {/* Message Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Message *</Text>
          <TextInput
            style={[styles.textInput, styles.messageInput]}
            value={formData.message}
            onChangeText={(text) => setFormData({ ...formData, message: text })}
            placeholder="Enter notification message"
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          <Text style={styles.charCount}>{formData.message.length}/500</Text>
        </View>

        {/* Send Button */}
        <TouchableOpacity
          style={[styles.sendButton, loading && styles.sendButtonDisabled]}
          onPress={handleSendNotification}
          disabled={loading}
        >
          {loading ? (
            <>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.sendButtonText}>Sending...</Text>
            </>
          ) : (
            <>
              <Ionicons name="send" size={20} color="#FFFFFF" />
              <Text style={styles.sendButtonText}>Send Notification</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderHistoryTab = () => {
    if (loading && notifications.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D32F2F" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="notifications-outline" size={64} color="#CCC" />
              <Text style={styles.emptyStateTitle}>No Notifications</Text>
              <Text style={styles.emptyStateText}>
                No notifications have been sent yet.
              </Text>
            </View>
          }
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'send' && styles.tabButtonActive]}
          onPress={() => setActiveTab('send')}
        >
          <Ionicons
            name="send"
            size={20}
            color={activeTab === 'send' ? '#D32F2F' : '#666'}
          />
          <Text style={[
            styles.tabButtonText,
            activeTab === 'send' && styles.tabButtonTextActive
          ]}>
            Send Alert
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'history' && styles.tabButtonActive]}
          onPress={() => setActiveTab('history')}
        >
          <Ionicons
            name="time"
            size={20}
            color={activeTab === 'history' ? '#D32F2F' : '#666'}
          />
          <Text style={[
            styles.tabButtonText,
            activeTab === 'history' && styles.tabButtonTextActive
          ]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'send' ? renderSendTab() : renderHistoryTab()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#D32F2F',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginLeft: 8,
  },
  tabButtonTextActive: {
    color: '#D32F2F',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  recipientContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recipientOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  recipientOptionActive: {
    backgroundColor: '#D32F2F',
    borderColor: '#D32F2F',
  },
  recipientOptionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    fontWeight: '500',
  },
  recipientOptionTextActive: {
    color: '#FFFFFF',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  typeOptionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D32F2F',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  sendButtonDisabled: {
    backgroundColor: '#CCC',
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  listContainer: {
    padding: 16,
  },
  notificationCard: {
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
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationData: {
    backgroundColor: '#F8F9FA',
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  notificationDataText: {
    fontSize: 12,
    color: '#666',
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
});
