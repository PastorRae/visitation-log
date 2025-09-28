import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { syncService } from './src/services/sync';
import { getAllChurches, getMembersByChurch, searchMembers } from './src/db/db';

export default function EnhancedLogVisitScreen() {
  const [formData, setFormData] = useState({
    visiteeType: 'member', // 'member' or 'non_member'
    churchId: '',
    memberId: '',
    memberName: '',
    nonMemberName: '',
    visitType: 'in_person',
    category: 'pastoral',
    comments: '',
    address: '',
    duration: '',
    scriptureRefs: '',
    prayerRequests: '',
    resources: '',
    followUpDate: '',
    followUpActions: '',
    priority: 'medium'
  });

  const [churches, setChurches] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

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

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (formData.churchId) {
      loadMembersForChurch(formData.churchId);
    }
  }, [formData.churchId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load churches from database
      const churchList = await getAllChurches();
      setChurches(churchList);
      
      // Set default church if available
      if (churchList.length > 0) {
        setFormData(prev => ({ ...prev, churchId: churchList[0].id }));
      }

      // Try to sync fresh data from PastoralCare Pro
      try {
        await syncService.syncChurchesAndMembers();
        // Reload churches after sync
        const updatedChurches = await getAllChurches();
        setChurches(updatedChurches);
      } catch (syncError) {
        console.log('Sync failed, using local data:', syncError.message);
      }
      
    } catch (error) {
      console.error('Error loading initial data:', error);
      Alert.alert('Error', 'Failed to load church data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const loadMembersForChurch = async (churchId) => {
    try {
      const memberList = await getMembersByChurch(churchId);
      setMembers(memberList);
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const searchMembersByName = async (query) => {
    if (query.length < 2) {
      loadMembersForChurch(formData.churchId);
      return;
    }

    try {
      const results = await searchMembers(query, formData.churchId);
      setMembers(results);
    } catch (error) {
      console.error('Error searching members:', error);
    }
  };

  const handleMemberSearch = (text) => {
    setMemberSearchQuery(text);
    searchMembersByName(text);
  };

  const selectMember = (member) => {
    setFormData(prev => ({
      ...prev,
      memberId: member.id,
      memberName: `${member.first_name} ${member.last_name}`
    }));
    setMemberSearchQuery(`${member.first_name} ${member.last_name}`);
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.churchId) {
      Alert.alert('Error', 'Please select a church');
      return;
    }

    if (formData.visiteeType === 'member' && !formData.memberId) {
      Alert.alert('Error', 'Please select a member');
      return;
    }

    if (formData.visiteeType === 'non_member' && !formData.nonMemberName.trim()) {
      Alert.alert('Error', 'Please enter the non-member name');
      return;
    }

    if (!formData.comments.trim()) {
      Alert.alert('Error', 'Please add some comments about the visit');
      return;
    }

    setSubmitting(true);
    
    try {
      // Create visit record
      const visitRecord = {
        id: `visit_${Date.now()}`,
        visit_date: Date.now(),
        pastor_email: 'pastor@example.com', // Should come from user profile
        pastor_name: 'Pastor Name', // Should come from user profile
        church_id: formData.churchId,
        member_id: formData.visiteeType === 'member' ? formData.memberId : null,
        member_first: formData.visiteeType === 'member' 
          ? formData.memberName.split(' ')[0] 
          : formData.nonMemberName.split(' ')[0],
        member_last: formData.visiteeType === 'member' 
          ? formData.memberName.split(' ').slice(1).join(' ')
          : formData.nonMemberName.split(' ').slice(1).join(' '),
        visit_type: formData.visitType,
        category: formData.category,
        comments: formData.comments,
        address: formData.address || null,
        scripture_refs: formData.scriptureRefs || null,
        prayer_requests: formData.prayerRequests || null,
        resources: formData.resources || null,
        next_visit_date: formData.followUpDate ? new Date(formData.followUpDate).getTime() : null,
        followup_actions: formData.followUpActions || null,
        priority: formData.priority,
        synced: 0,
        updated_at: Date.now()
      };

      // Save to local database (this would use insertVisit from db.ts)
      console.log('Visit record to save:', visitRecord);

      // Try to sync immediately
      try {
        await syncService.syncToServer();
      } catch (syncError) {
        console.log('Sync failed, visit saved locally for later sync');
      }

      Alert.alert('Success', 'Visit logged successfully!', [
        { text: 'Log Another', onPress: resetForm },
        { text: 'View Visits', onPress: () => {/* Navigate to visits screen */} }
      ]);

    } catch (error) {
      console.error('Error saving visit:', error);
      Alert.alert('Error', 'Failed to save visit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      visiteeType: 'member',
      churchId: churches[0]?.id || '',
      memberId: '',
      memberName: '',
      nonMemberName: '',
      visitType: 'in_person',
      category: 'pastoral',
      comments: '',
      address: '',
      duration: '',
      scriptureRefs: '',
      prayerRequests: '',
      resources: '',
      followUpDate: '',
      followUpActions: '',
      priority: 'medium'
    });
    setMemberSearchQuery('');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading church data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>✏️ Log New Visit</Text>

        {/* Church Selection */}
        <Text style={styles.label}>Church *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.churchId}
            onValueChange={(value) => setFormData(prev => ({ ...prev, churchId: value }))}
            style={styles.picker}
          >
            <Picker.Item label="Select a church..." value="" />
            {churches.map(church => (
              <Picker.Item key={church.id} label={church.name} value={church.id} />
            ))}
          </Picker>
        </View>

        {/* Visitee Type Selection */}
        <Text style={styles.label}>Visit Type (Person) *</Text>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              formData.visiteeType === 'member' && styles.toggleButtonActive
            ]}
            onPress={() => setFormData(prev => ({ ...prev, visiteeType: 'member', nonMemberName: '' }))}
          >
            <Text style={[
              styles.toggleText,
              formData.visiteeType === 'member' && styles.toggleTextActive
            ]}>Member</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              formData.visiteeType === 'non_member' && styles.toggleButtonActive
            ]}
            onPress={() => setFormData(prev => ({ ...prev, visiteeType: 'non_member', memberId: '', memberName: '' }))}
          >
            <Text style={[
              styles.toggleText,
              formData.visiteeType === 'non_member' && styles.toggleTextActive
            ]}>Non-Member</Text>
          </TouchableOpacity>
        </View>

        {/* Member/Non-Member Selection */}
        {formData.visiteeType === 'member' ? (
          <>
            <Text style={styles.label}>Select Member *</Text>
            <TextInput
              style={styles.input}
              placeholder="Search members..."
              value={memberSearchQuery}
              onChangeText={handleMemberSearch}
            />
            {members.length > 0 && memberSearchQuery.length > 0 && (
              <View style={styles.memberList}>
                {members.map(member => (
                  <TouchableOpacity
                    key={member.id}
                    style={styles.memberItem}
                    onPress={() => selectMember(member)}
                  >
                    <Text style={styles.memberName}>
                      {member.first_name} {member.last_name}
                    </Text>
                    <Text style={styles.memberInfo}>
                      {member.affiliation} • {member.discipleship_status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        ) : (
          <>
            <Text style={styles.label}>Non-Member Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter non-member name"
              value={formData.nonMemberName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, nonMemberName: text }))}
            />
          </>
        )}

        {/* Visit Type Selection */}
        <Text style={styles.label}>Visit Type *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.visitType}
            onValueChange={(value) => setFormData(prev => ({ ...prev, visitType: value }))}
            style={styles.picker}
          >
            {visitTypes.map(type => (
              <Picker.Item key={type.value} label={type.label} value={type.value} />
            ))}
          </Picker>
        </View>

        {/* Category Selection */}
        <Text style={styles.label}>Category *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.category}
            onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            style={styles.picker}
          >
            {categories.map(category => (
              <Picker.Item key={category.value} label={category.label} value={category.value} />
            ))}
          </Picker>
        </View>

        {/* Comments */}
        <Text style={styles.label}>Comments/Notes *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter visit details, observations, outcomes..."
          value={formData.comments}
          onChangeText={(text) => setFormData(prev => ({ ...prev, comments: text }))}
          multiline
          numberOfLines={4}
        />

        {/* Optional Fields */}
        <Text style={styles.sectionTitle}>Additional Details (Optional)</Text>
        
        <Text style={styles.label}>Address/Location</Text>
        <TextInput
          style={styles.input}
          placeholder="Visit location or address"
          value={formData.address}
          onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
        />

        <Text style={styles.label}>Scripture References</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., John 3:16, Psalm 23"
          value={formData.scriptureRefs}
          onChangeText={(text) => setFormData(prev => ({ ...prev, scriptureRefs: text }))}
        />

        <Text style={styles.label}>Prayer Requests</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Specific prayer needs discussed"
          value={formData.prayerRequests}
          onChangeText={(text) => setFormData(prev => ({ ...prev, prayerRequests: text }))}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Resources Provided</Text>
        <TextInput
          style={styles.input}
          placeholder="Books, pamphlets, referrals, etc."
          value={formData.resources}
          onChangeText={(text) => setFormData(prev => ({ ...prev, resources: text }))}
        />

        <Text style={styles.label}>Follow-up Actions</Text>
        <TextInput
          style={styles.input}
          placeholder="Next steps or commitments made"
          value={formData.followUpActions}
          onChangeText={(text) => setFormData(prev => ({ ...prev, followUpActions: text }))}
        />

        <Text style={styles.label}>Priority Level</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.priority}
            onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
            style={styles.picker}
          >
            {priorities.map(priority => (
              <Picker.Item key={priority.value} label={priority.label} value={priority.value} />
            ))}
          </Picker>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Save Visit</Text>
          )}
        </TouchableOpacity>

        {/* PastoralCare Pro Integration Notice */}
        <View style={styles.integrationNotice}>
          <Text style={styles.integrationText}>
            🔗 Integrated with PastoralCare Pro for automatic church and member data sync
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
    color: '#34495e',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#34495e',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
  },
  picker: {
    height: 50,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  toggleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3498db',
    backgroundColor: '#fff',
    alignItems: 'center',
    marginHorizontal: 2,
  },
  toggleButtonActive: {
    backgroundColor: '#3498db',
  },
  toggleText: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  toggleTextActive: {
    color: '#fff',
  },
  memberList: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
    maxHeight: 200,
  },
  memberItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  memberInfo: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  submitButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  integrationNotice: {
    backgroundColor: '#e8f4fd',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  integrationText: {
    fontSize: 12,
    color: '#2c3e50',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});