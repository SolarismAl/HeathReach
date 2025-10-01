import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, StatusBar, useColorScheme, View, StyleSheet } from 'react-native';
import { colors } from '../../styles/neumorphism';

export default function PatientLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Define colors based on theme
  const themeColors = {
    background: isDark ? '#1a1a1a' : colors.background,
    surface: isDark ? '#2d2d2d' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#666',
    border: isDark ? '#3d3d3d' : '#E0E0E0',
    primary: colors.primary,
  };

  return (
    <SafeAreaProvider>
      <View style={[styles.safeAreaBackground, { backgroundColor: themeColors.background }]}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: themeColors.primary,
            tabBarInactiveTintColor: themeColors.text,
            tabBarStyle: {
              backgroundColor: themeColors.surface,
              borderTopWidth: 1,
              borderTopColor: themeColors.border,
              paddingBottom: 8,
              paddingTop: 8,
              height: 70,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '500',
            },
            headerStyle: {
              backgroundColor: themeColors.primary,
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            sceneStyle: {
              backgroundColor: themeColors.background,
              paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
            },
          }}
        >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="book-appointment"
        options={{
          title: 'Book',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'About HealthReach',
          href: null, // This hides the tab from the tab bar
          headerShown: false,
        }}
      />
    </Tabs>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeAreaBackground: {
    flex: 1,
  },
});
