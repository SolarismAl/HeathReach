import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider } from "../contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import notificationService from "../services/notifications";
import connectivityService from "../services/connectivity";
import { darkColors } from "../styles/darkMode";
import { colors as lightColors } from "../styles/neumorphism";

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
  const colorScheme = useColorScheme();

  const [loaded] = useFonts({
  });

  useEffect(() => {
    notificationService.initialize();

    return () => {
      notificationService.cleanup();
    };
  }, []);

  if (!loaded) {
    console.log("Fonts not loaded, but rendering anyway...");
  }

  console.log("RootLayout: Rendering complete.");

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider value={colorScheme === 'dark' ? HealthReachDarkTheme : HealthReachLightTheme}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: colorScheme === 'dark' ? darkColors.background : lightColors.background,
              },
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen name="not-available" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="(patient)" options={{ headerShown: false }} />
            <Stack.Screen name="(health-worker)" options={{ headerShown: false }} />
            <Stack.Screen name="(admin)" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
