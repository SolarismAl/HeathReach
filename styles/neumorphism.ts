import { StyleSheet, Platform } from 'react-native';

/**
 * Neumorphism/Soft UI + Material Design Global Styles
 * 
 * Design Principles:
 * - Soft shadows for depth
 * - Subtle gradients
 * - Rounded corners
 * - Light background colors
 * - Elevated cards with inner/outer shadows
 */

// Color Palette
export const colors = {
  // Primary Colors
  primary: '#4A90E2',
  primaryLight: '#6BA3E8',
  primaryDark: '#3A7BC8',
  primarySoft: '#E3F2FD',
  
  // Secondary Colors
  secondary: '#2E7D32',
  secondaryLight: '#4CAF50',
  secondaryDark: '#1B5E20',
  secondarySoft: '#E8F5E9',
  
  // Accent Colors
  accent: '#FF5722',
  accentLight: '#FF7043',
  accentDark: '#E64A19',
  accentSoft: '#FFEBEE',
  
  // Status Colors
  success: '#4CAF50',
  successSoft: '#E8F5E9',
  warning: '#FF9800',
  warningSoft: '#FFF3E0',
  error: '#F44336',
  errorSoft: '#FFEBEE',
  info: '#2196F3',
  infoSoft: '#E3F2FD',
  
  // Neutral Colors
  background: '#E8EDF2',
  backgroundLight: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceDark: '#F8F9FA',
  
  // Text Colors
  textPrimary: '#2C3E50',
  textSecondary: '#5A6C7D',
  textTertiary: '#8E9AAF',
  textDisabled: '#BDC3C7',
  
  // Border Colors
  border: '#D1D9E6',
  borderLight: '#E4E9F2',
  borderDark: '#A8B4C7',
  
  // Shadow Colors
  shadowDark: '#A3B1C6',
  shadowLight: '#FFFFFF',
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border Radius
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 50,
};

// Typography
export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: colors.textPrimary,
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: colors.textPrimary,
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    lineHeight: 28,
  },
  h5: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  h6: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  body1: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: colors.textTertiary,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.surface,
    lineHeight: 24,
  },
};

// Neumorphism Shadow Styles
export const shadows = {
  // Elevated (raised) elements
  elevated: {
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  elevatedLight: {
    shadowColor: colors.shadowLight,
    shadowOffset: { width: -4, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  
  // Pressed (inset) elements
  pressed: {
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  pressedInner: {
    shadowColor: colors.shadowLight,
    shadowOffset: { width: -2, height: -2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  
  // Floating elements
  floating: {
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  
  // Subtle shadow
  subtle: {
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
};

// Global Neumorphism Styles
export const neumorphism = StyleSheet.create({
  // Container Styles
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  
  // Card Styles
  card: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.elevated,
  },
  
  cardFlat: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.subtle,
  },
  
  cardPressed: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.pressed,
  },
  
  // Button Styles
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.elevated,
  },
  
  buttonText: {
    ...typography.button,
    color: colors.surface,
  },
  
  buttonSecondary: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.elevated,
  },
  
  buttonSecondaryText: {
    ...typography.button,
    color: colors.primary,
  },
  
  buttonOutline: {
    backgroundColor: 'transparent',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  
  buttonOutlineText: {
    ...typography.button,
    color: colors.primary,
  },
  
  // Input Styles
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: 16,
    color: colors.textPrimary,
    ...shadows.pressed,
  },
  
  inputContainer: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    ...shadows.pressed,
  },
  
  inputFocused: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  
  // Icon Container Styles
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.round,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.elevated,
  },
  
  iconContainerSmall: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.round,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.elevated,
  },
  
  iconContainerLarge: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.round,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.elevated,
  },
  
  // Badge Styles
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primarySoft,
  },
  
  badgeText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  
  // Status Badge Styles
  badgeSuccess: {
    backgroundColor: colors.successSoft,
  },
  badgeSuccessText: {
    color: colors.success,
  },
  
  badgeWarning: {
    backgroundColor: colors.warningSoft,
  },
  badgeWarningText: {
    color: colors.warning,
  },
  
  badgeError: {
    backgroundColor: colors.errorSoft,
  },
  badgeErrorText: {
    color: colors.error,
  },
  
  badgeInfo: {
    backgroundColor: colors.infoSoft,
  },
  badgeInfoText: {
    color: colors.info,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(44, 62, 80, 0.5)',
    justifyContent: 'flex-end',
  },
  
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    maxHeight: '90%',
    ...shadows.floating,
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  
  modalTitle: {
    ...typography.h4,
  },
  
  modalBody: {
    padding: spacing.lg,
  },
  
  modalFooter: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: spacing.md,
  },
  
  // List Item Styles
  listItem: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.elevated,
  },
  
  listItemPressed: {
    backgroundColor: colors.background,
    ...shadows.pressed,
  },
  
  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  
  // Loading Container
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  
  loadingText: {
    ...typography.body1,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  
  emptyStateTitle: {
    ...typography.h5,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  
  emptyStateText: {
    ...typography.body2,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Header Styles
  header: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  
  headerTitle: {
    ...typography.h2,
    color: colors.surface,
  },
  
  headerSubtitle: {
    ...typography.body1,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  
  // Section Styles
  section: {
    marginBottom: spacing.lg,
  },
  
  sectionTitle: {
    ...typography.h5,
    marginBottom: spacing.md,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  
  // Avatar Styles
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.elevated,
  },
  
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.elevated,
  },
  
  avatarLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.elevated,
  },
  
  // Floating Action Button
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.floating,
  },
  
  // Tab Bar Styles
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
    ...shadows.elevated,
  },
  
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  
  tabActive: {
    backgroundColor: colors.primary,
    ...shadows.pressed,
  },
  
  tabText: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  
  tabTextActive: {
    ...typography.body2,
    color: colors.surface,
    fontWeight: '600',
  },
});

// Helper function to create custom neumorphic styles
export const createNeumorphicStyle = (
  backgroundColor: string = colors.background,
  size: 'small' | 'medium' | 'large' = 'medium'
) => {
  const shadowIntensity = {
    small: { dark: 0.1, light: 0.8, offset: 3, radius: 5 },
    medium: { dark: 0.2, light: 1, offset: 6, radius: 10 },
    large: { dark: 0.25, light: 1, offset: 8, radius: 15 },
  };
  
  const intensity = shadowIntensity[size];
  
  return {
    backgroundColor,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: intensity.offset, height: intensity.offset },
    shadowOpacity: intensity.dark,
    shadowRadius: intensity.radius,
    elevation: intensity.offset,
  };
};

export default neumorphism;
