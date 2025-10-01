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
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types';
import { neumorphism, colors, spacing, borderRadius, typography, shadows } from '../../styles/neumorphism';

export default function ProfileScreen() {
  const { user: authUser, signOut } = useAuth();
  console.log('Patient Profile: signOut function available:', typeof signOut);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [newPasswordForm, setNewPasswordForm] = useState({
    password: '',
    password_confirmation: '',
  });

  useEffect(() => {
    loadProfile();
    checkPasswordStatus();
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
    
    Alert.alert(
      '🚪 Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Patient Profile: Starting logout process...');
              
              // Show logging out message
              Alert.alert(
                '⏳ Logging Out',
                'Please wait...',
                [],
                { cancelable: false }
              );
              
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
          },
        },
      ]
    );
  };

  const checkPasswordStatus = async () => {
    try {
      console.log('=== CHECKING PASSWORD STATUS ===');
      const response = await apiService.hasPassword();
      console.log('HasPassword API response:', response);
      
      if (response.success && response.data) {
        const hasPasswordValue = response.data.has_password;
        console.log('User has password:', hasPasswordValue);
        setHasPassword(hasPasswordValue);
      } else {
        console.log('HasPassword API failed, defaulting to false');
        setHasPassword(false);
      }
    } catch (error) {
      console.error('Error checking password status:', error);
      console.log('HasPassword API error, defaulting to false');
      setHasPassword(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      console.log('=== CHANGE PASSWORD ATTEMPT ===');
      console.log('User has password:', hasPassword);
      
      if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
        Alert.alert('Error', 'New passwords do not match');
        return;
      }

      if (passwordForm.new_password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters long');
        return;
      }

      console.log('Calling changePassword API...');
      const response = await apiService.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
        new_password_confirmation: passwordForm.new_password_confirmation,
      });

      if (response.success) {
        Alert.alert('Success', 'Password changed successfully');
        setPasswordModalVisible(false);
        setPasswordForm({
          current_password: '',
          new_password: '',
          new_password_confirmation: '',
        });
      } else {
        Alert.alert('Error', response.message || 'Failed to change password');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to change password');
    }
  };

  const handleSetPassword = async () => {
    try {
      console.log('=== SET PASSWORD ATTEMPT ===');
      console.log('User has password:', hasPassword);
      
      if (newPasswordForm.password !== newPasswordForm.password_confirmation) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }

      if (newPasswordForm.password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters long');
        return;
      }

      console.log('Calling setPassword API...');
      const response = await apiService.setPassword({
        password: newPasswordForm.password,
        password_confirmation: newPasswordForm.password_confirmation,
      });

      if (response.success) {
        Alert.alert('Success', 'Password set successfully! You can now use email/password login.');
        setPasswordModalVisible(false);
        setNewPasswordForm({
          password: '',
          password_confirmation: '',
        });
        setHasPassword(true);
      } else {
        Alert.alert('Error', response.message || 'Failed to set password');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to set password');
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
          {user?.picture ? (
            <Image 
              source={{ uri: user.picture }} 
              style={styles.profileImage}
              onError={() => console.log('Failed to load profile image')}
            />
          ) : (
            <Ionicons name="person" size={50} color="#FFFFFF" />
          )}
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
        
        {/* <TouchableOpacity style={styles.actionItem}>
          <Ionicons name="notifications-outline" size={20} color="#4A90E2" />
          <Text style={styles.actionText}>Notification Settings</Text>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity> */}

        {/* <TouchableOpacity style={styles.actionItem}>
          <Ionicons name="shield-outline" size={20} color="#4A90E2" />
          <Text style={styles.actionText}>Privacy Settings</Text>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity> */}

        <TouchableOpacity 
          style={styles.actionItem}
          onPress={() => setPasswordModalVisible(true)}
        >
          <Ionicons name="key-outline" size={20} color="#4A90E2" />
          <Text style={styles.actionText}>
            {hasPassword ? 'Change Password' : 'Set Password'}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>

        {/* <TouchableOpacity style={styles.actionItem}>
          <Ionicons name="help-circle-outline" size={20} color="#4A90E2" />
          <Text style={styles.actionText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity> */}

        <TouchableOpacity 
          style={styles.actionItem}
          onPress={() => router.push('/(patient)/about')}
        >
          <Ionicons name="information-circle-outline" size={20} color="#4A90E2" />
          <Text style={styles.actionText}>About HealthReach</Text>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>

        {/* <TouchableOpacity 
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
        </TouchableOpacity> */}
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

      {/* Edit Profile Modal with Keyboard Handling */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity 
            style={styles.modalOverlayTouch}
            activeOpacity={1}
            onPress={() => setEditModalVisible(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalBody}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.formInputContainer}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={editForm.name}
                    onChangeText={(text) => {
                      console.log('Name field changed:', text);
                      setEditForm(prev => ({ ...prev, name: text }));
                    }}
                    placeholder="Enter your full name"
                    placeholderTextColor={colors.textTertiary}
                    editable={true}
                    selectTextOnFocus={true}
                  />
                </View>
              </View>

              <View style={styles.formInputContainer}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={editForm.email}
                    onChangeText={(text) => {
                      console.log('Email field changed:', text);
                      setEditForm(prev => ({ ...prev, email: text }));
                    }}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={true}
                    selectTextOnFocus={true}
                  />
                </View>
              </View>

              <View style={styles.formInputContainer}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="call-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={editForm.phone}
                    onChangeText={(text) => {
                      console.log('Phone field changed:', text);
                      setEditForm(prev => ({ ...prev, phone: text }));
                    }}
                    placeholder="Enter your phone number"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="phone-pad"
                    editable={true}
                    selectTextOnFocus={true}
                  />
                </View>
              </View>

              <View style={styles.formInputContainer}>
                <Text style={styles.inputLabel}>Address</Text>
                <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                  <Ionicons name="location-outline" size={20} color={colors.textSecondary} style={styles.inputIconTop} />
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={editForm.address}
                    onChangeText={(text) => {
                      console.log('Address field changed:', text);
                      setEditForm(prev => ({ ...prev, address: text }));
                    }}
                    placeholder="Enter your address"
                    placeholderTextColor={colors.textTertiary}
                    multiline={true}
                    numberOfLines={3}
                    editable={true}
                    selectTextOnFocus={true}
                  />
                </View>
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
        </KeyboardAvoidingView>
      </Modal>

      {/* Password Management Modal */}
      <Modal
        visible={passwordModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {hasPassword ? 'Change Password' : 'Set Password'}
              </Text>
              <TouchableOpacity onPress={() => setPasswordModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {hasPassword ? (
                // Change Password Form
                <>
                  <View style={styles.formInputContainer}>
                    <Text style={styles.inputLabel}>Current Password</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        value={passwordForm.current_password}
                        onChangeText={(text) => 
                          setPasswordForm(prev => ({ ...prev, current_password: text }))
                        }
                        placeholder="Enter your current password"
                        placeholderTextColor={colors.textTertiary}
                        secureTextEntry
                      />
                    </View>
                  </View>

                  <View style={styles.formInputContainer}>
                    <Text style={styles.inputLabel}>New Password</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="key-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        value={passwordForm.new_password}
                        onChangeText={(text) => 
                          setPasswordForm(prev => ({ ...prev, new_password: text }))
                        }
                        placeholder="Enter new password (min 6 characters)"
                        placeholderTextColor={colors.textTertiary}
                        secureTextEntry
                      />
                    </View>
                  </View>

                  <View style={styles.formInputContainer}>
                    <Text style={styles.inputLabel}>Confirm New Password</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="checkmark-circle-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        value={passwordForm.new_password_confirmation}
                        onChangeText={(text) => 
                          setPasswordForm(prev => ({ ...prev, new_password_confirmation: text }))
                        }
                        placeholder="Confirm new password"
                        placeholderTextColor={colors.textTertiary}
                        secureTextEntry
                      />
                    </View>
                  </View>
                </>
              ) : (
                // Set Password Form (for Google users)
                <>
                  <View style={styles.passwordInfo}>
                    <Ionicons name="information-circle" size={24} color={colors.info} />
                    <Text style={styles.passwordInfoText}>
                      You signed in with Google. Set a password to enable email/password login.
                    </Text>
                  </View>

                  <View style={styles.formInputContainer}>
                    <Text style={styles.inputLabel}>New Password</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="key-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        value={newPasswordForm.password}
                        onChangeText={(text) => 
                          setNewPasswordForm(prev => ({ ...prev, password: text }))
                        }
                        placeholder="Enter password (min 6 characters)"
                        placeholderTextColor={colors.textTertiary}
                        secureTextEntry
                      />
                    </View>
                  </View>

                  <View style={styles.formInputContainer}>
                    <Text style={styles.inputLabel}>Confirm Password</Text>
                    <View style={styles.inputWrapper}>
                      <Ionicons name="checkmark-circle-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        value={newPasswordForm.password_confirmation}
                        onChangeText={(text) => 
                          setNewPasswordForm(prev => ({ ...prev, password_confirmation: text }))
                        }
                        placeholder="Confirm password"
                        placeholderTextColor={colors.textTertiary}
                        secureTextEntry
                      />
                    </View>
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setPasswordModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={hasPassword ? handleChangePassword : handleSetPassword}
              >
                <Text style={styles.saveButtonText}>
                  {hasPassword ? 'Change Password' : 'Set Password'}
                </Text>
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
    ...neumorphism.container,
  },
  loadingContainer: {
    ...neumorphism.loadingContainer,
  },
  loadingText: {
    ...neumorphism.loadingText,
  },
  profileHeader: {
    ...neumorphism.header,
    alignItems: 'center',
  },
  avatarContainer: {
    ...neumorphism.avatarLarge,
    marginBottom: spacing.md,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  userName: {
    ...typography.h2,
    color: colors.surface,
    marginBottom: spacing.xs,
  },
  userEmail: {
    ...typography.body1,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: spacing.sm,
  },
  userRole: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    fontWeight: '600',
  },
  section: {
    ...neumorphism.card,
    margin: spacing.md,
  },
  sectionHeader: {
    ...neumorphism.sectionHeader,
  },
  sectionTitle: {
    ...neumorphism.sectionTitle,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primarySoft,
    ...shadows.subtle,
  },
  editButtonText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  infoContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  infoValue: {
    ...typography.body1,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  actionItem: {
    ...neumorphism.listItem,
    marginBottom: spacing.sm,
  },
  actionText: {
    flex: 1,
    ...typography.body1,
    marginLeft: spacing.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.errorSoft,
    borderRadius: borderRadius.md,
    ...shadows.elevated,
  },
  logoutText: {
    ...typography.body1,
    color: colors.error,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  modalOverlay: {
    ...neumorphism.modalOverlay,
  },
  modalOverlayTouch: {
    flex: 1,
  },
  modalContent: {
    ...neumorphism.modalContent,
  },
  modalHeader: {
    ...neumorphism.modalHeader,
  },
  modalTitle: {
    ...neumorphism.modalTitle,
  },
  modalBody: {
    ...neumorphism.modalBody,
  },
  formInputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    ...typography.body2,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    ...neumorphism.inputContainer,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
  inputIcon: {
    marginRight: spacing.md,
  },
  inputIconTop: {
    marginRight: spacing.md,
    alignSelf: 'flex-start',
    marginTop: spacing.md,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: colors.textPrimary,
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  modalFooter: {
    ...neumorphism.modalFooter,
  },
  cancelButton: {
    ...neumorphism.buttonSecondary,
    flex: 1,
    marginRight: spacing.sm,
  },
  cancelButtonText: {
    ...neumorphism.buttonSecondaryText,
  },
  saveButton: {
    ...neumorphism.button,
    flex: 1,
    marginLeft: spacing.sm,
  },
  saveButtonText: {
    ...neumorphism.buttonText,
  },
  passwordInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.infoSoft,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    ...shadows.subtle,
  },
  passwordInfoText: {
    flex: 1,
    ...typography.body2,
    color: colors.info,
    marginLeft: spacing.md,
    lineHeight: 20,
  },
});
