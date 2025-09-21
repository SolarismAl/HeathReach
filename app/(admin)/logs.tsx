import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';
import { ActivityLog } from '../../types';

export default function ActivityLogsScreen() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  useEffect(() => {
    loadLogs();
  }, [filter]);

  const loadLogs = async () => {
    try {
      const params: any = {};
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      
      // Add date filter
      const now = new Date();
      switch (filter) {
        case 'today':
          params.date_from = now.toISOString().split('T')[0];
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          params.date_from = weekAgo.toISOString().split('T')[0];
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          params.date_from = monthAgo.toISOString().split('T')[0];
          break;
      }

      const response = await apiService.getActivityLogs(params);
      if (response.success) {
        setLogs(response.data || []);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLogs();
    setRefreshing(false);
  };

  const handleSearch = () => {
    loadLogs();
  };

  const getActionIcon = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('login')) return 'log-in';
    if (actionLower.includes('logout')) return 'log-out';
    if (actionLower.includes('create')) return 'add-circle';
    if (actionLower.includes('update')) return 'pencil';
    if (actionLower.includes('delete')) return 'trash';
    if (actionLower.includes('appointment')) return 'calendar';
    if (actionLower.includes('notification')) return 'notifications';
    return 'information-circle';
  };

  const getActionColor = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('login')) return '#4CAF50';
    if (actionLower.includes('logout')) return '#FF9800';
    if (actionLower.includes('create')) return '#2196F3';
    if (actionLower.includes('update')) return '#9C27B0';
    if (actionLower.includes('delete')) return '#F44336';
    if (actionLower.includes('appointment')) return '#00BCD4';
    if (actionLower.includes('notification')) return '#FF5722';
    return '#666';
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const renderLog = ({ item }: { item: ActivityLog }) => (
    <View style={styles.logCard}>
      <View style={styles.logHeader}>
        <View style={[styles.actionIcon, { backgroundColor: getActionColor(item.action) + '20' }]}>
          <Ionicons
            name={getActionIcon(item.action) as any}
            size={20}
            color={getActionColor(item.action)}
          />
        </View>
        <View style={styles.logContent}>
          <Text style={styles.logAction}>{item.action}</Text>
          <Text style={styles.logTime}>{formatDateTime(item.created_at)}</Text>
        </View>
      </View>

      <Text style={styles.logDescription}>{item.description}</Text>

      <View style={styles.logMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="person-outline" size={14} color="#666" />
          <Text style={styles.metaText}>{item.user?.name || 'System'}</Text>
        </View>
        
        {item.ip_address && (
          <View style={styles.metaItem}>
            <Ionicons name="globe-outline" size={14} color="#666" />
            <Text style={styles.metaText}>{item.ip_address}</Text>
          </View>
        )}
      </View>

      {item.user_agent && (
        <View style={styles.userAgentContainer}>
          <Text style={styles.userAgentLabel}>User Agent:</Text>
          <Text style={styles.userAgentText} numberOfLines={2}>
            {item.user_agent}
          </Text>
        </View>
      )}
    </View>
  );

  const filterButtons = [
    { key: 'all', label: 'All Time' },
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
  ];

  return (
    <View style={styles.container}>
      {/* Search Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search logs..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => {
              setSearchQuery('');
              loadLogs();
            }}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filterButtons}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                filter === item.key && styles.filterButtonActive
              ]}
              onPress={() => setFilter(item.key as any)}
            >
              <Text style={[
                styles.filterButtonText,
                filter === item.key && styles.filterButtonTextActive
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Logs List */}
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderLog}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#CCC" />
            <Text style={styles.emptyStateTitle}>No Activity Logs</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'No logs match your search criteria.' : 'No activity logs found for the selected period.'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  searchSection: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    color: '#333',
  },
  searchButton: {
    backgroundColor: '#D32F2F',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  filterButtonActive: {
    backgroundColor: '#D32F2F',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
  },
  logCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logContent: {
    flex: 1,
  },
  logAction: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  logTime: {
    fontSize: 12,
    color: '#999',
  },
  logDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  logMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  userAgentContainer: {
    backgroundColor: '#F8F9FA',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  userAgentLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
    marginBottom: 2,
  },
  userAgentText: {
    fontSize: 10,
    color: '#999',
    lineHeight: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
