import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';
import { CreateNotificationData } from '../../types';

export default function SendNotificationScreen() {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'general' as 'appointment' | 'service' | 'admin' | 'general',
    recipient: 'all' as 'all' | 'patients' | 'health_workers',
  });
  const [loading, setLoading] = useState(false);

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

      const response = await apiService.sendNotification(notificationData);
      
      if (response.success) {
        Alert.alert('Success', 'Notification sent successfully!');
        setFormData({
          title: '',
          message: '',
          type: 'general',
          recipient: 'all',
        });
      } else {
        Alert.alert('Error', response.message || 'Failed to send notification');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const notificationTypes = [
    { key: 'general', label: 'General', icon: 'information-circle', color: '#4A90E2' },
    { key: 'appointment', label: 'Appointment', icon: 'calendar', color: '#FF9800' },
    { key: 'service', label: 'Service', icon: 'medical', color: '#2E7D32' },
    { key: 'admin', label: 'Admin', icon: 'shield-checkmark', color: '#F44336' },
  ];

  const recipients = [
    { key: 'all', label: 'All Users', icon: 'people' },
    { key: 'patients', label: 'Patients Only', icon: 'person' },
    { key: 'health_workers', label: 'Health Workers Only', icon: 'medical' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Send Notification</Text>
        <Text style={styles.headerSubtitle}>
          Broadcast important messages to users
        </Text>
      </View>

      {/* Notification Type */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Type</Text>
        <View style={styles.typeGrid}>
          {notificationTypes.map((type) => (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.typeCard,
                formData.type === type.key && styles.typeCardSelected,
                { borderColor: type.color }
              ]}
              onPress={() => setFormData(prev => ({ ...prev, type: type.key as any }))}
            >
              <Ionicons 
                name={type.icon as any} 
                size={24} 
                color={formData.type === type.key ? type.color : '#666'} 
              />
              <Text style={[
                styles.typeCardText,
                formData.type === type.key && { color: type.color }
              ]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recipients */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Send To</Text>
        <View style={styles.recipientList}>
          {recipients.map((recipient) => (
            <TouchableOpacity
              key={recipient.key}
              style={[
                styles.recipientCard,
                formData.recipient === recipient.key && styles.recipientCardSelected
              ]}
              onPress={() => setFormData(prev => ({ ...prev, recipient: recipient.key as any }))}
            >
              <Ionicons 
                name={recipient.icon as any} 
                size={20} 
                color={formData.recipient === recipient.key ? '#2E7D32' : '#666'} 
              />
              <Text style={[
                styles.recipientCardText,
                formData.recipient === recipient.key && styles.recipientCardTextSelected
              ]}>
                {recipient.label}
              </Text>
              {formData.recipient === recipient.key && (
                <Ionicons name="checkmark-circle" size={20} color="#2E7D32" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Title Input */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Title</Text>
        <TextInput
          style={styles.titleInput}
          placeholder="Enter notification title..."
          value={formData.title}
          onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
          maxLength={100}
        />
        <Text style={styles.characterCount}>{formData.title.length}/100</Text>
      </View>

      {/* Message Input */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Message</Text>
        <TextInput
          style={styles.messageInput}
          placeholder="Enter your message here..."
          value={formData.message}
          onChangeText={(text) => setFormData(prev => ({ ...prev, message: text }))}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          maxLength={500}
        />
        <Text style={styles.characterCount}>{formData.message.length}/500</Text>
      </View>

      {/* Preview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preview</Text>
        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <View style={styles.previewIcon}>
              <Ionicons 
                name={notificationTypes.find(t => t.key === formData.type)?.icon as any || 'information-circle'} 
                size={20} 
                color={notificationTypes.find(t => t.key === formData.type)?.color || '#4A90E2'} 
              />
            </View>
            <View style={styles.previewContent}>
              <Text style={styles.previewTitle}>
                {formData.title || 'Notification Title'}
              </Text>
              <Text style={styles.previewTime}>Just now</Text>
            </View>
          </View>
          <Text style={styles.previewMessage}>
            {formData.message || 'Your notification message will appear here...'}
          </Text>
        </View>
      </View>

      {/* Send Button */}
      <View style={styles.sendSection}>
        <TouchableOpacity
          style={[styles.sendButton, loading && styles.sendButtonDisabled]}
          onPress={handleSendNotification}
          disabled={loading || !formData.title.trim() || !formData.message.trim()}
        >
          <Ionicons name="send" size={20} color="#FFFFFF" />
          <Text style={styles.sendButtonText}>
            {loading ? 'Sending...' : 'Send Notification'}
          </Text>
        </TouchableOpacity>

        <View style={styles.sendInfo}>
          <Ionicons name="information-circle-outline" size={16} color="#666" />
          <Text style={styles.sendInfoText}>
            This will send a push notification to {
              formData.recipient === 'all' ? 'all users' :
              formData.recipient === 'patients' ? 'all patients' :
              'all health workers'
            }
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#2E7D32',
    padding: 24,
    paddingBottom: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
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
    marginBottom: 16,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },
  typeCardSelected: {
    backgroundColor: '#F8F9FA',
  },
  typeCardText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  recipientList: {
    gap: 8,
  },
  recipientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },
  recipientCardSelected: {
    backgroundColor: '#E8F5E8',
    borderColor: '#2E7D32',
  },
  recipientCardText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  recipientCardTextSelected: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    minHeight: 120,
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  previewCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  previewIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  previewContent: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  previewTime: {
    fontSize: 12,
    color: '#999',
  },
  previewMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  sendSection: {
    margin: 16,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  sendButtonDisabled: {
    backgroundColor: '#B0B0B0',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  sendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
  },
  sendInfoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
});
