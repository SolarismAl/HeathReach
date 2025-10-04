declare module 'expo-web-browser' {
  export enum WebBrowserPresentationStyle {
    AUTOMATIC = 'automatic',
    OVER_FULL_SCREEN = 'overFullScreen',
    OVER_CURRENT_CONTEXT = 'overCurrentContext',
    FULL_SCREEN = 'fullScreen',
    PAGE_SHEET = 'pageSheet',
    FORM_SHEET = 'formSheet',
    CURRENT_CONTEXT = 'currentContext',
    CUSTOM = 'custom',
    NONE = 'none',
  }

  export enum WebBrowserResultType {
    CANCEL = 'cancel',
    DISMISS = 'dismiss',
    OPENED = 'opened',
    LOCKED = 'locked',
  }

  export interface WebBrowserOpenOptions {
    presentationStyle?: WebBrowserPresentationStyle;
    preferredBarTintColor?: string;
    preferredControlTintColor?: string;
    enableBarCollapsing?: boolean;
    enableDefaultShareMenuItem?: boolean;
    showTitle?: boolean;
    showInRecents?: boolean;
    browserPackage?: string;
    secondaryToolbarColor?: string;
    navigationBarColor?: string;
    enableUrlBarHiding?: boolean;
    enableDefaultShare?: boolean;
    toolbarColor?: string;
    controlsColor?: string;
    collapseToolbar?: boolean;
    createTask?: boolean;
    dismissButtonStyle?: 'done' | 'close' | 'cancel';
    readerMode?: boolean;
    modalPresentationStyle?: 'automatic' | 'fullScreen' | 'pageSheet' | 'formSheet' | 'currentContext' | 'custom' | 'overFullScreen' | 'overCurrentContext' | 'popover' | 'none';
    modalEnabled?: boolean;
  }

  export interface WebBrowserResult {
    type: WebBrowserResultType;
    url?: string;
  }

  export interface WebBrowserAuthSessionResult {
    type: 'success' | 'cancel';
    url?: string;
    errorCode?: string;
  }

  export interface WebBrowserRedirectResult {
    type: 'success' | 'cancel';
    url: string;
  }

  export interface WebBrowserCompleteAuthSessionOptions {
    skipRedirectCheck?: boolean;
  }

  export interface WebBrowserCompleteAuthSessionResult {
    type: 'success' | 'failed';
    message?: string;
  }

  export interface WebBrowserWarmUpResult {
    servicePackage?: string;
  }

  export interface WebBrowserCoolDownResult {
    servicePackage?: string;
  }

  export interface WebBrowserMayInitWithUrlResult {
    servicePackage?: string;
  }

  // Functions
  export function openBrowserAsync(
    url: string,
    browserParams?: WebBrowserOpenOptions
  ): Promise<WebBrowserResult>;

  export function openAuthSessionAsync(
    url: string,
    redirectUrl?: string,
    browserParams?: WebBrowserOpenOptions
  ): Promise<WebBrowserAuthSessionResult>;

  export function dismissBrowser(): Promise<WebBrowserResult>;

  export function warmUpAsync(browserPackage?: string): Promise<WebBrowserWarmUpResult>;

  export function coolDownAsync(browserPackage?: string): Promise<WebBrowserCoolDownResult>;

  export function mayInitWithUrlAsync(
    url: string,
    browserPackage?: string
  ): Promise<WebBrowserMayInitWithUrlResult>;

  export function getCustomTabsSupportingBrowsersAsync(): Promise<string[]>;

  export function completeAuthSession(
    options?: WebBrowserCompleteAuthSessionOptions
  ): WebBrowserCompleteAuthSessionResult;

  export function maybeCompleteAuthSession(
    options?: WebBrowserCompleteAuthSessionOptions
  ): WebBrowserCompleteAuthSessionResult;
}
