import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useCallback } from "react";
import * as SplashScreen from 'expo-splash-screen';
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider } from "../contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import notificationService from "../services/notifications";
import connectivityService from "../services/connectivity";
import { darkColors } from "../styles/darkMode";
import { colors as lightColors } from "../styles/neumorphism";
// Keep the splash screen visible while we fetch resources
console.log('=== APP LAYOUT LOADING ===');
SplashScreen.preventAutoHideAsync().catch((err) => {
  console.warn('SplashScreen.preventAutoHideAsync failed:', err);
});

// ✅ Custom Dark Theme
const HealthReachDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: darkColors.primary,
    background: darkColors.background,
    card: darkColors.surface,
    text: darkColors.textPrimary,
    border: darkColors.border,
    notification: darkColors.primary,
  },
};

// ✅ Custom Light Theme
const HealthReachLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: lightColors.primary,
    background: lightColors.background,
    card: lightColors.surface,
    text: lightColors.textPrimary,
    border: lightColors.border,
    notification: lightColors.primary,
  },
};

export default function RootLayout() {
  console.log('=== RootLayout RENDER ===');
  const colorScheme = useColorScheme();

  const [loaded, error] = useFonts({
  });
  
  // Log font loading errors
  useEffect(() => {
    if (error) {
      console.error('Font loading error:', error);
    }
  }, [error]);
  
  console.log('RootLayout: Fonts loaded:', loaded);

  useEffect(() => {
    notificationService.initialize();

    return () => {
      notificationService.cleanup();
    };
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (loaded) {
      // Hide the splash screen after the fonts have loaded and the layout is ready
      await SplashScreen.hideAsync();
      console.log("RootLayout: Splash screen hidden");
    }
  }, [loaded]);

  useEffect(() => {
    if (loaded) {
      // Also hide splash screen when fonts are loaded
      onLayoutRootView();
    }
  }, [loaded, onLayoutRootView]);

  // Fallback: Force hide splash screen after 3 seconds regardless
  useEffect(() => {
    const timeout = setTimeout(async () => {
      console.log("RootLayout: Force hiding splash screen after timeout");
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn("Failed to hide splash screen:", e);
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  if (!loaded) {
    console.log("Fonts not loaded, keeping splash screen visible...");
    return null; // Return null to keep splash screen visible
  }

  console.log("RootLayout: Rendering complete.");

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider value={colorScheme === 'dark' ? HealthReachDarkTheme : HealthReachLightTheme}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'fade',
              contentStyle: {
                backgroundColor: colorScheme === 'dark' ? darkColors.background : lightColors.background,
              },
            }}
          >
            <Stack.Screen 
              name="index" 
              options={{ 
                headerShown: false,
                animation: 'fade',
              }} 
            />
            <Stack.Screen 
              name="auth" 
              options={{ 
                headerShown: false,
                animation: 'slide_from_right',
              }} 
            />
            <Stack.Screen 
              name="not-available" 
              options={{ 
                headerShown: false,
                animation: 'fade',
              }} 
            />
            <Stack.Screen 
              name="modal" 
              options={{ 
                headerShown: false, 
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }} 
            />
            <Stack.Screen 
              name="(patient)" 
              options={{ 
                headerShown: false,
                animation: 'fade',
              }} 
            />
          </Stack>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
