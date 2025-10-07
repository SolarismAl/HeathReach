// import * as Updates from 'expo-updates';
// import { Platform } from 'react-native';

// let updatesInitialized = false;

// /**
//  * Safely initialize expo-updates to prevent DatabaseLauncher conflicts
//  */
// export const initializeUpdates = async () => {
//   // Only initialize once
//   if (updatesInitialized) {
//     console.log('expo-updates already initialized, skipping...');
//     return;
//   }

//   // Only run in production builds, not in development
//   if (__DEV__) {
//     console.log('Development mode - skipping expo-updates initialization');
//     return;
//   }

//   try {
//     console.log('Initializing expo-updates...');
    
//     // Check if updates are available
//     const update = await Updates.checkForUpdateAsync();
    
//     if (update.isAvailable) {
//       console.log('Update available, fetching...');
//       await Updates.fetchUpdateAsync();
//       console.log('Update fetched, reloading app...');
//       await Updates.reloadAsync();
//     } else {
//       console.log('No updates available');
//     }
    
//     updatesInitialized = true;
//   } catch (error) {
//     console.error('Error checking for updates:', error);
//     // Don't throw - app should continue even if updates fail
//   }
// };

// /**
//  * Get current update information
//  */
// export const getUpdateInfo = () => {
//   try {
//     return {
//       isEmbeddedLaunch: Updates.isEmbeddedLaunch,
//       updateId: Updates.updateId,
//       channel: Updates.channel,
//       runtimeVersion: Updates.runtimeVersion,
//     };
//   } catch (error) {
//     console.error('Error getting update info:', error);
//     return null;
//   }
// };
