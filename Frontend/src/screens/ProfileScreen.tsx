import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Pencil, User as UserIcon, Shield, Bell, Globe, FileKey, HelpCircle, ChevronRight, ExternalLink, X } from 'lucide-react-native';
import { profileService, UserProfile } from '../services/profileService';
import { colors, typography, layout } from '../theme';

const menuItems = [
  {
    id: 'security',
    icon: Shield,
    title: 'Account Security',
    subtitle: 'Password, 2FA, Devices',
    rightElement: <ChevronRight color={colors.textMuted} size={20} />
  },
  {
    id: 'notifications',
    icon: Bell,
    title: 'Notification Preferences',
    subtitle: 'Email, Push, SMS',
    rightElement: <ChevronRight color={colors.textMuted} size={20} />
  },
  {
    id: 'language',
    icon: Globe,
    title: 'Language',
    subtitle: 'English / Sinhala / Tamil',
    rightElement: (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ color: colors.primary, marginRight: 4, fontWeight: '500' }}>English</Text>
        <ChevronRight color={colors.textMuted} size={20} />
      </View>
    )
  },
  {
    id: 'privacy',
    icon: FileKey,
    title: 'Privacy Policy',
    subtitle: 'Terms, Data usage',
    rightElement: <ExternalLink color={colors.textMuted} size={20} />
  },
  {
    id: 'support',
    icon: HelpCircle,
    title: 'Help & Support',
    subtitle: 'FAQs, Contact us',
    rightElement: <ChevronRight color={colors.textMuted} size={20} />
  }
];

const getInitials = (fullName?: string): string => {
  if (!fullName?.trim()) {
    return 'U';
  }

  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(name => name[0])
    .join('')
    .toUpperCase();
};

export const ProfileScreen: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  
  const [editFullName, setEditFullName] = useState('');
  const [editContactNumber, setEditContactNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await profileService.getProfile();
      setProfile(res.profile);
    } catch (error) {
      console.error('Failed to fetch profile', error);
      Alert.alert('Error', 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = () => {
    if (profile) {
      setEditFullName(profile.full_name || '');
      setEditContactNumber(profile.contact_number || '');
      setEditModalVisible(true);
    }
  };

  const handleSaveProfile = async () => {
    if (!editFullName.trim()) {
      Alert.alert('Validation Error', 'Full Name is required.');
      return;
    }

    try {
      setIsSaving(true);
      const res = await profileService.updateProfile({
        full_name: editFullName.trim(),
        contact_number: editContactNumber.trim()
      });
      setProfile(res.profile);
      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully.');
    } catch (error) {
      console.error('Failed to update profile', error);
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(profile?.full_name)}</Text>
            </View>
            <TouchableOpacity style={styles.editBadge} onPress={openEditModal}>
              <Pencil color={colors.white} size={14} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>{profile?.full_name || 'User'}</Text>
          <Text style={styles.userInfo}>{profile?.email}</Text>
          <Text style={styles.userInfo}>{profile?.contact_number || 'No contact number'}</Text>
          
          <TouchableOpacity style={styles.editProfileBtn} onPress={openEditModal}>
            <UserIcon color={colors.primary} size={16} style={{ marginRight: 6 }} />
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Menu List */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isLast = index === menuItems.length - 1;
            
            return (
              <TouchableOpacity 
                key={item.id} 
                style={[styles.menuItem, !isLast && styles.menuItemBorder]}
              >
                <View style={styles.menuIconContainer}>
                  <Icon color={colors.primary} size={20} />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                <View style={styles.menuRightElement}>
                  {item.rightElement}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Footer Text */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>App Version 2.4.1 (Build 492)</Text>
        </View>

      </ScrollView>
      )}

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={[styles.modalOverlay, styles.modalKeyboardAvoidingView]}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <X color={colors.textDark} size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={editFullName}
                onChangeText={setEditFullName}
                placeholder="Enter your full name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contact Number</Text>
              <TextInput
                style={styles.input}
                value={editContactNumber}
                onChangeText={setEditContactNumber}
                placeholder="Enter contact number"
                keyboardType="phone-pad"
              />
            </View>

            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSaveProfile}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FAFA',
  },
  scrollContent: {
    padding: layout.padding,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: 32,
    fontWeight: 'bold',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F4FAFA', // Match background to create cutout effect
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 4,
  },
  userInfo: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 2,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4F4',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 16,
  },
  editProfileText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  menuContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6F4F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
  },
  menuRightElement: {
    marginLeft: 8,
  },
  footerContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalKeyboardAvoidingView: {
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: colors.textDark,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.borderRadius,
    padding: 12,
    fontSize: 16,
    color: colors.textDark,
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: layout.borderRadius,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  }
});
