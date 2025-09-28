import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types';

export default function ProfileScreen() {
  const { user: authUser, signOut } = useAuth();
  console.log('Patient Profile: signOut function available:', typeof signOut);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    loadProfile();
  }, [authUser]);

  useEffect(() => {
    console.log('User state changed:', user);
    
    // Update form whenever user data changes
    if (user) {
      console.log('Updating editForm with user data:', user);
      const newFormData = {
        name: user.name || '',
        email: user.email || '',
        phone: user.contact_number || '',
        address: user.address || '',
      };
      console.log('Setting editForm to:', newFormData);
      setEditForm(newFormData);
    }
  }, [user]);

  // Add useEffect to track editForm changes
  useEffect(() => {
    console.log('EditForm state updated:', editForm);
  }, [editForm]);

  const loadProfile = async () => {
    try {
      console.log('Loading profile... AuthUser:', authUser);
      
      // First try to get profile from backend API
      const response = await apiService.getProfile();
      console.log('Profile API response:', response);
      
      if (response.success && response.data) {
        console.log('Setting user from API:', response.data);
        console.log('Full response structure:', JSON.stringify(response, null, 2));
        
        // Handle nested user data structure - check if data has a user property
        let userData;
        if (response.data && typeof response.data === 'object' && 'user' in response.data) {
          userData = (response.data as any).user;
          console.log('Found nested user data:', userData);
        } else {
          userData = response.data;
          console.log('Using direct data:', userData);
        }
        console.log('Extracted user data:', userData);
        console.log('User data fields:', {
          name: userData?.name,
          email: userData?.email,
          contact_number: userData?.contact_number,
          address: userData?.address,
          role: userData?.role
        });
        
        setUser(userData);
        console.log('User state set to:', userData);
        // Form will be populated by useEffect when user state changes
      } else {
        console.log('API failed, using AuthContext user:', authUser);
        // Fallback to AuthContext user data
        if (authUser) {
          setUser(authUser);
          // Form will be populated by useEffect when user state changes
        } else {
          console.log('No user data available');
        }
      }
    } catch (error) {
      console.error('Profile loading error:', error);
      // Fallback to AuthContext user data
      if (authUser) {
        console.log('Error occurred, using AuthContext user:', authUser);
        setUser(authUser);
        // Form will be populated by useEffect when user state changes
      } else {
        console.log('No fallback user data available');
        Alert.alert('Error', 'Failed to load profile. Please try logging in again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      console.log('=== PROFILE UPDATE ATTEMPT ===');
      console.log('Form data being sent:', editForm);
      console.log('Current user state:', user);
      
      // Map frontend field names to backend field names
      const backendData = {
        name: editForm.name,
        email: editForm.email,
        contact_number: editForm.phone, // Map 'phone' to 'contact_number'
        address: editForm.address,
      };
      console.log('Mapped data for backend:', backendData);
      
      const response = await apiService.updateProfile(backendData);
      console.log('Update profile response:', response);
      
      if (response.success && response.data) {
        // Handle nested user data structure - same logic as loadProfile
        let userData;
        if (response.data && typeof response.data === 'object' && 'user' in response.data) {
          userData = (response.data as any).user;
          console.log('Update: Found nested user data:', userData);
        } else {
          userData = response.data;
          console.log('Update: Using direct data:', userData);
        }
        
        setUser(userData);
        console.log('Update: User state set to:', userData);
        setEditModalVisible(false);
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        Alert.alert('Error', response.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Update profile error:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    }
  };

  const handleLogout = async () => {
    console.log('=== LOGOUT BUTTON PRESSED ===');
    console.log('Patient Profile: Logout button clicked');
    
    try {
      console.log('Patient Profile: Starting logout process...');
      await signOut();
      console.log('Patient Profile: Logout successful, navigating to landing page');
      // Use setTimeout to ensure state updates are processed
      setTimeout(() => {
        router.replace('/');
      }, 100);
    } catch (error) {
      console.error('Patient Profile: Logout error:', error);
      // Even if there's an error, still navigate away
      setTimeout(() => {
        router.replace('/');
      }, 100);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  console.log('Rendering profile with user:', user);
  console.log('User name for display:', user?.name);
  console.log('User email for display:', user?.email);
  
  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={50} color="#FFFFFF" />
        </View>
        <Text style={styles.userName}>{user?.name || 'No Name'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'No Email'}</Text>
        <Text style={styles.userRole}>
          {user?.role === 'patient' ? 'Patient' : user?.role === 'health_worker' ? 'Health Worker' : user?.role === 'admin' ? 'Administrator' : 'User'}
        </Text>
      </View>

      {/* Profile Information */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              console.log('Edit button pressed');
              console.log('Current user data:', user);
              console.log('Current editForm state:', editForm);
              
              // Ensure form is populated with current user data
              if (user) {
                setEditForm({
                  name: user.name || '',
                  email: user.email || '',
                  phone: user.contact_number || '',
                  address: user.address || '',
                });
                console.log('Form populated with user data:', {
                  name: user.name || '',
                  email: user.email || '',
                  phone: user.contact_number || '',
                  address: user.address || '',
                });
              }
              
              setEditModalVisible(true);
            }}
          >
            <Ionicons name="pencil" size={16} color="#4A90E2" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="person-outline" size={20} color="#666" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Full Name</Text>
            <Text style={styles.infoValue}>{user?.name || 'Not provided'}</Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="mail-outline" size={20} color="#666" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email Address</Text>
            <Text style={styles.infoValue}>{user?.email || 'Not provided'}</Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="call-outline" size={20} color="#666" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Phone Number</Text>
            <Text style={styles.infoValue}>{user?.contact_number || 'Not provided'}</Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="location-outline" size={20} color="#666" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={styles.infoValue}>{user?.address || 'Not provided'}</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity style={styles.actionItem}>
          <Ionicons name="notifications-outline" size={20} color="#4A90E2" />
          <Text style={styles.actionText}>Notification Settings</Text>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}>
          <Ionicons name="shield-outline" size={20} color="#4A90E2" />
          <Text style={styles.actionText}>Privacy Settings</Text>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}>
          <Ionicons name="help-circle-outline" size={20} color="#4A90E2" />
          <Text style={styles.actionText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionItem}
          activeOpacity={0.7}
          onPress={() => {
            console.log('About HealthReach button pressed - attempting navigation');
            try {
              router.push('/(patient)/about');
              console.log('Navigation call completed');
            } catch (error) {
              console.error('Navigation error:', error);
              Alert.alert('Error', 'Failed to open About page');
            }
          }}
        >
          <Ionicons name="information-circle-outline" size={20} color="#4A90E2" />
          <Text style={styles.actionText}>About HealthReach</Text>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionItem}
          activeOpacity={0.7}
          onPress={() => {
            console.log('=== DEBUG PROFILE EDIT ===');
            console.log('User state:', user);
            console.log('EditForm state:', editForm);
            
            // Test form update
            const testData = {
              name: 'Test Name Update',
              email: user?.email || 'test@example.com',
              contact_number: '123-456-7890' // Use correct backend field name
            };
            
            Alert.alert(
              'Debug Profile Edit',
              `Current User: ${user?.name || 'null'}\nCurrent Form: ${editForm.name || 'empty'}\n\nTesting with: ${testData.name}`,
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Test Update', 
                  onPress: async () => {
                    try {
                      const response = await apiService.updateProfile(testData);
                      Alert.alert('Test Result', `Success: ${response.success}\nMessage: ${response.message}`);
                    } catch (error: any) {
                      Alert.alert('Test Error', error.message);
                    }
                  }
                }
              ]
            );
          }}
        >
          <Ionicons name="bug-outline" size={20} color="#4A90E2" />
          <Text style={styles.actionText}>Debug Profile Edit</Text>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>
      </View>

      {/* Logout Section */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color="#F44336" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.name}
                  onChangeText={(text) => {
                    console.log('Name field changed:', text);
                    setEditForm(prev => ({ ...prev, name: text }));
                  }}
                  placeholder="Enter your full name"
                  editable={true}
                  selectTextOnFocus={true}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.email}
                  onChangeText={(text) => {
                    console.log('Email field changed:', text);
                    setEditForm(prev => ({ ...prev, email: text }));
                  }}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={true}
                  selectTextOnFocus={true}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.phone}
                  onChangeText={(text) => {
                    console.log('Phone field changed:', text);
                    setEditForm(prev => ({ ...prev, phone: text }));
                  }}
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                  editable={true}
                  selectTextOnFocus={true}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Address</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={editForm.address}
                  onChangeText={(text) => {
                    console.log('Address field changed:', text);
                    setEditForm(prev => ({ ...prev, address: text }));
                  }}
                  placeholder="Enter your address"
                  multiline={true}
                  numberOfLines={3}
                  editable={true}
                  selectTextOnFocus={true}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleUpdateProfile}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
  },
  profileHeader: {
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  userRole: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#E3F2FD',
  },
  editButtonText: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '600',
    marginLeft: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },
  logoutText: {
    fontSize: 16,
    color: '#F44336',
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
    height: 80,
    textAlignVertical: 'top',
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
    backgroundColor: '#4A90E2',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
