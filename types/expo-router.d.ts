declare module 'expo-router' {
  export type Href = string | {
    pathname: string;
    params?: Record<string, any>;
  };

  export interface RouterOptions {
    pathname?: string;
    params?: Record<string, any>;
  }

  export interface Router {
    push: (href: string | RouterOptions) => void;
    replace: (href: string | RouterOptions) => void;
    back: () => void;
    canGoBack: () => boolean;
    setParams: (params: Record<string, any>) => void;
    navigate: (href: string | RouterOptions) => void;
  }

  export const router: Router;

  export interface LinkProps {
    href: Href;
    asChild?: boolean;
    replace?: boolean;
    push?: boolean;
    children?: React.ReactNode;
    style?: any;
    onPress?: (event?: any) => void | Promise<void>;
    target?: string;
    dismissTo?: boolean;
  }

  export const Link: React.ComponentType<LinkProps>;

  export interface RedirectProps {
    href: string;
  }

  export const Redirect: React.ComponentType<RedirectProps>;

  export interface StackOptions {
    title?: string;
    headerShown?: boolean;
    headerTitle?: string;
    headerBackTitle?: string;
    headerTitleStyle?: any;
    headerStyle?: any;
    headerTintColor?: string;
    headerBackTitleVisible?: boolean;
    headerLeft?: (props: any) => React.ReactNode;
    headerRight?: (props: any) => React.ReactNode;
    headerCenter?: (props: any) => React.ReactNode;
    headerBackground?: (props: any) => React.ReactNode;
    headerShadowVisible?: boolean;
    headerTransparent?: boolean;
    headerBlurEffect?: string;
    gestureEnabled?: boolean;
    gestureDirection?: 'horizontal' | 'vertical';
    animationDuration?: number;
    cardStyle?: any;
    cardStyleInterpolator?: any;
    headerStyleInterpolator?: any;
    transitionSpec?: any;
    detachPreviousScreen?: boolean;
    freezeOnBlur?: boolean;
    contentStyle?: any;
    presentation?: 'card' | 'modal' | 'transparentModal' | 'containedModal' | 'containedTransparentModal' | 'fullScreenModal' | 'formSheet';
    animation?: 'default' | 'fade' | 'fade_from_bottom' | 'flip' | 'none' | 'simple_push' | 'slide_from_bottom' | 'slide_from_right' | 'slide_from_left';
  }

  export interface StackProps {
    children?: React.ReactNode;
    screenOptions?: StackOptions;
  }

  export const Stack: React.ComponentType<StackProps> & {
    Screen: React.ComponentType<{
      name: string;
      options?: StackOptions | ((props: any) => StackOptions);
      children?: React.ReactNode;
    }>;
  };

  export interface TabsOptions {
    title?: string;
    tabBarLabel?: string;
    tabBarIcon?: (props: { focused: boolean; color: string; size: number }) => React.ReactNode;
    tabBarBadge?: string | number;
    tabBarShowLabel?: boolean;
    tabBarActiveTintColor?: string;
    tabBarInactiveTintColor?: string;
    tabBarStyle?: any;
    tabBarLabelStyle?: any;
    tabBarIconStyle?: any;
    headerShown?: boolean;
    headerTitle?: string;
    headerStyle?: any;
    headerTintColor?: string;
    headerTitleStyle?: any;
    headerBackTitle?: string;
    sceneStyle?: any;
    href?: string | null;
  }

  export interface TabsProps {
    children?: React.ReactNode;
    screenOptions?: TabsOptions;
  }

  export const Tabs: React.ComponentType<TabsProps> & {
    Screen: React.ComponentType<{
      name: string;
      options?: TabsOptions | ((props: any) => TabsOptions);
      children?: React.ReactNode;
    }>;
  };

  export interface SlotProps {
    children?: React.ReactNode;
  }

  export const Slot: React.ComponentType<SlotProps>;

  // Hooks
  export function useRouter(): Router;
  export function useLocalSearchParams<T = Record<string, string>>(): T;
  export function useGlobalSearchParams<T = Record<string, string>>(): T;
  export function useSegments(): string[];
  export function usePathname(): string;
  export function useRootNavigation(): any;
  export function useRootNavigationState(): any;
  export function useFocusEffect(effect: () => void | (() => void)): void;

  // Navigation events
  export function useNavigation(): any;
}
