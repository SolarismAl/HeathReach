import { User, Appointment, HealthCenter, Service, Notification, RegisterData, LoginData } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance } from 'axios';


export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

    console.log('=== API SERVICE INITIALIZATION ===');
    console.log('API Base URL:', API_BASE_URL);
    console.log('Environment variables loaded:', {
      EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
    });
    this.baseURL = API_BASE_URL;
    console.log('Final API Base URL:', this.baseURL);
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000, // Reduced timeout to 10 seconds for faster feedback
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        console.log('=== API REQUEST INTERCEPTOR DEBUG ===');
        console.log('Request URL:', config.url);
        console.log('Request method:', config.method);
        
        const token = await this.getToken();
        console.log('Token from getToken():', token ? `Present (length: ${token.length})` : 'NULL');
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('Authorization header set with token');
        } else {
          console.log('NO TOKEN - Authorization header NOT set');
        }
        
        console.log('Final request headers:', config.headers);
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling with circuit breaker
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // Prevent infinite retry loops with circuit breaker
        if (error.response?.status === 401 && !originalRequest._retryCount) {
          console.log('Received 401 error, attempting token refresh...');
          originalRequest._retryCount = 1; // Mark as retried to prevent infinite loops
          
          // Try to refresh the Firebase ID token
          try {
            const { default: CustomAuthService } = await import('./auth-service');
            const currentUser = await CustomAuthService.getCurrentUser();
            
            if (currentUser) {
              console.log('Refreshing Firebase ID token and retrying request...');
              const freshIdToken = await currentUser.getIdToken(true);
              console.log('Fresh Firebase ID token obtained (first 50 chars):', freshIdToken.substring(0, 50) + '...');
              await this.setFirebaseIdToken(freshIdToken);
              
              // Retry the original request with fresh token
              originalRequest.headers.Authorization = `Bearer ${freshIdToken}`;
              console.log('Retrying request to:', originalRequest.url);
              
              return this.api.request(originalRequest);
            } else {
              console.log('No current Firebase user, clearing tokens and redirecting to login');
              await this.clearToken();
              // Could trigger logout/redirect here if needed
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            await this.clearToken();
            // Could trigger logout/redirect here if needed
          }
        } else if (error.response?.status === 401 && originalRequest._retryCount) {
          console.error('Token refresh failed - still getting 401 after retry. Clearing tokens.');
          await this.clearToken();
          // Could trigger logout/redirect here if needed
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Helper methods
  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  private async handleResponse<T = any>(response: Response): Promise<ApiResponse<T>> {
    try {
      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          message: data.message || `HTTP ${response.status}: ${response.statusText}`,
          data: undefined as T
        };
      }

      return {
        success: true,
        message: data.message || 'Success',
        data: (data.data || data) as T
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to parse response',
        data: undefined as T
      };
    }
  }

  // Token management
  private async getToken(): Promise<string | null> {
    try {
      console.log('=== GET TOKEN DEBUG ===');
      
      // Try to get fresh Firebase ID token from Custom Auth
      const { default: CustomAuthService } = await import('./auth-service');
      
      const currentUser = await CustomAuthService.getCurrentUser();
      
      console.log('Custom Auth current user:', currentUser ? 'Present' : 'NULL');
      
      if (currentUser) {
        console.log('Current user UID:', currentUser.uid);
        console.log('Current user email:', currentUser.email);
        console.log('Getting fresh Firebase ID token from current user');
        try {
          // Get token from custom auth service
          const freshIdToken = await currentUser.getIdToken();
          console.log('Got fresh Firebase ID token (length):', freshIdToken?.length || 0);
          
          if (freshIdToken) {
            // Store the fresh token
            await this.setFirebaseIdToken(freshIdToken);
            return freshIdToken;
          }
        } catch (tokenError) {
          console.error('Error getting fresh Firebase ID token:', tokenError);
        }
      } else {
        console.log('No current user - checking stored tokens');
      }
      
      // Fallback to stored Firebase ID token (prioritize this for API calls)
      const firebaseToken = await AsyncStorage.getItem('firebase_id_token');
      console.log('Stored Firebase ID token:', firebaseToken ? `Present (length: ${firebaseToken.length})` : 'NULL');
      if (firebaseToken) {
        console.log('Using stored Firebase ID token for API call');
        return firebaseToken;
      }
      
      // Last fallback to custom JWT token - but try to exchange it first
      const customToken = await AsyncStorage.getItem('auth_token');
      console.log('Stored custom token:', customToken ? `Present (length: ${customToken.length})` : 'NULL');
      if (customToken) {
        console.log('Found custom token, attempting to exchange for ID token...');
        try {
          const { signInWithCustomToken } = await import('firebase/auth');
          const { getFirebaseAuth } = await import('./firebase');
          
          const auth = await getFirebaseAuth();
          const userCredential = await signInWithCustomToken(auth, customToken);
          const idToken = await userCredential.user.getIdToken();
          
          console.log('Successfully exchanged custom token for fresh ID token');
          await this.setFirebaseIdToken(idToken);
          return idToken;
        } catch (exchangeError) {
          console.error('Failed to exchange custom token:', exchangeError);
          console.log('Using custom JWT token for API call as fallback');
          return customToken;
        }
      }
      
      console.log('No valid token found - returning NULL');
      return null;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  async getStoredToken(): Promise<string | null> {
    return this.getToken();
  }

  private async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  }

  async setFirebaseIdToken(idToken: string): Promise<void> {
    try {
      await AsyncStorage.setItem('firebase_id_token', idToken);
      console.log('Firebase ID token stored for API calls');
    } catch (error) {
      console.error('Error storing Firebase ID token:', error);
    }
  }

  private async clearToken(): Promise<void> {
    try {
      console.log('ApiService: Clearing all stored authentication data...');
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('firebase_id_token');
      await AsyncStorage.removeItem('user_data');
      await AsyncStorage.removeItem('userToken'); // Also clear this key used in AuthContext
      await AsyncStorage.removeItem('userData'); // Also clear this key used in AuthContext
      console.log('ApiService: All authentication data cleared');
    } catch (error) {
      console.error('Error clearing token:', error);
    }
  }

  // User data management
  private async setUserData(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
    } catch (error) {
      console.error('Error setting user data:', error);
    }
  }

  async getStoredUserData(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  // Authentication methods
  async login(idToken: string): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      console.log('=== API SERVICE LOGIN ===');
      console.log('API Base URL:', this.baseURL);
      console.log('Firebase ID Token (first 50 chars):', idToken.substring(0, 50) + '...');
      
      console.log('Making POST request to:', `${this.baseURL}/auth/login`);
      const response = await this.api.post('/auth/login', { idToken });
      
      console.log('Login response status:', response.status);
      console.log('Login response data:', response.data);
      
      if (response.data.success && response.data.data?.token) {
        console.log('Login successful, storing token and user data');
        await this.setToken(response.data.data.token);
        // Store the Firebase ID token for API calls
        await this.setFirebaseIdToken(idToken);
        // Store user data as well
        await this.setUserData(response.data.data.user);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('=== LOGIN ERROR ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      } else if (error.request) {
        console.error('Request made but no response:', error.request);
      }
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Login failed',
        data: { user: {} as User, token: '' }
      };
    }
  }

  async loginWithGoogle(idToken: string): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await this.api.post('/auth/google', { idToken });
      
      if (response.data.success && response.data.data?.token) {
        await this.setToken(response.data.data.token);
        // Store the Firebase ID token for API calls
        await this.setFirebaseIdToken(idToken);
        await this.setUserData(response.data.data.user);
        return response.data;
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Google login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Google login failed',
        data: null as any
      };
    }
  }

  async register(data: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      console.log('=== API SERVICE REGISTRATION ===');
      console.log('API Base URL:', this.baseURL);
      console.log('Registration data:', {
        ...data,
        password: 'Hidden',
        password_confirmation: 'Hidden'
      });
      
      // Create a new axios instance with longer timeout for registration
      const registrationApi = axios.create({
        baseURL: this.baseURL,
        timeout: 60000, // 60 seconds for registration
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      console.log('Making POST request to:', `${this.baseURL}/auth/register`);
      
      const response = await registrationApi.post('/auth/register', data);
      console.log('Registration response status:', response.status);
      console.log('Registration response data:', response.data);
      
      if (response.data.success && response.data.data?.token && response.data.data?.user) {
        console.log('Registration successful, storing token and user data');
        
        // The token from backend is a Firebase custom token, we need to exchange it for an ID token
        try {
          console.log('Exchanging custom token for ID token after registration...');
          const { signInWithCustomToken } = await import('firebase/auth');
          const { getFirebaseAuth } = await import('./firebase');
          
          // Sign in with the custom token to get an ID token
          const auth = await getFirebaseAuth();
          const userCredential = await signInWithCustomToken(auth, response.data.data.token);
          const idToken = await userCredential.user.getIdToken();
          
          console.log('Successfully exchanged custom token for ID token after registration');
          
          // Store both tokens
          await AsyncStorage.setItem('auth_token', response.data.data.token); // Custom token
          await AsyncStorage.setItem('firebase_id_token', idToken); // ID token for API calls
          await AsyncStorage.setItem('user_data', JSON.stringify(response.data.data.user));
          
        } catch (tokenError) {
          console.error('Failed to exchange custom token after registration:', tokenError);
          // Fallback: store the custom token as both
          await AsyncStorage.setItem('auth_token', response.data.data.token);
          await AsyncStorage.setItem('firebase_id_token', response.data.data.token);
          await AsyncStorage.setItem('user_data', JSON.stringify(response.data.data.user));
        }
        
        return {
          success: true,
          message: response.data.message,
          data: response.data.data
        };
      }
      console.log('Registration response without token:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('=== REGISTRATION ERROR ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Full error:', error);
      
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        console.error('Response data:', error.response.data);
      } else if (error.request) {
        console.error('Request made but no response:', error.request);
      }
      
      // Handle specific timeout errors
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        return {
          success: false,
          message: 'Registration is taking longer than expected. Please check your connection and try again.',
          data: null as any
        };
      }
      
      // Handle network errors
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        return {
          success: false,
          message: 'Network error. Please check if the backend server is running on http://127.0.0.1:8000',
          data: null as any
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Registration failed',
        data: null as any
      };
    }
  }

  async logout(): Promise<ApiResponse<null>> {
    try {
      console.log('ApiService: Calling backend logout endpoint...');
      const response = await this.api.post('/auth/logout');
      console.log('ApiService: Backend logout response:', response.data);
      
      console.log('ApiService: Clearing stored token and user data...');
      await this.clearToken();
      
      return {
        success: true,
        message: 'Logged out successfully',
        data: null
      };
    } catch (error: any) {
      console.error('ApiService: Logout error:', error);
      console.error('ApiService: Error response:', error.response?.data);
      
      // Clear token even if API call fails
      console.log('ApiService: Clearing stored data despite API error...');
      await this.clearToken();
      
      return {
        success: true, // Still return success since we cleared local data
        message: 'Logged out successfully',
        data: null
      };
    }
  }

  // Forgot password with retry logic
  async forgotPassword(email: string): Promise<ApiResponse<null>> {
    const maxRetries = 2;
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`=== FORGOT PASSWORD ATTEMPT ${attempt}/${maxRetries} ===`);
        
        // Create a custom axios instance with longer timeout for forgot password
        const forgotPasswordApi = axios.create({
          baseURL: this.baseURL,
          timeout: 60000, // 60 seconds for forgot password (Render can be very slow)
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        // Add the same request interceptor for authentication
        forgotPasswordApi.interceptors.request.use(
          async (config) => {
            console.log('=== FORGOT PASSWORD REQUEST INTERCEPTOR ===');
            const token = await this.getToken();
            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
              console.log('Authorization header set for forgot password request');
            }
            return config;
          },
          (error) => Promise.reject(error)
        );

        console.log(`Making forgot password request (attempt ${attempt}) with 60s timeout...`);
        // Temporarily use debug endpoint to bypass email sending issues
        const response = await forgotPasswordApi.post('/test/forgot-password', { email });
        console.log('Forgot password response received:', response.status);
        return response.data;
        
      } catch (error: any) {
        console.error(`Forgot password attempt ${attempt} failed:`, error);
        lastError = error;
        
        // If it's not a timeout and not the last attempt, don't retry
        if (error.code !== 'ECONNABORTED' && attempt < maxRetries) {
          break;
        }
        
        // If it's the last attempt, handle the error
        if (attempt === maxRetries) {
          if (error.code === 'ECONNABORTED') {
            return {
              success: false,
              message: 'The server is taking too long to respond. This might be due to a cold start. Please try again in a few moments.',
              data: null
            };
          }
          
          return {
            success: false,
            message: error.response?.data?.message || 'Failed to send reset email. Please try again.',
            data: null
          };
        }
        
        // Wait before retry (only for timeout errors)
        if (error.code === 'ECONNABORTED' && attempt < maxRetries) {
          console.log(`Waiting 3 seconds before retry...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
    }

    // This shouldn't be reached, but just in case
    return {
      success: false,
      message: 'Failed to send reset email after multiple attempts.',
      data: null
    };
  }

  async getProfile(): Promise<ApiResponse<User>> {
    try {
      const response = await this.api.get('/auth/profile');
      return response.data;
    } catch (error: any) {
      console.error('Get profile error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get profile'
      };
    }
  }

  // User management methods
  async getAllUsers(): Promise<ApiResponse<User[]>> {
    try {
      const response = await this.api.get('/users');
      return response.data;
    } catch (error: any) {
      console.error('Get all users error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch users',
        data: []
      };
    }
  }

  async updateUserRole(userId: string, role: string): Promise<ApiResponse<User>> {
    try {
      const response = await this.api.put(`/users/${userId}/role`, { role });
      return response.data;
    } catch (error: any) {
      console.error('Update user role error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update user role',
        data: null as any
      };
    }
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await this.api.put('/users/profile', data);
      return response.data;
    } catch (error: any) {
      console.error('Update profile error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile',
        data: null as any
      };
    }
  }

  // Additional user management methods
  async getUsers(params?: any): Promise<ApiResponse<User[]>> {
    try {
      console.log('=== GET USERS API CALL ===');
      const token = await this.getToken();
      console.log('Token being used:', token ? token.substring(0, 50) + '...' : 'NO TOKEN');
      console.log('Request params:', params);
      
      const response = await this.api.get('/users', { params });
      console.log('Get users response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get users error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch users',
        data: []
      };
    }
  }

  async updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await this.api.put(`/users/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Update user error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update user',
        data: null as any
      };
    }
  }

  async deleteUser(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.delete(`/users/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Delete user error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete user',
        data: null
      };
    }
  }

  // Health Centers
  async getHealthCenters(): Promise<ApiResponse<any[]>> {
    try {
      const response = await this.api.get('/health-centers');
      return response.data;
    } catch (error: any) {
      console.error('Get health centers error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch health centers',
        data: []
      };
    }
  }

  async createHealthCenter(data: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.post('/health-centers', data);
      return response.data;
    } catch (error: any) {
      console.error('Create health center error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create health center',
        data: null
      };
    }
  }

  async updateHealthCenter(id: string, data: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.put(`/health-centers/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Update health center error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update health center',
        data: null
      };
    }
  }

  async deleteHealthCenter(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.delete(`/health-centers/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Delete health center error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete health center',
        data: null
      };
    }
  }

  // Services
  async getServices(params?: any): Promise<ApiResponse<any[]>> {
    try {
      const response = await this.api.get('/services', { params });
      return response.data;
    } catch (error: any) {
      console.error('Get services error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch services',
      };
    }
  }

  async updateService(id: string, data: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.put(`/services/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Update service error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update service',
        data: null
      };
    }
  }

  async createService(data: any): Promise<ApiResponse<Service>> {
    try {
      const response = await this.api.post('/services', data);
      return response.data;
    } catch (error: any) {
      console.error('Create service error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create service',
        data: undefined
      };
    }
  }

  async deleteService(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.delete(`/services/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Delete service error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete service',
        data: null
      };
    }
  }

  async getAppointments(params?: any): Promise<ApiResponse<Appointment[]>> {
    try {
      // Use real Firestore endpoint - data structure is now fixed
      const response = await this.api.get('/appointments', { params });
      return response.data;
    } catch (error) {
      console.error('Get appointments error:', error);
      return {
        success: false,
        message: 'Failed to fetch appointments'
      };
    }
  }
  async createAppointment(data: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.post('/appointments', data);
      return response.data;
    } catch (error: any) {
      console.error('Create appointment error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create appointment',
        data: null
      };
    }
  }

  async updateAppointment(id: string, data: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.put(`/appointments/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Update appointment error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update appointment',
        data: null
      };
    }
  }

  async updateAppointmentStatus(id: string, status: string): Promise<ApiResponse<Appointment>> {
    const response = await fetch(`${this.baseURL}/appointments/${id}/status`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ status })
    });
    return this.handleResponse<Appointment>(response);
  }

  async deleteAppointment(id: number): Promise<ApiResponse<any>> {
    const response = await fetch(`${this.baseURL}/appointments/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  async getHealthWorkerAppointments(params?: any): Promise<ApiResponse<Appointment[]>> {
    try {
      const response = await this.api.get('/health-worker/appointments', { params });
      return response.data;
    } catch (error: any) {
      console.error('Get health worker appointments error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get health worker appointments',
        data: []
      };
    }
  }

  async approveAppointment(id: string): Promise<ApiResponse<Appointment>> {
    try {
      const response = await this.api.put(`/appointments/${id}/approve`);
      return response.data;
    } catch (error: any) {
      console.error('Approve appointment error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to approve appointment',
        data: undefined
      };
    }
  }

  async rejectAppointment(id: string, reason?: string): Promise<ApiResponse<Appointment>> {
    try {
      const response = await this.api.put(`/appointments/${id}/reject`, { reason });
      return response.data;
    } catch (error: any) {
      console.error('Reject appointment error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to reject appointment',
        data: undefined
      };
    }
  }

  async completeAppointment(id: string, notes?: string): Promise<ApiResponse<Appointment>> {
    try {
      const response = await this.api.put(`/appointments/${id}/complete`, { notes });
      return response.data;
    } catch (error: any) {
      console.error('Complete appointment error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to complete appointment',
        data: undefined
      };
    }
  }

  // Notifications
  async getNotifications(params?: any): Promise<ApiResponse<any[]>> {
    try {
      // Use real Firestore endpoint - data structure should work now
      const response = await this.api.get('/notifications', { params });
      return response.data;
    } catch (error: any) {
      console.error('Get notifications error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch notifications',
        data: []
      };
    }
  }

  async sendNotification(data: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.post('/notifications', data);
      return response.data;
    } catch (error: any) {
      console.error('Send notification error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send notification',
        data: null
      };
    }
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.put(`/notifications/${id}/read`);
      return response.data;
    } catch (error: any) {
      console.error('Mark notification as read error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to mark notification as read',
        data: null
      };
    }
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.put('/notifications/mark-all-read');
      return response.data;
    } catch (error: any) {
      console.error('Mark all notifications as read error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to mark all notifications as read',
        data: null
      };
    }
  }

  // Device Tokens
  async saveDeviceToken(data: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.api.post('/device-tokens', data);
      return response.data;
    } catch (error: any) {
      console.error('Save device token error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to save device token',
        data: null
      };
    }
  }

  // Admin Statistics
  async getAdminStats(): Promise<ApiResponse<any>> {
    try {
      console.log('=== ADMIN STATS API CALL ===');
      const token = await this.getToken();
      console.log('Token being used:', token ? token.substring(0, 50) + '...' : 'NO TOKEN');
      
      const response = await this.api.get('/admin/stats');
      console.log('Admin stats response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get admin stats error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch admin statistics',
        data: null
      };
    }
  }

  // Activity Logs
  async getActivityLogs(params?: any): Promise<ApiResponse<any[]>> {
    try {
      const response = await this.api.get('/admin/logs', { params });
      return response.data;
    } catch (error: any) {
      console.error('Get activity logs error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch activity logs',
        data: []
      };
    }
  }

  // Password management methods
  async changePassword(data: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }): Promise<ApiResponse<null>> {
    try {
      const response = await this.api.post('/auth/change-password', data);
      return response.data;
    } catch (error: any) {
      console.error('Change password error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to change password',
        data: null
      };
    }
  }

  async setPassword(data: {
    password: string;
    password_confirmation: string;
  }): Promise<ApiResponse<null>> {
    try {
      const response = await this.api.post('/auth/set-password', data);
      return response.data;
    } catch (error: any) {
      console.error('Set password error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to set password',
        data: null
      };
    }
  }

  async hasPassword(): Promise<ApiResponse<{ has_password: boolean }>> {
    try {
      const response = await this.api.get('/auth/has-password');
      return response.data;
    } catch (error: any) {
      console.error('Check password status error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to check password status',
        data: { has_password: false }
      };
    }
  }

  // Debug method to check current authentication state
  async debugAuthState(): Promise<void> {
    try {
      console.log('=== AUTHENTICATION DEBUG INFO ===');
      
      // Check Firebase Auth state
      const { getFirebaseAuth } = await import('./firebase');
      const firebaseAuth = await getFirebaseAuth();
      const currentUser = firebaseAuth.currentUser;
      
      console.log('Firebase Auth State:');
      console.log('- Current User:', currentUser ? 'Logged in' : 'Not logged in');
      if (currentUser) {
        console.log('- User ID:', currentUser.uid);
        console.log('- Email:', currentUser.email);
        console.log('- Email Verified:', currentUser.emailVerified);
      }
      
      // Check stored tokens
      const firebaseToken = await AsyncStorage.getItem('firebase_id_token');
      const customToken = await AsyncStorage.getItem('auth_token');
      const userData = await AsyncStorage.getItem('user_data');
      
      console.log('Stored Tokens:');
      console.log('- Firebase ID Token:', firebaseToken ? 'Present (length: ' + firebaseToken.length + ')' : 'Missing');
      console.log('- Custom Token:', customToken ? 'Present (length: ' + customToken.length + ')' : 'Missing');
      console.log('- User Data:', userData ? 'Present' : 'Missing');
      
      // Test current token
      const currentToken = await this.getToken();
      console.log('Current Token from getToken():', currentToken ? 'Present (length: ' + currentToken.length + ')' : 'Missing');
      
    } catch (error) {
      console.error('Error debugging auth state:', error);
    }
  }

  // Test authentication endpoints
  async testAuth(): Promise<ApiResponse<any>> {
    try {
      console.log('=== TESTING AUTHENTICATION ===');
      await this.debugAuthState();
      
      const token = await this.getToken();
      console.log('Token being used:', token ? token.substring(0, 50) + '...' : 'NO TOKEN');
      
      const response = await this.api.get('/test/auth');
      console.log('Auth test response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Auth test error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      return {
        success: false,
        message: error.response?.data?.message || 'Authentication test failed',
        data: null
      };
    }
  }

  async testAdminAuth(): Promise<ApiResponse<any>> {
    try {
      console.log('=== TESTING ADMIN AUTHENTICATION ===');
      const token = await this.getToken();
      console.log('Token being used:', token ? token.substring(0, 50) + '...' : 'NO TOKEN');
      
      const response = await this.api.get('/test/admin');
      console.log('Admin auth test response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Admin auth test error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      return {
        success: false,
        message: error.response?.data?.message || 'Admin authentication test failed',
        data: null
      };
    }
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export { apiService };
export default apiService;
