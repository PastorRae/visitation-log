import { registerRootComponent } from "expo";
import React, { useState } from 'react';
import { ActivityIndicator, View, Text, Platform, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Dashboard Screen with mock data and improved layout
function DashboardScreen() {
  const [stats, setStats] = React.useState({
    totalVisits: 25,
    thisWeekVisits: 7,
    pendingFollowups: 3,
    totalMembers: 45
  });

  // Card styling
  const cardStyle = {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    margin: 5,
    minWidth: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  };

  const cardTitleStyle = {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
    textAlign: 'center'
  };

  const cardValueStyle = {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50'
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#2c3e50' }}>
          📋 Visitation Log
        </Text>
        
        {/* Stats Cards */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 }}>
          <View style={cardStyle}>
            <Text style={cardTitleStyle}>Total Visits</Text>
            <Text style={cardValueStyle}>{stats.totalVisits}</Text>
          </View>
          <View style={cardStyle}>
            <Text style={cardTitleStyle}>This Week</Text>
            <Text style={cardValueStyle}>{stats.thisWeekVisits}</Text>
          </View>
          <View style={cardStyle}>
            <Text style={cardTitleStyle}>Follow-ups</Text>
            <Text style={cardValueStyle}>{stats.pendingFollowups}</Text>
          </View>
          <View style={cardStyle}>
            <Text style={cardTitleStyle}>Members</Text>
            <Text style={cardValueStyle}>{stats.totalMembers}</Text>
          </View>
        </View>

        {/* Recent Activity */}
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#34495e' }}>
          Recent Activity
        </Text>
        <View style={{ backgroundColor: '#fff', borderRadius: 8, padding: 15, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
          <Text style={{ color: '#7f8c8d', fontSize: 14, lineHeight: 20 }}>
            • Visited John Smith - Pastoral Care{'\n'}
            • Phone call with Mary Johnson - Follow-up{'\n'}
            • Hospital visit - Emergency Care{'\n'}
            • Home visit - Discipleship
          </Text>
        </View>

        {/* Quick Actions */}
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#34495e' }}>
          Quick Actions
        </Text>
        <View style={{ backgroundColor: '#fff', borderRadius: 8, padding: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
          <Text style={{ color: '#3498db', fontSize: 16, marginBottom: 12, padding: 8, backgroundColor: '#ecf0f1', borderRadius: 4 }}>
            + Log New Visit
          </Text>
          <Text style={{ color: '#e74c3c', fontSize: 16, marginBottom: 12, padding: 8, backgroundColor: '#ecf0f1', borderRadius: 4 }}>
            ⚡ View Pending Follow-ups
          </Text>
          <Text style={{ color: '#27ae60', fontSize: 16, padding: 8, backgroundColor: '#ecf0f1', borderRadius: 4 }}>
            📊 Generate Report
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function VisitsScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#2c3e50' }}>
          👥 Visit History
        </Text>

        {/* Mock visit data */}
        {[
          { id: 1, member: 'John Smith', date: '2025-09-25', type: 'In-Person', category: 'Pastoral Care', status: 'Completed' },
          { id: 2, member: 'Mary Johnson', date: '2025-09-24', type: 'Phone', category: 'Follow-up', status: 'Follow-up Required' },
          { id: 3, member: 'David Wilson', date: '2025-09-23', type: 'Hospital', category: 'Emergency', status: 'Completed' }
        ].map((visit) => (
          <View key={visit.id} style={{ backgroundColor: '#fff', borderRadius: 8, padding: 15, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2c3e50' }}>{visit.member}</Text>
              <Text style={{ fontSize: 12, color: visit.status === 'Completed' ? '#27ae60' : '#e74c3c', backgroundColor: visit.status === 'Completed' ? '#d5f4e6' : '#fdeaea', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
                {visit.status}
              </Text>
            </View>
            <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 4 }}>
              {visit.date} • {visit.type} • {visit.category}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function LogVisitScreen() {
  const [formData, setFormData] = useState({
    visiteeType: 'member', // 'member' or 'non_member'
    churchId: 'slc-bb-main',
    memberName: '',
    nonMemberName: '',
    visitType: 'in_person',
    category: 'pastoral',
    comments: ''
  });

  const visitTypes = [
    { value: 'in_person', label: 'In-Person' },
    { value: 'phone', label: 'Phone Call' },
    { value: 'video', label: 'Video Call' },
    { value: 'hospital', label: 'Hospital' },
    { value: 'home', label: 'Home Visit' },
    { value: 'emergency', label: 'Emergency' }
  ];

  const categories = [
    { value: 'pastoral', label: 'Pastoral Care' },
    { value: 'crisis', label: 'Crisis Support' },
    { value: 'discipleship', label: 'Discipleship' },
    { value: 'evangelism', label: 'Evangelism' },
    { value: 'administrative', label: 'Administrative' },
    { value: 'celebration', label: 'Celebration' },
    { value: 'bereavement', label: 'Bereavement' }
  ];

  // Mock church data (to be imported from PastoralCare Pro later)
  const churches = [
    { id: 'slc-bb-main', name: 'South Leeward Conference - Barbados' },
    { id: 'slc-bb-north', name: 'North District Church' },
    { id: 'slc-bb-south', name: 'South District Church' },
    { id: 'slc-bb-central', name: 'Central District Church' }
  ];

  // Mock member data (to be imported from PastoralCare Pro later)
  const members = [
    { id: 'member-1', name: 'John Smith', church: 'slc-bb-main' },
    { id: 'member-2', name: 'Mary Johnson', church: 'slc-bb-main' },
    { id: 'member-3', name: 'David Wilson', church: 'slc-bb-north' },
    { id: 'member-4', name: 'Sarah Brown', church: 'slc-bb-south' }
  ];

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    alert('Visit logged successfully!');
    // Reset form
    setFormData({
      visiteeType: 'member',
      churchId: 'slc-bb-main',
      memberName: '',
      nonMemberName: '',
      visitType: 'in_person',
      category: 'pastoral',
      comments: ''
    });
  };

  const inputStyle = {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15
  };

  const buttonStyle = {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10
  };

  const pickerStyle = {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#2c3e50' }}>
          ✏️ Log New Visit
        </Text>

        {/* Church Selection */}
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#34495e' }}>
          Church
        </Text>
        <View style={pickerStyle}>
          <Text>{churches.find(church => church.id === formData.churchId)?.name}</Text>
        </View>

        {/* PastoralCare Pro Integration Notice */}
        <View style={{ backgroundColor: '#e8f4fd', borderRadius: 8, padding: 12, marginBottom: 15, borderLeftWidth: 4, borderLeftColor: '#3498db' }}>
          <Text style={{ fontSize: 12, color: '#2c3e50', fontStyle: 'italic' }}>
            💡 Church and member lists will be automatically imported from PastoralCare Pro when integration is completed.
          </Text>
        </View>

        {/* Visitee Type Selection */}
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#34495e' }}>
          Visit Type (Person)
        </Text>
        <View style={{ flexDirection: 'row', marginBottom: 15 }}>
          <TouchableOpacity 
            style={[
              { flex: 1, padding: 12, borderRadius: 6, marginRight: 5, borderWidth: 1, alignItems: 'center' },
              formData.visiteeType === 'member' 
                ? { backgroundColor: '#3498db', borderColor: '#3498db' }
                : { backgroundColor: '#fff', borderColor: '#3498db' }
            ]}
            onPress={() => setFormData({...formData, visiteeType: 'member'})}
          >
            <Text style={[
              { textAlign: 'center', fontWeight: 'bold' },
              formData.visiteeType === 'member' ? { color: '#fff' } : { color: '#3498db' }
            ]}>
              Member
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              { flex: 1, padding: 12, borderRadius: 6, marginLeft: 5, borderWidth: 1, alignItems: 'center' },
              formData.visiteeType === 'non_member' 
                ? { backgroundColor: '#3498db', borderColor: '#3498db' }
                : { backgroundColor: '#fff', borderColor: '#3498db' }
            ]}
            onPress={() => setFormData({...formData, visiteeType: 'non_member'})}
          >
            <Text style={[
              { textAlign: 'center', fontWeight: 'bold' },
              formData.visiteeType === 'non_member' ? { color: '#fff' } : { color: '#3498db' }
            ]}>
              Non-Member
            </Text>
          </TouchableOpacity>
        </View>

        {/* Member/Non-Member Selection */}
        {formData.visiteeType === 'member' ? (
          <>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#34495e' }}>
              Select Member
            </Text>
            <TouchableOpacity style={pickerStyle}
              onPress={() => alert('Member list from PastoralCare Pro will be implemented')}
            >
              <Text>
                {formData.memberName || 'Tap to select from member list...'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#34495e' }}>
              Non-Member Name
            </Text>
            <TextInput 
              style={inputStyle}
              placeholder="Enter non-member name"
              value={formData.nonMemberName}
              onChangeText={(text) => setFormData({...formData, nonMemberName: text})}
            />
          </>
        )}

        {/* Visit Type Selection */}
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#34495e' }}>
          Visit Type
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 }}>
          {visitTypes.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                { 
                  padding: 10, 
                  margin: 4, 
                  borderRadius: 6, 
                  borderWidth: 1,
                  minWidth: '30%',
                  alignItems: 'center'
                },
                formData.visitType === type.value 
                  ? { backgroundColor: '#3498db', borderColor: '#3498db' }
                  : { backgroundColor: '#fff', borderColor: '#3498db' }
              ]}
              onPress={() => setFormData({...formData, visitType: type.value})}
            >
              <Text 
                style={[
                  { fontSize: 12, fontWeight: 'bold' },
                  formData.visitType === type.value 
                    ? { color: '#fff' }
                    : { color: '#3498db' }
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Category Selection */}
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#34495e' }}>
          Category
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 }}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.value}
              style={[
                { 
                  padding: 10, 
                  margin: 4, 
                  borderRadius: 6, 
                  borderWidth: 1,
                  minWidth: '28%',
                  alignItems: 'center'
                },
                formData.category === category.value 
                  ? { backgroundColor: '#27ae60', borderColor: '#27ae60' }
                  : { backgroundColor: '#fff', borderColor: '#27ae60' }
              ]}
              onPress={() => setFormData({...formData, category: category.value})}
            >
              <Text 
                style={[
                  { fontSize: 11, fontWeight: 'bold', textAlign: 'center' },
                  formData.category === category.value 
                    ? { color: '#fff' }
                    : { color: '#27ae60' }
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Comments */}
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#34495e' }}>
          Comments/Notes
        </Text>
        <TextInput 
          style={[inputStyle, { height: 100, textAlignVertical: 'top' }]}
          multiline
          numberOfLines={4}
          placeholder="Enter visit details, prayer requests, etc."
          value={formData.comments}
          onChangeText={(text) => setFormData({...formData, comments: text})}
        />

        {/* Additional Fields */}
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#34495e' }}>
          Additional Options
        </Text>
        <View style={{ backgroundColor: '#fff', borderRadius: 8, padding: 15, marginBottom: 20 }}>
          <Text style={{ color: '#7f8c8d', fontSize: 14, marginBottom: 8 }}>
            📍 Add Location
          </Text>
          <Text style={{ color: '#7f8c8d', fontSize: 14, marginBottom: 8 }}>
            📖 Scripture References
          </Text>
          <Text style={{ color: '#7f8c8d', fontSize: 14, marginBottom: 8 }}>
            🎤 Voice Recording
          </Text>
          <Text style={{ color: '#7f8c8d', fontSize: 14 }}>
            📅 Schedule Follow-up
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={buttonStyle}
          onPress={handleSubmit}
        >
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
            Save Visit Log
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function ReportsScreen() {
  const [reportData, setReportData] = useState({
    monthly: {
      visits: 25,
      followups: 8,
      newMembers: 3
    },
    weekly: {
      visits: 7,
      hours: 12.5,
      contactTypes: {
        inPerson: 4,
        phone: 2,
        video: 1
      }
    }
  });

  const cardStyle = {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#2c3e50' }}>
          📈 Reports & Analytics
        </Text>

        {/* Monthly Summary */}
        <View style={cardStyle}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#34495e' }}>
            📊 Monthly Summary
          </Text>
          <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 8 }}>
            Visits: {reportData.monthly.visits}
          </Text>
          <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 8 }}>
            Follow-ups: {reportData.monthly.followups}
          </Text>
          <Text style={{ fontSize: 14, color: '#7f8c8d' }}>
            New Members: {reportData.monthly.newMembers}
          </Text>
        </View>

        {/* Weekly Breakdown */}
        <View style={cardStyle}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#34495e' }}>
            📅 This Week
          </Text>
          <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 8 }}>
            Total Visits: {reportData.weekly.visits}
          </Text>
          <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 8 }}>
            Ministry Hours: {reportData.weekly.hours}
          </Text>
          <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 8 }}>
            In-Person: {reportData.weekly.contactTypes.inPerson} | Phone: {reportData.weekly.contactTypes.phone} | Video: {reportData.weekly.contactTypes.video}
          </Text>
        </View>

        {/* PastoralCare Pro Integration */}
        <View style={cardStyle}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#34495e' }}>
            🌐 PastoralCare Pro Integration
          </Text>
          <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 15 }}>
            Sync your visit data with PastoralCare Pro for advanced analytics and conference reporting.
          </Text>
          <View style={{ backgroundColor: '#ecf0f1', borderRadius: 6, padding: 12, marginBottom: 15 }}>
            <Text style={{ fontSize: 14, color: '#2c3e50', marginBottom: 8 }}>
              🔄 Sync Features:
            </Text>
            <Text style={{ fontSize: 12, color: '#7f8c8d', marginBottom: 4 }}>
              • Real-time visit data synchronization
            </Text>
            <Text style={{ fontSize: 12, color: '#7f8c8d', marginBottom: 4 }}>
              • Conference dashboard integration
            </Text>
            <Text style={{ fontSize: 12, color: '#7f8c8d', marginBottom: 4 }}>
              • Automated KPI reporting
            </Text>
            <Text style={{ fontSize: 12, color: '#7f8c8d' }}>
              • Cross-device data access
            </Text>
          </View>
          <Text style={{ 
            backgroundColor: '#27ae60', 
            color: '#fff', 
            padding: 12, 
            borderRadius: 6, 
            fontSize: 16,
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            🔄 Sync to PastoralCare Pro
          </Text>
        </View>

        {/* KPI Dashboard */}
        <View style={cardStyle}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#34495e' }}>
            🎯 Key Performance Indicators
          </Text>
          <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 8 }}>
            Community Service Hours: 45/60 (Target)
          </Text>
          <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 8 }}>
            Small Groups: 3/5 (Target)
          </Text>
          <Text style={{ fontSize: 14, color: '#7f8c8d' }}>
            Digital Evangelism Reach: 250/300 (Target)
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function SettingsScreen() {
  const [settings, setSettings] = useState({
    pastoralCareProConnected: false,
    autoSync: true,
    biometricAuth: false,
    notificationsEnabled: true,
    customVisitTypes: [],
    customCategories: []
  });

  const cardStyle = {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  };

  const defaultVisitTypes = [
    { value: 'in_person', label: 'In-Person', enabled: true },
    { value: 'phone', label: 'Phone Call', enabled: true },
    { value: 'video', label: 'Video Call', enabled: true },
    { value: 'hospital', label: 'Hospital', enabled: true },
    { value: 'home', label: 'Home Visit', enabled: true },
    { value: 'emergency', label: 'Emergency', enabled: true }
  ];

  const defaultCategories = [
    { value: 'pastoral', label: 'Pastoral Care', enabled: true },
    { value: 'crisis', label: 'Crisis Support', enabled: true },
    { value: 'discipleship', label: 'Discipleship', enabled: true },
    { value: 'evangelism', label: 'Evangelism', enabled: true },
    { value: 'administrative', label: 'Administrative', enabled: true },
    { value: 'celebration', label: 'Celebration', enabled: true },
    { value: 'bereavement', label: 'Bereavement', enabled: true }
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#2c3e50' }}>
          ⚙️ Settings & Configuration
        </Text>

        {/* PastoralCare Pro Connection */}
        <View style={cardStyle}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#34495e' }}>
            🌐 PastoralCare Pro Connection
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text style={{ fontSize: 14, color: '#7f8c8d' }}>
              Status: {settings.pastoralCareProConnected ? '✅ Connected' : '❌ Not Connected'}
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: settings.pastoralCareProConnected ? '#e74c3c' : '#3498db',
                padding: 8,
                borderRadius: 6
              }}
              onPress={() => {
                if (settings.pastoralCareProConnected) {
                  // Disconnect logic
                  setSettings({...settings, pastoralCareProConnected: false});
                } else {
                  // Connect logic - would open authentication flow
                  alert('PastoralCare Pro authentication flow would open here');
                }
              }}
            >
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>
                {settings.pastoralCareProConnected ? 'Disconnect' : 'Connect'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={{ fontSize: 12, color: '#7f8c8d', marginBottom: 10 }}>
            Connect to sync churches, members, and visit data with PastoralCare Pro for conference reporting.
          </Text>
        </View>

        {/* App Preferences */}
        <View style={cardStyle}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#34495e' }}>
            📱 App Preferences
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
            <Text style={{ fontSize: 14, color: '#34495e' }}>Auto-sync when online</Text>
            <TouchableOpacity
              style={{
                width: 50,
                height: 30,
                borderRadius: 15,
                backgroundColor: settings.autoSync ? '#27ae60' : '#bdc3c7',
                justifyContent: 'center',
                alignItems: settings.autoSync ? 'flex-end' : 'flex-start',
                paddingHorizontal: 3
              }}
              onPress={() => setSettings({...settings, autoSync: !settings.autoSync})}
            >
              <View style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: '#fff'
              }} />
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
            <Text style={{ fontSize: 14, color: '#34495e' }}>Biometric authentication</Text>
            <TouchableOpacity
              style={{
                width: 50,
                height: 30,
                borderRadius: 15,
                backgroundColor: settings.biometricAuth ? '#27ae60' : '#bdc3c7',
                justifyContent: 'center',
                alignItems: settings.biometricAuth ? 'flex-end' : 'flex-start',
                paddingHorizontal: 3
              }}
              onPress={() => setSettings({...settings, biometricAuth: !settings.biometricAuth})}
            >
              <View style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: '#fff'
              }} />
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: '#34495e' }}>Push notifications</Text>
            <TouchableOpacity
              style={{
                width: 50,
                height: 30,
                borderRadius: 15,
                backgroundColor: settings.notificationsEnabled ? '#27ae60' : '#bdc3c7',
                justifyContent: 'center',
                alignItems: settings.notificationsEnabled ? 'flex-end' : 'flex-start',
                paddingHorizontal: 3
              }}
              onPress={() => setSettings({...settings, notificationsEnabled: !settings.notificationsEnabled})}
            >
              <View style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: '#fff'
              }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Visit Types Configuration */}
        <View style={cardStyle}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#34495e' }}>
            📝 Visit Types Configuration
          </Text>
          <Text style={{ fontSize: 12, color: '#7f8c8d', marginBottom: 15 }}>
            Enable/disable visit types that appear in the Log Visit screen
          </Text>
          {defaultVisitTypes.map((type, index) => (
            <View key={type.value} style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: index === defaultVisitTypes.length - 1 ? 0 : 10,
              paddingVertical: 5
            }}>
              <Text style={{ fontSize: 14, color: '#34495e' }}>{type.label}</Text>
              <TouchableOpacity
                style={{
                  width: 40,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: type.enabled ? '#3498db' : '#bdc3c7',
                  justifyContent: 'center',
                  alignItems: type.enabled ? 'flex-end' : 'flex-start',
                  paddingHorizontal: 2
                }}
                onPress={() => {
                  // In a real app, this would update the configuration
                  alert(`${type.label} ${type.enabled ? 'disabled' : 'enabled'}`);
                }}
              >
                <View style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: '#fff'
                }} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Categories Configuration */}
        <View style={cardStyle}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#34495e' }}>
            📋 Categories Configuration
          </Text>
          <Text style={{ fontSize: 12, color: '#7f8c8d', marginBottom: 15 }}>
            Enable/disable categories that appear in the Log Visit screen
          </Text>
          {defaultCategories.map((category, index) => (
            <View key={category.value} style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: index === defaultCategories.length - 1 ? 0 : 10,
              paddingVertical: 5
            }}>
              <Text style={{ fontSize: 14, color: '#34495e' }}>{category.label}</Text>
              <TouchableOpacity
                style={{
                  width: 40,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: category.enabled ? '#27ae60' : '#bdc3c7',
                  justifyContent: 'center',
                  alignItems: category.enabled ? 'flex-end' : 'flex-start',
                  paddingHorizontal: 2
                }}
                onPress={() => {
                  // In a real app, this would update the configuration
                  alert(`${category.label} ${category.enabled ? 'disabled' : 'enabled'}`);
                }}
              >
                <View style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: '#fff'
                }} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Data Management */}
        <View style={cardStyle}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#34495e' }}>
            💾 Data Management
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: '#3498db',
              padding: 12,
              borderRadius: 6,
              marginBottom: 10
            }}
            onPress={() => alert('Manual sync with PastoralCare Pro initiated')}
          >
            <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>
              🔄 Sync with PastoralCare Pro
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              backgroundColor: '#f39c12',
              padding: 12,
              borderRadius: 6,
              marginBottom: 10
            }}
            onPress={() => alert('Export functionality would create a backup')}
          >
            <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>
              📤 Export Local Data
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              backgroundColor: '#e74c3c',
              padding: 12,
              borderRadius: 6
            }}
            onPress={() => alert('Clear data confirmation dialog would appear')}
          >
            <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>
              🗑️ Clear All Local Data
            </Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={cardStyle}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#34495e' }}>
            ℹ️ App Information
          </Text>
          <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 5 }}>
            Version: 1.0.0
          </Text>
          <Text style={{ fontSize: 14, color: '#7f8c8d', marginBottom: 5 }}>
            Built for: East Caribbean Conference (Barbados)
          </Text>
          <Text style={{ fontSize: 14, color: '#7f8c8d' }}>
            Integrated with: PastoralCare Pro
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

// Create Tab Navigator
const Tab = createBottomTabNavigator();

// Safe Navigation Component
function SafeTabs() {
  return (
    <Tab.Navigator 
      screenOptions={{ 
        headerShown: true,
        tabBarActiveTintColor: '#1976d2',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          paddingBottom: 10,
          paddingTop: 8,
          height: 70,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0'
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 4
        }
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ title: '📊 Dashboard' }}
      />
      <Tab.Screen 
        name="Visits" 
        component={VisitsScreen}
        options={{ title: '👥 Visits' }}
      />
      <Tab.Screen 
        name="LogVisit" 
        component={LogVisitScreen}
        options={{ title: '✏️ Log Visit' }}
      />
      <Tab.Screen 
        name="Reports" 
        component={ReportsScreen}
        options={{ title: '📈 Reports' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: '⚙️ Settings' }}
      />
    </Tab.Navigator>
  );
}

// Main App Component
function VisitationApp() {
  return (
    <NavigationContainer>
      <SafeTabs />
    </NavigationContainer>
  );
}

registerRootComponent(VisitationApp);
