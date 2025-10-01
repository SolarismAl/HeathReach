import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, StatusBar, useColorScheme, View, StyleSheet } from 'react-native';
import { colors } from '../../styles/neumorphism';

export default function AuthLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Define colors based on theme
  const themeColors = {
    background: isDark ? '#1a1a1a' : colors.background,
  };

  return (
    <SafeAreaProvider>
      <View style={[styles.safeAreaBackground, { backgroundColor: themeColors.background }]}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: themeColors.background,
              paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeAreaBackground: {
    flex: 1,
  },
});
