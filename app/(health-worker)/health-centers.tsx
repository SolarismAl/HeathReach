import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';
import { HealthCenter, Service } from '../../types';

export default function HealthCentersScreen() {
  const [healthCenters, setHealthCenters] = useState<HealthCenter[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCenter, setEditingCenter] = useState<HealthCenter | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contact_number: '',
    email: '',
    description: '',
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [centersResponse, servicesResponse] = await Promise.all([
        apiService.getHealthCenters(),
        apiService.getServices(),
      ]);

      if (centersResponse.success) {
        setHealthCenters(centersResponse.data || []);
      }

      if (servicesResponse.success) {
        setServices(servicesResponse.data || []);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadHealthCenters = async () => {
    await loadData();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHealthCenters();
    setRefreshing(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      contact_number: '',
      email: '',
      description: '',
      is_active: true,
    });
  };

  const handleAddCenter = async () => {
    if (!formData.name.trim() || !formData.address.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const centerData = {
        name: formData.name,
        address: formData.address,
        contact_number: formData.contact_number,
        email: formData.email,
        description: formData.description,
        is_active: formData.is_active,
      };

      const response = await apiService.createHealthCenter(centerData);
      
      if (response.success) {
        Alert.alert('Success', 'Health center created successfully');
        setShowAddModal(false);
        resetForm();
        loadData();
      } else {
        Alert.alert('Error', response.message || 'Failed to create health center');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create health center');
    }
  };

  const handleEditCenter = async () => {
    if (!editingCenter || !formData.name.trim() || !formData.address.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const centerData = {
        name: formData.name,
        address: formData.address,
        contact_number: formData.contact_number,
        email: formData.email,
        description: formData.description,
        is_active: formData.is_active,
      };

      const response = await apiService.updateHealthCenter(editingCenter.health_center_id, centerData);
      
      if (response.success) {
        Alert.alert('Success', 'Health center updated successfully');
        setShowEditModal(false);
        setEditingCenter(null);
        resetForm();
        loadData();
      } else {
        Alert.alert('Error', response.message || 'Failed to update health center');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update health center');
    }
  };

  const handleDeleteCenter = (center: HealthCenter) => {
    Alert.alert(
      'Delete Health Center',
      `Are you sure you want to delete "${center.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiService.deleteHealthCenter(center.health_center_id);
              if (response.success) {
                Alert.alert('Success', 'Health center deleted successfully');
                loadData();
              } else {
                Alert.alert('Error', response.message || 'Failed to delete health center');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete health center');
            }
          }
        }
      ]
    );
  };

  const openEditModal = (center: HealthCenter) => {
    setEditingCenter(center);
    setFormData({
      name: center.name,
      address: center.address || center.location || '',
      contact_number: center.contact_number || '',
      email: center.email || '',
      description: center.description || '',
      is_active: center.is_active ?? true,
    });
    setShowEditModal(true);
  };

  const getServicesCount = (healthCenterId: string) => {
    return services.filter(service => service.health_center_id === healthCenterId).length;
  };

  const renderHealthCenter = ({ item }: { item: HealthCenter }) => {
    const servicesCount = getServicesCount(item.health_center_id);
    
    return (
      <View style={styles.centerCard}>
        <View style={styles.centerHeader}>
          <View style={styles.centerInfo}>
            <Text style={styles.centerName}>{item.name}</Text>
            <View style={styles.centerBadges}>
              <View style={[styles.statusBadge, item.is_active ? styles.activeBadge : styles.inactiveBadge]}>
                <Text style={[styles.statusText, item.is_active ? styles.activeText : styles.inactiveText]}>
                  {item.is_active ? 'Active' : 'Inactive'}
                </Text>
              </View>
              <View style={styles.servicesBadge}>
                <Ionicons name="medical-outline" size={12} color="#4A90E2" />
                <Text style={styles.servicesCount}>{servicesCount} Service{servicesCount !== 1 ? 's' : ''}</Text>
              </View>
            </View>
          </View>
        </View>

      <View style={styles.centerDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{item.address || item.location}</Text>
        </View>
        
        {item.contact_number && (
          <View style={styles.detailItem}>
            <Ionicons name="call-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{item.contact_number}</Text>
          </View>
        )}

        {item.email && (
          <View style={styles.detailItem}>
            <Ionicons name="mail-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{item.email}</Text>
          </View>
        )}

        {item.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>{item.description}</Text>
          </View>
        )}
      </View>

      <View style={styles.centerActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => openEditModal(item)}
        >
          <Ionicons name="pencil" size={16} color="#2E7D32" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteCenter(item)}
        >
          <Ionicons name="trash" size={16} color="#F44336" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
    );
  };

  const HealthCenterModal = ({ visible, onClose, onSave, title }: any) => (
    <Modal 
      visible={visible} 
      animationType="slide" 
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <TouchableOpacity 
          style={styles.modalContent} 
          activeOpacity={1} 
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Center Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="Enter health center name"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Location *</Text>
              <TextInput
                style={styles.input}
                value={formData.address}
                onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                placeholder="Enter address/location"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Contact Number</Text>
              <TextInput
                style={styles.input}
                value={formData.contact_number}
                onChangeText={(text) => setFormData(prev => ({ ...prev, contact_number: text }))}
                placeholder="+1-555-0123"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                placeholder="center@healthreach.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="Brief description of the health center"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.inputLabel}>Active Center</Text>
              <Switch
                value={formData.is_active}
                onValueChange={(value) => setFormData(prev => ({ ...prev, is_active: value }))}
                trackColor={{ false: '#767577', true: '#2E7D32' }}
                thumbColor={formData.is_active ? '#FFFFFF' : '#f4f3f4'}
              />
            </View>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={onSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Add Button */}
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setShowAddModal(true);
          }}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Health Center</Text>
        </TouchableOpacity>
      </View>

      {/* Health Centers List */}
      <FlatList
        data={healthCenters}
        keyExtractor={(item) => item.health_center_id}
        renderItem={renderHealthCenter}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="business-outline" size={64} color="#CCC" />
            <Text style={styles.emptyStateTitle}>No Health Centers Found</Text>
            <Text style={styles.emptyStateText}>
              Start by adding your first health center to organize your services.
            </Text>
          </View>
        }
      />

      {/* Add Health Center Modal */}
      <HealthCenterModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddCenter}
        title="Add New Health Center"
      />

      {/* Edit Health Center Modal */}
      <HealthCenterModal
        visible={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingCenter(null);
          resetForm();
        }}
        onSave={handleEditCenter}
        title="Edit Health Center"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerActions: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  listContainer: {
    padding: 16,
  },
  centerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  centerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  centerInfo: {
    flex: 1,
  },
  centerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  centerBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  servicesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  servicesCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A90E2',
  },
  activeBadge: {
    backgroundColor: '#E8F5E8',
  },
  inactiveBadge: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeText: {
    color: '#2E7D32',
  },
  inactiveText: {
    color: '#F44336',
  },
  centerDetails: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  descriptionContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  centerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 32,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#4A90E2',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
