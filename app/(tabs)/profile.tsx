import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Modal, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Mail, School, GraduationCap, LogOut, Shield, Edit3, BookOpen, Users, Award } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/auth-store';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import { SUBJECT_OPTIONS, GRADE_OPTIONS } from '@/types/worksheet';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    school: user?.profile?.school || '',
    bio: user?.profile?.bio || '',
    experience: user?.profile?.experience?.toString() || '',
    subjects: user?.profile?.subjects || [],
    grades: user?.profile?.grades || [],
    qualifications: user?.profile?.qualifications || [],
  });
  const [newQualification, setNewQualification] = useState('');

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return COLORS.success;
      case 'pending':
        return COLORS.warning;
      case 'rejected':
        return COLORS.error;
      default:
        return COLORS.text.secondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'pending':
        return 'Pending Approval';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <User size={48} color={COLORS.primary} />
            </View>
            <Text style={styles.name}>
              {user?.firstName} {user?.lastName}
            </Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(user?.status || '') + '20' }
            ]}>
              <Shield size={16} color={getStatusColor(user?.status || '')} />
              <Text style={[
                styles.statusText,
                { color: getStatusColor(user?.status || '') }
              ]}>
                {getStatusText(user?.status || '')}
              </Text>
            </View>
          </View>
        </Card>

        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <View style={styles.infoItem}>
            <Mail size={20} color={COLORS.text.secondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <GraduationCap size={20} color={COLORS.text.secondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Role</Text>
              <Text style={styles.infoValue}>
                {user?.role === 'teacher' ? 'Teacher' : 'Administrator'}
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <School size={20} color={COLORS.text.secondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Member Since</Text>
              <Text style={styles.infoValue}>
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </Text>
            </View>
          </View>
        </Card>

        <Card style={styles.profileDetailsCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Teaching Profile</Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => setIsEditModalVisible(true)}
            >
              <Edit3 size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.infoItem}>
            <School size={20} color={COLORS.text.secondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>School</Text>
              <Text style={styles.infoValue}>
                {user?.profile?.school || 'Not specified'}
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <BookOpen size={20} color={COLORS.text.secondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Subjects</Text>
              <Text style={styles.infoValue}>
                {user?.profile?.subjects?.join(', ') || 'Not specified'}
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Users size={20} color={COLORS.text.secondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Grades</Text>
              <Text style={styles.infoValue}>
                {user?.profile?.grades?.join(', ') || 'Not specified'}
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Award size={20} color={COLORS.text.secondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Experience</Text>
              <Text style={styles.infoValue}>
                {user?.profile?.experience ? `${user.profile.experience} years` : 'Not specified'}
              </Text>
            </View>
          </View>

          {user?.profile?.bio && (
            <View style={styles.bioSection}>
              <Text style={styles.infoLabel}>About Me</Text>
              <Text style={styles.bioText}>{user.profile.bio}</Text>
            </View>
          )}

          {user?.profile?.qualifications && user.profile.qualifications.length > 0 && (
            <View style={styles.qualificationsSection}>
              <Text style={styles.infoLabel}>Qualifications</Text>
              {user.profile.qualifications.map((qual, index) => (
                <Text key={index} style={styles.qualificationItem}>• {qual}</Text>
              ))}
            </View>
          )}
        </Card>

        <Card style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          
          <Button
            title="Sign Out"
            onPress={handleLogout}
            variant="outline"
            style={styles.logoutButton}
          />
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            TurboTask Scholar v1.0.0
          </Text>
          <Text style={styles.footerText}>
            AI-Powered Worksheet Generation
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <Button
              title="✕"
              onPress={() => setIsEditModalVisible(false)}
              variant="ghost"
              size="small"
              style={styles.closeButton}
            />
          </View>

          <ScrollView style={styles.modalContent}>
            <Card style={styles.editCard}>
              <Input
                label="School Name"
                value={editForm.school}
                onChangeText={(value) => setEditForm(prev => ({ ...prev, school: value }))}
                placeholder="Enter your school name"
              />

              <Input
                label="Bio"
                value={editForm.bio}
                onChangeText={(value) => setEditForm(prev => ({ ...prev, bio: value }))}
                placeholder="Tell us about yourself as a teacher..."
                multiline
                numberOfLines={4}
                style={styles.bioInput}
              />

              <Input
                label="Years of Experience"
                value={editForm.experience}
                onChangeText={(value) => setEditForm(prev => ({ ...prev, experience: value }))}
                placeholder="e.g., 5"
                keyboardType="numeric"
              />

              <View style={styles.pickerSection}>
                <Text style={styles.pickerLabel}>Subjects You Teach</Text>
                <View style={styles.subjectsList}>
                  {SUBJECT_OPTIONS.map((subject) => (
                    <TouchableOpacity
                      key={subject}
                      style={[
                        styles.subjectChip,
                        editForm.subjects.includes(subject) && styles.subjectChipSelected
                      ]}
                      onPress={() => {
                        setEditForm(prev => ({
                          ...prev,
                          subjects: prev.subjects.includes(subject)
                            ? prev.subjects.filter(s => s !== subject)
                            : [...prev.subjects, subject]
                        }));
                      }}
                    >
                      <Text style={[
                        styles.subjectChipText,
                        editForm.subjects.includes(subject) && styles.subjectChipTextSelected
                      ]}>
                        {subject}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.pickerSection}>
                <Text style={styles.pickerLabel}>Grades You Teach</Text>
                <View style={styles.subjectsList}>
                  {GRADE_OPTIONS.map((grade) => (
                    <TouchableOpacity
                      key={grade}
                      style={[
                        styles.subjectChip,
                        editForm.grades.includes(grade) && styles.subjectChipSelected
                      ]}
                      onPress={() => {
                        setEditForm(prev => ({
                          ...prev,
                          grades: prev.grades.includes(grade)
                            ? prev.grades.filter(g => g !== grade)
                            : [...prev.grades, grade]
                        }));
                      }}
                    >
                      <Text style={[
                        styles.subjectChipText,
                        editForm.grades.includes(grade) && styles.subjectChipTextSelected
                      ]}>
                        {grade}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.qualificationsSection}>
                <Text style={styles.pickerLabel}>Qualifications</Text>
                {editForm.qualifications.map((qual, index) => (
                  <View key={index} style={styles.qualificationRow}>
                    <Text style={styles.qualificationText}>{qual}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setEditForm(prev => ({
                          ...prev,
                          qualifications: prev.qualifications.filter((_, i) => i !== index)
                        }));
                      }}
                      style={styles.removeButton}
                    >
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                
                <View style={styles.addQualificationRow}>
                  <Input
                    value={newQualification}
                    onChangeText={setNewQualification}
                    placeholder="Add a qualification..."
                    containerStyle={styles.qualificationInput}
                  />
                  <Button
                    title="Add"
                    onPress={() => {
                      if (newQualification.trim()) {
                        setEditForm(prev => ({
                          ...prev,
                          qualifications: [...prev.qualifications, newQualification.trim()]
                        }));
                        setNewQualification('');
                      }
                    }}
                    size="small"
                    style={styles.addButton}
                  />
                </View>
              </View>

              <Button
                title="Save Changes"
                onPress={() => {
                  // Here you would typically save to the backend
                  console.log('Saving profile changes:', editForm);
                  Alert.alert('Success', 'Profile updated successfully!');
                  setIsEditModalVisible(false);
                }}
                style={styles.saveButton}
              />
            </Card>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  profileHeader: {
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  name: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
  },
  statusText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  infoCard: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    marginBottom: SPACING.lg,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  infoContent: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  infoLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  infoValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
  },
  actionsCard: {
    marginBottom: SPACING.xl,
  },
  logoutButton: {
    borderColor: COLORS.error,
  },
  footer: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
  },
  footerText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.light,
    textAlign: 'center',
  },
  profileDetailsCard: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  editButton: {
    padding: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '10',
  },
  bioSection: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  bioText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
    lineHeight: 22,
    marginTop: SPACING.xs,
  },
  qualificationsSection: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  qualificationItem: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
    marginTop: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  modalContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  editCard: {
    marginBottom: SPACING.lg,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerSection: {
    marginBottom: SPACING.lg,
  },
  pickerLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
    fontWeight: '600',
  },
  subjectsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  subjectChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  subjectChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  subjectChipText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.primary,
  },
  subjectChipTextSelected: {
    color: COLORS.surface,
  },
  qualificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  qualificationText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
    flex: 1,
  },
  removeButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.error + '20',
    borderRadius: 8,
  },
  removeButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.error,
  },
  addQualificationRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  qualificationInput: {
    flex: 1,
  },
  addButton: {
    paddingHorizontal: SPACING.lg,
  },
  saveButton: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.primary,
  },
});