import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

/**
 * Debug Helper for Production Builds
 * Shows visible alerts and logs to help debug token issues
 */

export class DebugHelper {
  private static logs: string[] = [];
  private static maxLogs = 50;

  /**
   * Add a log entry
   */
  static log(message: string, data?: any) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const logEntry = `[${timestamp}] ${message}${data ? ': ' + JSON.stringify(data) : ''}`;
    
    console.log(logEntry);
    this.logs.unshift(logEntry);
    
    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }
  }

  /**
   * Get all logs as a string
   */
  static getLogs(): string {
    return this.logs.join('\n');
  }

  /**
   * Clear all logs
   */
  static clearLogs() {
    this.logs = [];
  }

  /**
   * Check token status and show alert
   */
  static async checkTokenStatus(): Promise<{
    hasTokens: boolean;
    details: string;
    tokens: any;
  }> {
    try {
      const tokens = {
        firebase_id_token: await AsyncStorage.getItem('firebase_id_token'),
        userToken: await AsyncStorage.getItem('userToken'),
        auth_token: await AsyncStorage.getItem('auth_token'),
        user_data: await AsyncStorage.getItem('user_data'),
        userData: await AsyncStorage.getItem('userData'),
      };

      const tokenStatus = Object.entries(tokens).map(([key, value]) => {
        if (value) {
          const length = value.length;
          const preview = value.substring(0, 20) + '...';
          return `✅ ${key}: ${length} chars\n   ${preview}`;
        }
        return `❌ ${key}: NULL`;
      }).join('\n');

      const hasTokens = !!(tokens.firebase_id_token || tokens.userToken);

      this.log('Token Status Check', { hasTokens, tokenCount: Object.values(tokens).filter(Boolean).length });

      return {
        hasTokens,
        details: tokenStatus,
        tokens
      };
    } catch (error) {
      this.log('Error checking token status', error);
      return {
        hasTokens: false,
        details: 'Error checking tokens',
        tokens: {}
      };
    }
  }

  /**
   * Show token status alert
   */
  static async showTokenStatusAlert() {
    const status = await this.checkTokenStatus();
    
    Alert.alert(
      status.hasTokens ? '✅ Tokens Found' : '❌ No Tokens',
      status.details,
      [
        { text: 'Copy Logs', onPress: () => this.showLogsAlert() },
        { text: 'OK' }
      ]
    );
  }

  /**
   * Show logs alert
   */
  static showLogsAlert() {
    const logs = this.getLogs();
    Alert.alert(
      'Debug Logs',
      logs || 'No logs available',
      [
        { text: 'Clear', onPress: () => this.clearLogs() },
        { text: 'Close' }
      ]
    );
  }

  /**
   * Log API request
   */
  static logApiRequest(url: string, method: string, hasToken: boolean) {
    this.log(`API ${method} ${url}`, { hasToken });
  }

  /**
   * Log API response
   */
  static logApiResponse(url: string, status: number, success: boolean, message?: string) {
    this.log(`API Response ${url}`, { status, success, message });
  }

  /**
   * Log authentication event
   */
  static logAuth(event: string, details?: any) {
    this.log(`AUTH: ${event}`, details);
  }

  /**
   * Show error with logs
   */
  static showErrorWithLogs(title: string, message: string) {
    Alert.alert(
      title,
      `${message}\n\nTap "View Logs" to see debug info`,
      [
        { text: 'View Logs', onPress: () => this.showLogsAlert() },
        { text: 'Check Tokens', onPress: () => this.showTokenStatusAlert() },
        { text: 'OK' }
      ]
    );
  }

  /**
   * Create a debug info object for display
   */
  static async getDebugInfo(): Promise<string> {
    const status = await this.checkTokenStatus();
    const logs = this.getLogs();
    
    return `
=== TOKEN STATUS ===
${status.details}

=== RECENT LOGS ===
${logs || 'No logs'}
    `.trim();
  }
}

export default DebugHelper;
