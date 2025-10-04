declare module 'expo-notifications' {
  export interface NotificationContent {
    title?: string;
    subtitle?: string;
    body?: string;
    data?: Record<string, any>;
    sound?: string | boolean;
    badge?: number;
    categoryIdentifier?: string;
    launchImageName?: string;
    attachments?: NotificationAttachment[];
  }

  export interface NotificationAttachment {
    identifier: string;
    url: string;
    type?: string;
  }

  export interface NotificationTrigger {
    type: 'push' | 'calendar' | 'location' | 'timeInterval' | 'daily' | 'weekly' | 'yearly' | 'unknown';
    repeats?: boolean;
    channelId?: string;
  }

  export type NotificationTriggerInput = NotificationTrigger | Date | null;

  export interface Notification {
    date: number;
    request: NotificationRequest;
  }

  export interface NotificationRequest {
    identifier: string;
    content: NotificationContent;
    trigger: NotificationTrigger;
  }

  export interface NotificationResponse {
    notification: Notification;
    actionIdentifier: string;
    userText?: string;
  }

  export interface NotificationBehavior {
    shouldShowAlert?: boolean;
    shouldPlaySound?: boolean;
    shouldSetBadge?: boolean;
  }

  export interface NotificationChannel {
    id?: string;
    name: string;
    importance: number;
    bypassDnd?: boolean;
    description?: string;
    groupId?: string;
    lightColor?: string;
    lockscreenVisibility?: number;
    showBadge?: boolean;
    sound?: string;
    audioAttributes?: AudioAttributes;
    vibrationPattern?: number[];
    enableLights?: boolean;
    enableVibrate?: boolean;
  }

  export interface AudioAttributes {
    usage: number;
    contentType: number;
    flags: number;
  }

  export interface NotificationChannelGroup {
    id: string;
    name: string;
    description?: string;
  }

  export interface DevicePushToken {
    type: 'ios' | 'android';
    data: string;
  }

  export interface ExpoPushToken {
    type: 'expo';
    data: string;
  }

  export type PushToken = DevicePushToken | ExpoPushToken;

  export interface NotificationPermissionsStatus {
    status: 'granted' | 'denied' | 'undetermined';
    canAskAgain?: boolean;
    granted: boolean;
    ios?: {
      status: 'granted' | 'denied' | 'provisional' | 'undetermined';
      allowsAlert?: boolean;
      allowsBadge?: boolean;
      allowsSound?: boolean;
      allowsCriticalAlerts?: boolean;
      allowsAnnouncements?: boolean;
      allowsDisplayInNotificationCenter?: boolean;
      allowsDisplayInCarPlay?: boolean;
      allowsDisplayOnLockScreen?: boolean;
      allowsPreviews?: boolean;
    };
    android?: {
      status: 'granted' | 'denied' | 'undetermined';
      importance: number;
      interruptionFilter?: number;
    };
  }

  export interface NotificationPermissionsRequest {
    ios?: {
      allowAlert?: boolean;
      allowBadge?: boolean;
      allowSound?: boolean;
      allowAnnouncements?: boolean;
      allowCriticalAlerts?: boolean;
      allowProvisional?: boolean;
      allowDisplayInCarPlay?: boolean;
      allowDisplayInNotificationCenter?: boolean;
      allowDisplayOnLockScreen?: boolean;
      allowPreviews?: boolean;
    };
    android?: {};
  }

  // Functions
  export function setNotificationHandler(handler: {
    handleNotification: (notification: Notification) => Promise<NotificationBehavior>;
    handleSuccess?: (notificationId: string) => void;
    handleError?: (notificationId: string, error: Error) => void;
  }): void;

  export function getPermissionsAsync(): Promise<NotificationPermissionsStatus>;
  export function requestPermissionsAsync(request?: NotificationPermissionsRequest): Promise<NotificationPermissionsStatus>;

  export function getExpoPushTokenAsync(options?: {
    experienceId?: string;
    applicationId?: string;
    development?: boolean;
    projectId?: string;
  }): Promise<ExpoPushToken>;

  export function getDevicePushTokenAsync(): Promise<DevicePushToken>;

  export function scheduleNotificationAsync(notificationRequest: {
    content: NotificationContent;
    trigger?: NotificationTriggerInput;
    identifier?: string;
  }): Promise<string>;

  export function presentNotificationAsync(content: NotificationContent, identifier?: string): Promise<string>;

  export function getAllScheduledNotificationsAsync(): Promise<NotificationRequest[]>;
  export function cancelScheduledNotificationAsync(identifier: string): Promise<void>;
  export function cancelAllScheduledNotificationsAsync(): Promise<void>;

  export function dismissNotificationAsync(identifier: string): Promise<void>;
  export function dismissAllNotificationsAsync(): Promise<void>;

  export function getPresentedNotificationsAsync(): Promise<Notification[]>;

  export function getBadgeCountAsync(): Promise<number>;
  export function setBadgeCountAsync(badgeCount: number, options?: { badge?: number }): Promise<boolean>;

  export function addNotificationReceivedListener(listener: (notification: Notification) => void): {
    remove: () => void;
  };

  export function addNotificationResponseReceivedListener(listener: (response: NotificationResponse) => void): {
    remove: () => void;
  };

  export function removeNotificationSubscription(subscription: { remove: () => void }): void;

  // Android specific
  export function setNotificationChannelAsync(channelId: string, channel: NotificationChannel): Promise<NotificationChannel | null>;
  export function getNotificationChannelAsync(channelId: string): Promise<NotificationChannel | null>;
  export function getNotificationChannelsAsync(): Promise<NotificationChannel[]>;
  export function deleteNotificationChannelAsync(channelId: string): Promise<void>;

  export function setNotificationChannelGroupAsync(groupId: string, group: NotificationChannelGroup): Promise<NotificationChannelGroup | null>;
  export function getNotificationChannelGroupAsync(groupId: string): Promise<NotificationChannelGroup | null>;
  export function getNotificationChannelGroupsAsync(): Promise<NotificationChannelGroup[]>;
  export function deleteNotificationChannelGroupAsync(groupId: string): Promise<void>;

  // Constants
  export const AndroidImportance: {
    MIN: number;
    LOW: number;
    DEFAULT: number;
    HIGH: number;
    MAX: number;
  };

  export const AndroidNotificationVisibility: {
    UNKNOWN: number;
    PUBLIC: number;
    PRIVATE: number;
    SECRET: number;
  };

  export const IosAuthorizationStatus: {
    NOT_DETERMINED: number;
    DENIED: number;
    AUTHORIZED: number;
    PROVISIONAL: number;
    EPHEMERAL: number;
  };
}
