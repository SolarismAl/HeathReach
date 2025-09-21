# HealthReach Expo App Setup Guide

This guide will help you set up and run the HealthReach mobile application with full Firebase integration and Laravel backend connectivity.

## Prerequisites

- Node.js (v16 or later)
- Expo CLI (`npm install -g @expo/cli`)
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- Laravel backend running (see `../healthreach-api/README.md`)

## Installation

1. **Install dependencies:**
   ```bash
   cd HealthReach
   npm install
   ```

2. **Install Google Sign-In package:**
   ```bash
   npx expo install @react-native-google-signin/google-signin
   ```

3. **Install additional Firebase dependencies:**
   ```bash
   npx expo install firebase
   ```

## Configuration

1. **Environment Variables:**
   - Copy `.env.example` to `.env`
   - Update the Firebase configuration values with your project settings
   - Set the correct API URL for your Laravel backend

2. **Firebase Setup:**
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication with Email/Password and Google providers
   - Enable Firestore Database
   - Enable Cloud Messaging
   - Download the configuration and update your `.env` file

3. **Google Sign-In Setup:**
   - Go to Google Cloud Console
   - Enable Google Sign-In API
   - Create OAuth 2.0 credentials
   - Add the Web Client ID to your `.env` file

## Running the Application

1. **Start the development server:**
   ```bash
   npx expo start
   ```

2. **Run on device/simulator:**
   - Press `a` for Android
   - Press `i` for iOS
   - Scan QR code with Expo Go app

## Features

### Authentication
- Email/Password registration and login
- Google Sign-In integration
- Role-based access (Patient, Health Worker, Admin)
- Automatic navigation based on user role

### User Roles
- **Patient**: Book appointments, view notifications, manage profile
- **Health Worker**: Manage services, handle appointments, send notifications
- **Admin**: User management, system statistics, activity logs

### Core Functionality
- Appointment booking and management
- Real-time notifications
- Health center and service management
- User profile management
- Activity logging

## API Integration

The app communicates with a Laravel backend API. Ensure the backend is running and accessible at the URL specified in your `.env` file.

### Key API Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /users/{id}` - Get user profile
- `GET /appointments` - Get appointments
- `POST /appointments` - Create appointment
- `GET /notifications` - Get notifications
- `POST /device-tokens` - Save FCM token

## Troubleshooting

### Common Issues

1. **Firebase Configuration Error:**
   - Verify all Firebase environment variables are set correctly
   - Ensure Firebase project has the required services enabled

2. **Google Sign-In Not Working:**
   - Install the Google Sign-In package: `@react-native-google-signin/google-signin`
   - Verify Google Web Client ID is correct
   - Ensure Google Sign-In is enabled in Firebase Console

3. **API Connection Issues:**
   - Check if Laravel backend is running
   - Verify API_URL in `.env` file
   - Check network connectivity

4. **Build Errors:**
   - Clear Expo cache: `npx expo start --clear`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

### Development Tips

- Use `npx expo start --tunnel` for testing on physical devices
- Check Expo DevTools for debugging information
- Monitor Laravel backend logs for API issues
- Use Firebase Console to monitor authentication and database operations

## Project Structure

```
HealthReach/
├── app/                    # Expo Router pages
│   ├── (admin)/           # Admin role screens
│   ├── (health-worker)/   # Health worker screens
│   ├── (patient)/         # Patient screens
│   └── auth/              # Authentication screens
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Authentication context
├── services/              # API and service integrations
│   ├── api.ts            # Laravel API service
│   ├── firebase.ts       # Firebase service
│   └── notifications.ts  # FCM service
├── types/                 # TypeScript type definitions
└── components/            # Reusable components
```

## Next Steps

1. Install the Google Sign-In package to enable Google authentication
2. Configure Firebase project with your specific settings
3. Test user registration and login flows
4. Verify appointment booking functionality
5. Test push notifications
6. Deploy to app stores (optional)

For backend setup instructions, see `../healthreach-api/README.md`.
