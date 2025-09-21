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
import { Service, HealthCenter } from '../../types';

export default function ServiceManagerScreen() {
  const [services, setServices] = useState<Service[]>([]);
  const [healthCenters, setHealthCenters] = useState<HealthCenter[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration_minutes: '',
    price: '',
    health_center_id: '',
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [servicesResponse, centersResponse] = await Promise.all([
        apiService.getServices(),
        apiService.getHealthCenters(),
      ]);

      if (servicesResponse.success) {
        setServices(servicesResponse.data || []);
      }

      if (centersResponse.success) {
        setHealthCenters(centersResponse.data || []);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      duration_minutes: '',
      price: '',
      health_center_id: '',
      is_active: true,
    });
  };

  const handleAddService = async () => {
    if (!formData.name.trim() || !formData.description.trim() || !formData.duration_minutes || !formData.health_center_id) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const serviceData = {
        service_name: formData.name,
        description: formData.description,
        duration_minutes: parseInt(formData.duration_minutes),
        price: formData.price ? parseFloat(formData.price) : undefined,
        health_center_id: formData.health_center_id,
        is_active: formData.is_active,
      };

      const response = await apiService.createService(serviceData);
      
      if (response.success) {
        Alert.alert('Success', 'Service created successfully');
        setShowAddModal(false);
        resetForm();
        loadData();
      } else {
        Alert.alert('Error', response.message || 'Failed to create service');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create service');
    }
  };

  const handleEditService = async () => {
    if (!editingService || !formData.name.trim() || !formData.description.trim() || !formData.duration_minutes || !formData.health_center_id) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const serviceData = {
        service_name: formData.name,
        description: formData.description,
        duration_minutes: parseInt(formData.duration_minutes),
        price: formData.price ? parseFloat(formData.price) : undefined,
        health_center_id: formData.health_center_id,
        is_active: formData.is_active,
      };

      const response = await apiService.updateService(editingService.service_id, serviceData);
      
      if (response.success) {
        Alert.alert('Success', 'Service updated successfully');
        setShowEditModal(false);
        setEditingService(null);
        resetForm();
        loadData();
      } else {
        Alert.alert('Error', response.message || 'Failed to update service');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update service');
    }
  };

  const handleDeleteService = (service: Service) => {
    Alert.alert(
      'Delete Service',
      `Are you sure you want to delete "${service.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiService.deleteService(service.service_id);
              if (response.success) {
                Alert.alert('Success', 'Service deleted successfully');
                loadData();
              } else {
                Alert.alert('Error', response.message || 'Failed to delete service');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete service');
            }
          }
        }
      ]
    );
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      duration_minutes: service.duration_minutes?.toString() || '',
      price: service.price?.toString() || '',
      health_center_id: service.health_center_id,
      is_active: service.is_active,
    });
    setShowEditModal(true);
  };

  const renderService = ({ item }: { item: Service }) => (
    <View style={styles.serviceCard}>
      <View style={styles.serviceHeader}>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{item.name}</Text>
          <Text style={styles.serviceDescription}>{item.description}</Text>
        </View>
        <View style={[styles.statusBadge, item.is_active ? styles.activeBadge : styles.inactiveBadge]}>
          <Text style={[styles.statusText, item.is_active ? styles.activeText : styles.inactiveText]}>
            {item.is_active ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      <View style={styles.serviceDetails}>
        {item.duration_minutes && (
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{item.duration_minutes} minutes</Text>
          </View>
        )}
        
        {item.price && (
          <View style={styles.detailItem}>
            <Ionicons name="card-outline" size={16} color="#666" />
            <Text style={styles.detailText}>${item.price}</Text>
          </View>
        )}

        <View style={styles.detailItem}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{item.health_center?.name || 'Health Center'}</Text>
        </View>
      </View>

      <View style={styles.serviceActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => openEditModal(item)}
        >
          <Ionicons name="pencil" size={16} color="#2E7D32" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteService(item)}
        >
          <Ionicons name="trash" size={16} color="#F44336" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const ServiceModal = ({ visible, onClose, onSave, title }: any) => (
    <Modal 
      visible={visible} 
      animationType="slide" 
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.modalOverlayTouch} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Service Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="Enter service name"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="Enter service description"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Duration (minutes) *</Text>
              <TextInput
                style={styles.input}
                value={formData.duration_minutes}
                onChangeText={(text) => setFormData(prev => ({ ...prev, duration_minutes: text }))}
                placeholder="30"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Price (optional)</Text>
              <TextInput
                style={styles.input}
                value={formData.price}
                onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Health Center *</Text>
              {healthCenters.length > 0 ? (
                <View style={styles.pickerContainer}>
                  {healthCenters.map((center) => (
                    <TouchableOpacity
                      key={center.health_center_id}
                      style={[
                        styles.pickerOption,
                        formData.health_center_id === center.health_center_id && styles.pickerOptionSelected
                      ]}
                      onPress={() => setFormData(prev => ({ ...prev, health_center_id: center.health_center_id }))}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        formData.health_center_id === center.health_center_id && styles.pickerOptionTextSelected
                      ]}>
                        {center.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.noHealthCentersContainer}>
                  <Text style={styles.noHealthCentersText}>
                    No health centers available. Please create a health center first.
                  </Text>
                  <TouchableOpacity 
                    style={styles.createCenterButton}
                    onPress={() => {
                      // Close modal and navigate to health centers tab
                      onClose();
                      // You can add navigation logic here if needed
                    }}
                  >
                    <Text style={styles.createCenterButtonText}>Create Health Center</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.inputLabel}>Active Service</Text>
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
        </View>
      </View>
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
          <Text style={styles.addButtonText}>Add Service</Text>
        </TouchableOpacity>
      </View>

      {/* Services List */}
      <FlatList
        data={services}
        keyExtractor={(item) => item.service_id}
        renderItem={renderService}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="medical-outline" size={64} color="#CCC" />
            <Text style={styles.emptyStateTitle}>No Services Found</Text>
            <Text style={styles.emptyStateText}>
              Start by adding your first service to help patients book appointments.
            </Text>
          </View>
        }
      />

      {/* Add Service Modal */}
      <ServiceModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddService}
        title="Add New Service"
      />

      {/* Edit Service Modal */}
      <ServiceModal
        visible={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingService(null);
          resetForm();
        }}
        onSave={handleEditService}
        title="Edit Service"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerActions: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
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
  serviceCard: {
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
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceInfo: {
    flex: 1,
    marginRight: 12,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
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
  serviceDetails: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  serviceActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#E8F5E8',
  },
  editButtonText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '600',
    marginLeft: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FFEBEE',
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#F44336',
    fontWeight: '600',
    marginLeft: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlayTouch: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
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
    marginBottom: 20,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  pickerOptionSelected: {
    backgroundColor: '#E8F5E8',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#333',
  },
  pickerOptionTextSelected: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noHealthCentersContainer: {
    padding: 16,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFB74D',
    alignItems: 'center',
  },
  noHealthCentersText: {
    fontSize: 14,
    color: '#E65100',
    textAlign: 'center',
    marginBottom: 12,
  },
  createCenterButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  createCenterButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
