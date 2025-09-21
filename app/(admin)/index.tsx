import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';
import { AdminStats } from '../../types';
import { ProtectedRoute } from '../../components/ProtectedRoute';

const { width } = Dimensions.get('window');

export default function AdminDashboardScreen() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await apiService.getAdminStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const testAuthentication = async () => {
    try {
      console.log('Testing authentication...');
      const authResult = await apiService.testAuth();
      const adminResult = await apiService.testAdminAuth();
      
      Alert.alert(
        'Authentication Test Results',
        `Auth Test: ${authResult.success ? 'PASSED' : 'FAILED'}\n` +
        `Admin Test: ${adminResult.success ? 'PASSED' : 'FAILED'}\n\n` +
        `Check console for detailed logs.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Authentication test error:', error);
      Alert.alert('Test Error', 'Failed to run authentication tests');
    }
  };

  const debugAuthentication = async () => {
    try {
      console.log('Running authentication debug...');
      await apiService.debugAuthState();
      Alert.alert(
        'Debug Complete',
        'Authentication debug information has been logged to console. Check the browser developer tools for detailed information.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Debug authentication error:', error);
      Alert.alert('Debug Error', 'Failed to run authentication debug');
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle }: any) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <View style={styles.statContent}>
          <Text style={styles.statValue}>{value.toLocaleString()}</Text>
          <Text style={styles.statTitle}>{title}</Text>
          {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </View>
      </View>
    </View>
  );

  const QuickAction = ({ title, icon, color, onPress }: any) => (
    <TouchableOpacity style={styles.quickActionCard} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <Ionicons name="analytics" size={50} color="#D32F2F" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.container}
          refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>System Overview</Text>
        <Text style={styles.headerSubtitle}>
          Monitor and manage your HealthReach platform
        </Text>
      </View>

      {/* User Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Statistics</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Users"
            value={stats?.total_users || 0}
            icon="people"
            color="#4A90E2"
            subtitle="All registered users"
          />
          <StatCard
            title="Patients"
            value={stats?.total_patients || 0}
            icon="person"
            color="#2E7D32"
            subtitle="Active patients"
          />
          <StatCard
            title="Health Workers"
            value={stats?.total_health_workers || 0}
            icon="medical"
            color="#FF9800"
            subtitle="Healthcare providers"
          />
        </View>
      </View>

      {/* Appointment Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appointment Statistics</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Appointments"
            value={stats?.total_appointments || 0}
            icon="calendar"
            color="#9C27B0"
            subtitle="All time"
          />
          <StatCard
            title="Pending"
            value={stats?.pending_appointments || 0}
            icon="time"
            color="#FF5722"
            subtitle="Awaiting approval"
          />
          <StatCard
            title="Completed"
            value={stats?.completed_appointments || 0}
            icon="checkmark-circle"
            color="#4CAF50"
            subtitle="Successfully finished"
          />
        </View>
      </View>

      {/* Service & Center Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Platform Resources</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Services"
            value={stats?.total_services || 0}
            icon="medical-outline"
            color="#00BCD4"
            subtitle="Available services"
          />
          <StatCard
            title="Health Centers"
            value={stats?.total_health_centers || 0}
            icon="business"
            color="#795548"
            subtitle="Partner facilities"
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <QuickAction
            title="Manage Users"
            icon="people-outline"
            color="#4A90E2"
            onPress={() => {}}
          />
          <QuickAction
            title="View Logs"
            icon="document-text-outline"
            color="#FF9800"
            onPress={() => {}}
          />
          <QuickAction
            title="Send Alert"
            icon="notifications-outline"
            color="#F44336"
            onPress={() => {}}
          />
          <QuickAction
            title="Test Auth"
            icon="shield-checkmark-outline"
            color="#9C27B0"
            onPress={testAuthentication}
          />
          <QuickAction
            title="Debug Auth"
            icon="bug-outline"
            color="#E91E63"
            onPress={debugAuthentication}
          />
        </View>
      </View>

      {/* System Health */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Health</Text>
        <View style={styles.healthCard}>
          <View style={styles.healthItem}>
            <View style={styles.healthIndicator}>
              <View style={[styles.healthDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.healthLabel}>API Status</Text>
            </View>
            <Text style={styles.healthValue}>Operational</Text>
          </View>
          
          <View style={styles.healthItem}>
            <View style={styles.healthIndicator}>
              <View style={[styles.healthDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.healthLabel}>Database</Text>
            </View>
            <Text style={styles.healthValue}>Connected</Text>
          </View>
          
          <View style={styles.healthItem}>
            <View style={styles.healthIndicator}>
              <View style={[styles.healthDot, { backgroundColor: '#FF9800' }]} />
              <Text style={styles.healthLabel}>Notifications</Text>
            </View>
            <Text style={styles.healthValue}>Limited</Text>
          </View>
        </View>
      </View>

      {/* Recent Activity Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          <View style={styles.activityItem}>
            <Ionicons name="person-add" size={20} color="#4CAF50" />
            <Text style={styles.activityText}>5 new users registered today</Text>
          </View>
          <View style={styles.activityItem}>
            <Ionicons name="calendar" size={20} color="#2196F3" />
            <Text style={styles.activityText}>12 appointments booked today</Text>
          </View>
          <View style={styles.activityItem}>
            <Ionicons name="medical" size={20} color="#FF9800" />
            <Text style={styles.activityText}>3 new services added</Text>
          </View>
        </View>
      </View>
        </ScrollView>
      )}
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#D32F2F',
    padding: 24,
    paddingBottom: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  section: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    gap: 12,
  },
  statCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 2,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: (width - 64) / 2,
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  healthCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
  },
  healthItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  healthIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  healthLabel: {
    fontSize: 14,
    color: '#666',
  },
  healthValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  activityCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activityText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
});
