import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { syncService } from './src/services/sync';
import { getRecentVisits, countOverdueFollowups } from './src/db/db';

export default function EnhancedReportsScreen() {
  const [reportData, setReportData] = useState({
    monthly: {
      visits: 0,
      followups: 0,
      newMembers: 0
    },
    weekly: {
      visits: 0,
      hours: 0,
      contactTypes: {
        inPerson: 0,
        phone: 0,
        video: 0,
        hospital: 0,
        home: 0,
        emergency: 0
      }
    },
    categories: {
      pastoral: 0,
      crisis: 0,
      discipleship: 0,
      evangelism: 0,
      administrative: 0,
      celebration: 0,
      bereavement: 0
    }
  });

  const [syncStatus, setSyncStatus] = useState({
    lastSync: null,
    pendingVisits: 0,
    pendingFollowups: 0,
    isOnline: false,
    isSyncing: false
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportData();
    loadSyncStatus();
    
    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      loadSyncStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      // Load recent visits for analytics
      const recentVisits = await getRecentVisits(30); // Last 30 days
      const weeklyVisits = await getRecentVisits(7); // Last 7 days
      const overdueFollowups = await countOverdueFollowups();

      // Calculate monthly stats
      const monthlyStats = {
        visits: recentVisits.length,
        followups: overdueFollowups,
        newMembers: recentVisits.filter(v => v.category === 'evangelism').length
      };

      // Calculate weekly stats
      const weeklyStats = {
        visits: weeklyVisits.length,
        hours: weeklyVisits.reduce((total, visit) => {
          const duration = visit.end_time && visit.start_time 
            ? (visit.end_time - visit.start_time) / (1000 * 60 * 60) // Convert to hours
            : 1; // Default 1 hour if no duration
          return total + duration;
        }, 0),
        contactTypes: {
          inPerson: weeklyVisits.filter(v => v.visit_type === 'in_person').length,
          phone: weeklyVisits.filter(v => v.visit_type === 'phone').length,
          video: weeklyVisits.filter(v => v.visit_type === 'video').length,
          hospital: weeklyVisits.filter(v => v.visit_type === 'hospital').length,
          home: weeklyVisits.filter(v => v.visit_type === 'home').length,
          emergency: weeklyVisits.filter(v => v.visit_type === 'emergency').length
        }
      };

      // Calculate category breakdown
      const categories = {
        pastoral: recentVisits.filter(v => v.category === 'pastoral').length,
        crisis: recentVisits.filter(v => v.category === 'crisis').length,
        discipleship: recentVisits.filter(v => v.category === 'discipleship').length,
        evangelism: recentVisits.filter(v => v.category === 'evangelism').length,
        administrative: recentVisits.filter(v => v.category === 'administrative').length,
        celebration: recentVisits.filter(v => v.category === 'celebration').length,
        bereavement: recentVisits.filter(v => v.category === 'bereavement').length
      };

      setReportData({
        monthly: monthlyStats,
        weekly: weeklyStats,
        categories
      });

    } catch (error) {
      console.error('Error loading report data:', error);
      Alert.alert('Error', 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const loadSyncStatus = async () => {
    try {
      const status = await syncService.getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('Error loading sync status:', error);
    }
  };

  const handleSyncToPastoralCarePro = async () => {
    try {
      setSyncStatus(prev => ({ ...prev, isSyncing: true }));
      
      const result = await syncService.syncToServer();
      
      if (result.success) {
        Alert.alert(
          'Sync Successful',
          `Synced ${result.synced?.visits || 0} visits, ${result.synced?.followups || 0} follow-ups to PastoralCare Pro`,
          [{ text: 'OK', onPress: () => {
            loadSyncStatus();
            loadReportData(); // Refresh data after sync
          }}]
        );
      } else {
        Alert.alert(
          'Sync Failed', 
          result.message || 'Failed to sync with PastoralCare Pro. Please check your connection.',
          [{ text: 'Retry', onPress: handleSyncToPastoralCarePro }, { text: 'Cancel' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Sync operation failed. Please try again.');
      console.error('Sync error:', error);
    } finally {
      setSyncStatus(prev => ({ ...prev, isSyncing: false }));
    }
  };

  const formatLastSync = (lastSync) => {
    if (!lastSync) return 'Never';
    
    const now = new Date();
    const syncDate = new Date(lastSync);
    const diffMs = now - syncDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading report data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>📈 Reports & Analytics</Text>

        {/* Sync Status Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🌐 PastoralCare Pro Sync</Text>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: syncStatus.isOnline ? '#27ae60' : '#e74c3c' }
            ]} />
          </View>
          
          <View style={styles.syncInfo}>
            <Text style={styles.syncLabel}>Last Sync: {formatLastSync(syncStatus.lastSync)}</Text>
            <Text style={styles.syncLabel}>Pending Visits: {syncStatus.pendingVisits}</Text>
            <Text style={styles.syncLabel}>Pending Follow-ups: {syncStatus.pendingFollowups}</Text>
            <Text style={styles.syncLabel}>Status: {syncStatus.isOnline ? 'Online' : 'Offline'}</Text>
          </View>

          {syncStatus.lastSyncError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {syncStatus.lastSyncError}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.syncButton,
              (syncStatus.isSyncing || !syncStatus.isOnline) && styles.syncButtonDisabled
            ]}
            onPress={handleSyncToPastoralCarePro}
            disabled={syncStatus.isSyncing || !syncStatus.isOnline}
          >
            {syncStatus.isSyncing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.syncButtonText}>
                🔄 Sync to PastoralCare Pro
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Monthly Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Monthly Summary (Last 30 Days)</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{reportData.monthly.visits}</Text>
              <Text style={styles.statLabel}>Total Visits</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{reportData.monthly.followups}</Text>
              <Text style={styles.statLabel}>Follow-ups</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{reportData.monthly.newMembers}</Text>
              <Text style={styles.statLabel}>Evangelism</Text>
            </View>
          </View>
        </View>

        {/* Weekly Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📅 This Week</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statsText}>Total Visits: {reportData.weekly.visits}</Text>
            <Text style={styles.statsText}>Ministry Hours: {reportData.weekly.hours.toFixed(1)}</Text>
          </View>
          
          <Text style={styles.subTitle}>Visit Types:</Text>
          <View style={styles.visitTypeGrid}>
            <View style={styles.visitTypeItem}>
              <Text style={styles.visitTypeValue}>{reportData.weekly.contactTypes.inPerson}</Text>
              <Text style={styles.visitTypeLabel}>In-Person</Text>
            </View>
            <View style={styles.visitTypeItem}>
              <Text style={styles.visitTypeValue}>{reportData.weekly.contactTypes.phone}</Text>
              <Text style={styles.visitTypeLabel}>Phone</Text>
            </View>
            <View style={styles.visitTypeItem}>
              <Text style={styles.visitTypeValue}>{reportData.weekly.contactTypes.video}</Text>
              <Text style={styles.visitTypeLabel}>Video</Text>
            </View>
            <View style={styles.visitTypeItem}>
              <Text style={styles.visitTypeValue}>{reportData.weekly.contactTypes.hospital}</Text>
              <Text style={styles.visitTypeLabel}>Hospital</Text>
            </View>
            <View style={styles.visitTypeItem}>
              <Text style={styles.visitTypeValue}>{reportData.weekly.contactTypes.home}</Text>
              <Text style={styles.visitTypeLabel}>Home</Text>
            </View>
            <View style={styles.visitTypeItem}>
              <Text style={styles.visitTypeValue}>{reportData.weekly.contactTypes.emergency}</Text>
              <Text style={styles.visitTypeLabel}>Emergency</Text>
            </View>
          </View>
        </View>

        {/* Category Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📋 Visit Categories (Monthly)</Text>
          <View style={styles.categoryList}>
            <View style={styles.categoryItem}>
              <Text style={styles.categoryLabel}>Pastoral Care</Text>
              <Text style={styles.categoryValue}>{reportData.categories.pastoral}</Text>
            </View>
            <View style={styles.categoryItem}>
              <Text style={styles.categoryLabel}>Crisis Support</Text>
              <Text style={styles.categoryValue}>{reportData.categories.crisis}</Text>
            </View>
            <View style={styles.categoryItem}>
              <Text style={styles.categoryLabel}>Discipleship</Text>
              <Text style={styles.categoryValue}>{reportData.categories.discipleship}</Text>
            </View>
            <View style={styles.categoryItem}>
              <Text style={styles.categoryLabel}>Evangelism</Text>
              <Text style={styles.categoryValue}>{reportData.categories.evangelism}</Text>
            </View>
            <View style={styles.categoryItem}>
              <Text style={styles.categoryLabel}>Administrative</Text>
              <Text style={styles.categoryValue}>{reportData.categories.administrative}</Text>
            </View>
            <View style={styles.categoryItem}>
              <Text style={styles.categoryLabel}>Celebration</Text>
              <Text style={styles.categoryValue}>{reportData.categories.celebration}</Text>
            </View>
            <View style={styles.categoryItem}>
              <Text style={styles.categoryLabel}>Bereavement</Text>
              <Text style={styles.categoryValue}>{reportData.categories.bereavement}</Text>
            </View>
          </View>
        </View>

        {/* Integration Info */}
        <View style={styles.integrationNotice}>
          <Text style={styles.integrationTitle}>🔗 PastoralCare Pro Integration</Text>
          <Text style={styles.integrationText}>
            This app automatically syncs your visit data with PastoralCare Pro for conference reporting and advanced analytics. All data is encrypted and securely transmitted.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34495e',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  syncInfo: {
    marginBottom: 15,
  },
  syncLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  errorContainer: {
    backgroundColor: '#fdedec',
    borderRadius: 4,
    padding: 8,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 12,
    color: '#e74c3c',
  },
  syncButton: {
    backgroundColor: '#27ae60',
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
  },
  syncButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  statsRow: {
    marginBottom: 15,
  },
  statsText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34495e',
    marginTop: 10,
    marginBottom: 10,
  },
  visitTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  visitTypeItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 10,
  },
  visitTypeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3498db',
  },
  visitTypeLabel: {
    fontSize: 11,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  categoryList: {
    
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  categoryLabel: {
    fontSize: 14,
    color: '#34495e',
  },
  categoryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3498db',
  },
  integrationNotice: {
    backgroundColor: '#e8f4fd',
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  integrationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  integrationText: {
    fontSize: 12,
    color: '#7f8c8d',
    lineHeight: 16,
  },
});