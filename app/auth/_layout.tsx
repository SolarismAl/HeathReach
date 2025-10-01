import { Stack } from 'expo-router';
import { colors } from '../../styles/neumorphism';

export default function AuthLayout() {

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.primary,
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
