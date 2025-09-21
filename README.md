# HealthReach - Complete Healthcare Management System

HealthReach is a comprehensive full-stack healthcare management solution consisting of a React Native (Expo) mobile application and Laravel REST API backend. The system connects patients, health workers, and administrators in a unified healthcare ecosystem with Firebase integration.

## 🚀 Features

### 🏥 Multi-Role Support
- **Patients**: Book appointments, view history, receive notifications
- **Health Workers**: Manage appointments, create services, send notifications
- **Administrators**: User management, system analytics, activity logs

### 📱 Core Functionality
- **JWT Authentication**: Secure login/register with role-based navigation
- **Appointment Management**: Full CRUD operations with status tracking
- **Push Notifications**: Firebase Cloud Messaging integration with local notifications
- **Offline Support**: AsyncStorage caching with automatic sync when online
- **Real-time Updates**: Live data synchronization across all user roles

### 🎨 Modern UI/UX
- **Material Design**: Following Android and iOS design guidelines
- **Role-based Theming**: Distinct color schemes for each user type
- **Responsive Design**: Optimized for various screen sizes
- **Accessibility**: WCAG compliant with proper contrast ratios
- **Smooth Animations**: Enhanced user experience with transitions

### 🔧 Technical Stack
- **Framework**: React Native (Expo) with TypeScript
- **Navigation**: React Navigation v6 with typed routes
- **State Management**: React hooks with AsyncStorage persistence
- **API Integration**: Axios with JWT interceptors
- **Notifications**: Expo Notifications with Firebase Cloud Messaging
- **Offline Support**: Custom offline service with sync queue
- **UI Components**: Expo Vector Icons, React Native Calendars

## 🏗️ System Architecture

### Frontend (React Native/Expo)
- **Location**: `./HealthReach/`
- **Framework**: React Native with Expo SDK 54
- **Language**: TypeScript
- **Authentication**: Firebase Auth with JWT tokens
- **State Management**: React hooks with AsyncStorage persistence
- **Navigation**: React Navigation v7 with role-based routing

### Backend (Laravel API)
- **Location**: `../healthreach-api/`
- **Framework**: Laravel 10 with PHP 8.1+
- **Database**: Firebase Firestore (NoSQL)
- **Authentication**: Firebase Admin SDK
- **Notifications**: Firebase Cloud Messaging (FCM)
- **API**: RESTful endpoints with role-based middleware

## 📦 Complete Setup Instructions

### Prerequisites
- Node.js 18+ and npm/yarn
- PHP 8.1+ and Composer
- Firebase project with Authentication, Firestore, and FCM enabled
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### 1. Firebase Project Setup
1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication with Email/Password and Google Sign-In
3. Enable Firestore Database
4. Enable Cloud Messaging
5. Download the service account JSON file for the backend
6. Get the web app configuration for the frontend

### 2. Backend Setup (Laravel API)
```bash
# Navigate to backend directory
cd healthreach-api

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure Firebase credentials in .env
# (See Firebase Configuration section below)

# Start the Laravel server
php artisan serve
```

### 3. Frontend Setup (React Native/Expo)
```bash
# Navigate to frontend directory
cd HealthReach

# Install dependencies
npm install

# Configure environment variables
# Update .env file with your Firebase config

# Start the development server
npx expo start
```

## 🔧 Firebase Configuration

### Frontend (.env file)
```env
# API Configuration
API_URL=http://localhost:8000/api

# Firebase Web App Configuration
FIREBASE_API_KEY=AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
FIREBASE_AUTH_DOMAIN=healthreach-app.firebaseapp.com
FIREBASE_PROJECT_ID=healthreach-app
FIREBASE_STORAGE_BUCKET=healthreach-app.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789012
FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890abcdef
GOOGLE_WEB_CLIENT_ID=123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
```

### Backend (.env file)
```env
# Laravel Configuration
APP_NAME=HealthReach
APP_ENV=local
APP_KEY=base64:generated-key-here
APP_DEBUG=true
APP_URL=http://localhost:8000

# Firebase Service Account Configuration
FIREBASE_PROJECT_ID=healthreach-app
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@healthreach-app.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40healthreach-app.iam.gserviceaccount.com

# FCM Configuration
FCM_SERVER_KEY=your-fcm-server-key
```

### How to Get Firebase Credentials
1. **Web App Config**: Firebase Console → Project Settings → General → Your apps → Web app
2. **Service Account**: Firebase Console → Project Settings → Service Accounts → Generate new private key
3. **FCM Server Key**: Firebase Console → Project Settings → Cloud Messaging → Server key

## 📱 App Structure

```
app/
├── (tabs)/                 # Landing page
├── auth/                   # Authentication screens
├── (patient)/              # Patient role screens
├── (health-worker)/        # Health worker role screens
├── (admin)/                # Admin role screens
└── _layout.tsx             # Root navigation layout

components/
├── ui/                     # Reusable UI components
├── NotificationManager.tsx # Push notification handler
├── NotificationSettings.tsx # Notification preferences
└── OfflineStatusIndicator.tsx # Offline mode indicator

services/
├── api.ts                  # Main API service
├── apiWithOffline.ts       # API with offline support
├── notifications.ts        # Push notification service
├── offline.ts              # Offline data management
└── connectivity.ts         # Network connectivity manager

types/
└── index.ts                # TypeScript type definitions
```

## 👥 User Roles & Features

### 👤 Patient Features
- **Dashboard**: View upcoming appointments and recent notifications
- **Book Appointment**: Select health centers, services, dates, and times
- **Appointment History**: View past appointments with filtering options
- **Notifications**: Receive and manage appointment updates
- **Profile Management**: Update personal information

### 🩺 Health Worker Features
- **Manage Appointments**: Approve, reject, or complete patient appointments
- **Service Management**: Create, update, and delete health services
- **Send Notifications**: Broadcast messages to patients
- **Professional Profile**: Manage professional information

### 🛡️ Admin Features
- **System Dashboard**: Overview of users, appointments, and system health
- **User Management**: Search, filter, edit, and manage all users
- **Activity Logs**: Monitor system activities with filtering and search
- **System Analytics**: View comprehensive statistics and metrics

## 🔔 Notification System

### Push Notifications
- **Appointment Reminders**: 1-hour before scheduled appointments
- **Status Updates**: Real-time appointment status changes
- **Service Announcements**: New health services availability
- **Admin Broadcasts**: Important system announcements

### Notification Channels (Android)
- **Appointments**: High priority with custom sound
- **Services**: Default priority for service updates
- **Admin**: High priority for critical announcements

## 📱 Offline Support

### Cached Data
- User profile and authentication state
- Appointments and appointment history
- Notifications and read status
- Health centers and services list
- Sync queue for offline actions

### Offline Capabilities
- View cached appointments and notifications
- Create appointments (synced when online)
- Mark notifications as read
- Update profile information
- Automatic sync when connection restored

## 🎨 Design System

### Color Schemes
- **Patient**: Blue theme (#2196F3)
- **Health Worker**: Green theme (#4CAF50)
- **Admin**: Red theme (#D32F2F)

### Typography
- **Headers**: Bold, 18-24px
- **Body Text**: Regular, 14-16px
- **Captions**: Light, 12-14px

### Components
- **Cards**: Rounded corners (12px) with subtle shadows
- **Buttons**: Material Design with proper touch targets
- **Forms**: Consistent spacing and validation states
- **Navigation**: Tab-based with role-specific icons

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Secure Storage**: Expo SecureStore for sensitive data
- **API Interceptors**: Automatic token attachment and refresh
- **Role-based Access**: Route protection based on user roles
- **Data Validation**: Input validation on both client and server

## 📊 Performance Optimizations

- **Lazy Loading**: Route-based code splitting
- **Image Optimization**: Compressed assets and lazy loading
- **API Caching**: Intelligent caching with offline support
- **Memory Management**: Proper cleanup of listeners and timers
- **Bundle Size**: Optimized dependencies and tree shaking

## 🚀 Production Deployment

### Backend Deployment
1. **Server Requirements**:
   - PHP 8.1+ with required extensions
   - Composer
   - Web server (Apache/Nginx)
   - SSL certificate for HTTPS

2. **Deployment Steps**:
   ```bash
   # Install dependencies
   composer install --optimize-autoloader --no-dev
   
   # Set production environment
   cp .env.example .env
   # Configure production values in .env
   
   # Generate application key
   php artisan key:generate
   
   # Cache configuration
   php artisan config:cache
   php artisan route:cache
   ```

### Frontend Deployment
1. **Expo Build**:
   ```bash
   # Install EAS CLI
   npm install -g @expo/eas-cli
   
   # Configure EAS
   eas build:configure
   
   # Build for production
   eas build --platform all
   ```

2. **App Store Deployment**:
   - Follow Expo's guide for App Store and Google Play Store submission
   - Update app.json with production configuration
   - Configure app signing and certificates

## 🧪 Testing

### Backend Testing
```bash
# Navigate to backend directory
cd healthreach-api

# Run PHP tests
php artisan test

# Run with coverage
php artisan test --coverage
```

### Frontend Testing
```bash
# Navigate to frontend directory
cd HealthReach

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📊 Project Status

### ✅ Completed Features

#### Frontend (React Native/Expo)
- ✅ Multi-role authentication system (Patient, Health Worker, Admin)
- ✅ Role-based navigation and UI
- ✅ Firebase Authentication integration
- ✅ Complete appointment management system
- ✅ Push notification system with FCM
- ✅ Offline support with AsyncStorage
- ✅ Modern UI/UX with Material Design
- ✅ TypeScript implementation
- ✅ Comprehensive error handling
- ✅ Network connectivity management
- ✅ Real-time data synchronization

#### Backend (Laravel API)
- ✅ Laravel 10 REST API with Firebase integration
- ✅ Firebase Authentication middleware
- ✅ Firestore database operations
- ✅ Role-based access control
- ✅ Complete CRUD operations for all entities
- ✅ Firebase Cloud Messaging integration
- ✅ Activity logging system
- ✅ Admin dashboard endpoints
- ✅ Comprehensive error handling
- ✅ Data Transfer Objects matching frontend interfaces
- ✅ Service layer architecture

### 🔧 Configuration Status
- ✅ Frontend package.json with all required dependencies
- ✅ Backend composer.json with Firebase packages
- ✅ Environment configuration templates
- ✅ Firebase service integration
- ✅ API routing and middleware setup
- ✅ TypeScript type definitions
- ✅ Expo configuration for mobile deployment

### 📱 Ready for Development
Both projects are **100% complete** and ready for:
- ✅ Local development
- ✅ Testing
- ✅ Production deployment
- ✅ App store submission

**Only requirement**: Configure Firebase credentials in environment files

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation for common solutions

## 🔄 Changelog

### v1.0.0 (Current)
- ✅ Multi-role authentication system
- ✅ Complete appointment management
- ✅ Push notification integration
- ✅ Offline support with sync
- ✅ Admin dashboard and user management
- ✅ Modern UI/UX with responsive design
- ✅ TypeScript implementation
- ✅ Comprehensive error handling

---

**Built with ❤️ using React Native, Expo, and TypeScript**
