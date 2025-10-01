import { Stack } from 'expo-router';
import { Platform, StatusBar, useColorScheme } from 'react-native';
import { useThemeColors } from '../../styles/darkMode';

export default function AuthLayout() {
  const colors = useThemeColors();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
          paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 50,
        },
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Login'
        }} 
      />
      <Stack.Screen 
        name="register" 
        options={{ 
          title: 'Register'
        }} 
      />
      <Stack.Screen 
        name="forgot-password" 
        options={{ 
          title: 'Forgot Password'
        }} 
      />
    </Stack>
  );
}
