import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { useThemeColors } from '../../styles/darkMode';

export default function AuthLayout() {
  const colors = useThemeColors();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
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
