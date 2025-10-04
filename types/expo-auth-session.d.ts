declare module 'expo-auth-session' {
  export interface AuthSessionResult {
    type: 'success' | 'error' | 'cancel' | 'dismiss' | 'locked';
    params?: Record<string, string>;
    authentication?: {
      accessToken?: string;
      idToken?: string;
      refreshToken?: string;
      tokenType?: string;
      expiresIn?: number;
      scope?: string;
      state?: string;
    };
    error?: {
      code?: string;
      message?: string;
      description?: string;
      [key: string]: any;
    };
    url?: string;
  }

  export interface AuthRequest {
    clientId: string;
    scopes?: string[];
    redirectUri: string;
    responseType?: string;
    state?: string;
    codeChallenge?: string;
    codeChallengeMethod?: string;
    prompt?: string;
    extraParams?: Record<string, string>;
    additionalParameters?: Record<string, string>;
    usePKCE?: boolean;
  }

  export interface AuthRequestConfig {
    clientId: string;
    scopes?: string[];
    redirectUri?: string;
    responseType?: string;
    state?: string;
    codeChallenge?: string;
    codeChallengeMethod?: string;
    prompt?: string;
    extraParams?: Record<string, string>;
    additionalParameters?: Record<string, string>;
    usePKCE?: boolean;
  }

  export interface DiscoveryDocument {
    authorizationEndpoint: string;
    tokenEndpoint: string;
    revocationEndpoint?: string;
    userInfoEndpoint?: string;
    issuer?: string;
    jwksUri?: string;
    endSessionEndpoint?: string;
  }

  export function makeRedirectUri(options?: {
    scheme?: string;
    path?: string;
    queryParams?: Record<string, string>;
    isTripleSlashed?: boolean;
    preferLocalhost?: boolean;
    native?: string;
  }): string;

  export function startAsync(options: {
    authUrl: string;
    returnUrl?: string;
    showInRecents?: boolean;
  }): Promise<AuthSessionResult>;

  export function dismissAsync(): Promise<void>;

  export function getDefaultReturnUrl(urlPath?: string, options?: {
    isTripleSlashed?: boolean;
    queryParams?: Record<string, string>;
  }): string;

  export function useAuthRequest(
    config: AuthRequestConfig,
    discovery?: DiscoveryDocument | string
  ): [AuthRequest | null, AuthSessionResult | null, (options?: any) => Promise<AuthSessionResult>];

  export function useAutoDiscovery(issuerOrDiscovery: string | DiscoveryDocument): DiscoveryDocument | null;

  export function fetchDiscoveryAsync(issuer: string): Promise<DiscoveryDocument>;

  export function revokeAsync(
    config: {
      clientId: string;
      token: string;
      isClientIdProvided?: boolean;
    },
    discovery: DiscoveryDocument
  ): Promise<any>;

  export function refreshAsync(
    config: {
      clientId: string;
      refreshToken: string;
      scopes?: string[];
      extraParams?: Record<string, string>;
    },
    discovery: DiscoveryDocument
  ): Promise<any>;

  export function exchangeCodeAsync(
    config: {
      clientId: string;
      code: string;
      redirectUri: string;
      scopes?: string[];
      extraParams?: Record<string, string>;
    },
    discovery: DiscoveryDocument
  ): Promise<any>;
}

declare module 'expo-auth-session/providers/google' {
  import { AuthRequest, AuthSessionResult, AuthRequestConfig } from 'expo-auth-session';

  export interface GoogleAuthRequestConfig extends AuthRequestConfig {
    androidClientId?: string;
    iosClientId?: string;
    webClientId?: string;
    expoClientId?: string;
    selectAccount?: boolean;
    language?: string;
  }

  export function useAuthRequest(
    config?: GoogleAuthRequestConfig
  ): [AuthRequest | null, AuthSessionResult | null, (options?: any) => Promise<AuthSessionResult>];

  export function useIdTokenAuthRequest(
    config?: GoogleAuthRequestConfig
  ): [AuthRequest | null, AuthSessionResult | null, (options?: any) => Promise<AuthSessionResult>];
}
