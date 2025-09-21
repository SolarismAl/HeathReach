// User Types
export interface User {
  user_id: string;
  name: string;
  email: string;
  role: "patient" | "health_worker" | "admin";
  contact_number?: string;
  address?: string;
  fcm_token?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  contact_number: string;
  address: string;
  password: string;
  password_confirmation: string;
  role: 'patient' | 'health_worker' | 'admin';
}

// Health Center Types
export interface HealthCenter {
  health_center_id: string;
  name: string;
  address: string;
  location?: string; // For backward compatibility
  contact_number?: string;
  email?: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Service Types
export interface Service {
  id: string;
  service_id: string;
  health_center_id: string;
  name: string;
  service_name: string;
  description: string;
  duration_minutes: number;
  price?: number;
  is_active: boolean;
  schedule: any[];
  health_center?: HealthCenter;
  created_at?: string;
  updated_at?: string;
}

export interface CreateServiceData {
  health_center_id: string;
  service_name: string;
  description: string;
  schedule?: any[];
}

// Appointment Types
export interface Appointment {
  appointment_id: string;
  user_id: string;
  health_center_id: string;
  date: string;   // ISO format e.g. "2025-09-14"
  time: string;   // "HH:mm"
  appointment_date: string;   // API field
  appointment_time: string;   // API field
  status: "pending" | "confirmed" | "cancelled" | "completed";
  remarks?: string;
  // Optional populated fields
  user?: User;
  health_center?: HealthCenter;
  service?: Service;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAppointmentData {
  user_id: string;
  health_center_id: string;
  service_id: string;
  appointment_date: string;
  appointment_time: string;
  notes?: string;
}

// Notification Types
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  type: 'appointment' | 'service' | 'admin' | 'general';
  data?: any;
  updated_at?: string;
}

export interface CreateNotificationData {
  user_id?: string; // Optional for role-based notifications
  role?: 'patient' | 'health_worker'; // For targeting specific roles
  title: string;
  message: string;
  type: 'appointment' | 'service' | 'admin' | 'general';
  data?: any;
}

// Device Token Types
export interface DeviceToken {
  id: string;
  user_id: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  device_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateDeviceTokenData {
  user_id: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  device_name?: string;
}

// Admin Types
export interface AdminStats {
  total_users: number;
  total_patients: number;
  total_health_workers: number;
  total_appointments: number;
  pending_appointments: number;
  completed_appointments: number;
  total_health_centers: number;
  total_services: number;
  recent_activities: ActivityLog[];
}


// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// Navigation Types
export type RootStackParamList = {
  index: undefined;
  auth: undefined;
  '(patient)': undefined;
  '(health-worker)': undefined;
  '(admin)': undefined;
};

export type AuthStackParamList = {
  index: undefined;
  register: undefined;
};

export type PatientStackParamList = {
  index: undefined;
  'book-appointment': undefined;
  appointments: undefined;
  notifications: undefined;
  profile: undefined;
};

export type HealthWorkerStackParamList = {
  index: undefined;
  services: undefined;
  notifications: undefined;
  profile: undefined;
};

export type AdminStackParamList = {
  index: undefined;
  users: undefined;
  logs: undefined;
  profile: undefined;
};

// Form Types
export interface AppointmentFormData {
  service_id: number;
  date: Date;
  time: string;
  notes?: string;
}

export interface ServiceFormData {
  name: string;
  description: string;
  duration_minutes: number;
  price?: number;
  health_center_id: number;
  is_active: boolean;
}


// Log Types
export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  description: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  user?: User; // Optional populated user data
}

// Error Types
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}

// Theme Types
export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  info: string;
}

export interface Theme {
  colors: ThemeColors;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
  };
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
}
