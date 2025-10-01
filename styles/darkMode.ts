import { useColorScheme } from 'react-native';
import { colors as lightColors } from './neumorphism';

/**
 * Dark Mode Theme Configuration
 * Provides consistent dark mode colors across the entire app
 */

export const darkColors = {
  // Primary Colors (keep same for brand consistency)
  primary: '#4A90E2',
  primaryLight: '#6BA3E8',
  primaryDark: '#3A7BC8',
  primarySoft: '#1a3a5c',
  
  // Secondary Colors
  secondary: '#2E7D32',
  secondaryLight: '#4CAF50',
  secondaryDark: '#1B5E20',
  secondarySoft: '#1a3a1f',
  
  // Accent Colors
  accent: '#FF5722',
  accentLight: '#FF7043',
  accentDark: '#E64A19',
  accentSoft: '#3a1f1a',
  
  // Status Colors
  success: '#4CAF50',
  successSoft: '#1a3a1f',
  warning: '#FF9800',
  warningSoft: '#3a2f1a',
  error: '#F44336',
  errorSoft: '#3a1f1f',
  info: '#2196F3',
  infoSoft: '#1a2f3a',
  
  // Neutral Colors (Dark Mode)
  background: '#121212',
  backgroundLight: '#1a1a1a',
  surface: '#1e1e1e',
  surfaceDark: '#2d2d2d',
  
  // Text Colors (Dark Mode)
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textTertiary: '#808080',
  textDisabled: '#4a4a4a',
  
  // Border Colors (Dark Mode)
  border: '#3d3d3d',
  borderLight: '#2d2d2d',
  borderDark: '#4d4d4d',
  
  // Shadow Colors (Dark Mode)
  shadowDark: '#000000',
  shadowLight: '#2d2d2d',
};

/**
 * Hook to get theme colors based on system color scheme
 */
export function useThemeColors() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return isDark ? darkColors : lightColors;
}

/**
 * Get colors for a specific color scheme
 */
export function getThemeColors(isDark: boolean) {
  return isDark ? darkColors : lightColors;
}

/**
 * Common theme-aware styles
 */
export function getThemedStyles(isDark: boolean) {
  const colors = getThemeColors(isDark);
  
  return {
    container: {
      backgroundColor: colors.background,
    },
    surface: {
      backgroundColor: colors.surface,
    },
    card: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    input: {
      backgroundColor: colors.surface,
      color: colors.textPrimary,
      borderColor: colors.border,
    },
    text: {
      color: colors.textPrimary,
    },
    textSecondary: {
      color: colors.textSecondary,
    },
    border: {
      borderColor: colors.border,
    },
  };
}
