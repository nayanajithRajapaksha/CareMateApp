import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pencil, User as UserIcon, Shield, Bell, Globe, FileKey, HelpCircle, ChevronRight, ExternalLink, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { authService } from '../services/authService';
import { profileService, UserProfile } from '../services/profileService';
import { colors, typography, layout } from '../theme';
import { useLanguage } from '../i18n/LanguageContext';

// menuItems is now built inside the component to access the t() function

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
  const navigation = useNavigation<any>();
  const { t } = useLanguage();

  const menuItems = [
    {
      id: 'security',
      icon: Shield,
      title: t('accountSecurity'),
      subtitle: t('accountSecuritySub'),
      rightElement: <ChevronRight color={colors.textMuted} size={20} />
    },
    {
      id: 'notifications',
      icon: Bell,
      title: t('notificationPreferences'),
      subtitle: t('notificationPreferencesSub'),
      rightElement: <ChevronRight color={colors.textMuted} size={20} />
    },
    {
      id: 'language',
      icon: Globe,
      title: t('language'),
      subtitle: t('languageSub'),
      rightElement: (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ color: colors.primary, marginRight: 4, fontWeight: '500' }}>{t('currentLanguageName')}</Text>
          <ChevronRight color={colors.textMuted} size={20} />
        </View>
      )
    },
    {
      id: 'privacy',
      icon: FileKey,
      title: t('privacyPolicy'),
      subtitle: t('privacyPolicySub'),
      rightElement: <ExternalLink color={colors.textMuted} size={20} />
    },
    {
      id: 'support',
      icon: HelpCircle,
      title: t('helpSupport'),
      subtitle: t('helpSupportSub'),
      rightElement: <ChevronRight color={colors.textMuted} size={20} />
    }
  ];
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [activeAction, setActiveAction] = useState<'notifications' | 'privacy' | 'support' | 'security' | null>(null);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordMessageType, setPasswordMessageType] = useState<'error' | 'success'>('error');
  
  const [editFullName, setEditFullName] = useState('');
  const [editContactNumber, setEditContactNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(t('alertCameraPermission'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8});

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        await handleUploadImage(selectedAsset.uri, selectedAsset.mimeType || 'image/jpeg');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(t('error'), t('alertPickImageFailed'));
    }
  };

  const handleUploadImage = async (uri: string, mimeType: string) => {
    try {
      setIsUploadingImage(true);
      const res = await profileService.uploadProfilePic(uri, mimeType);
      
      // Update local profile optimistically
      if (profile) {
        setProfile({ ...profile, profile_pic_url: res.profile_pic_url });
      }
      Alert.alert(t('success'), t('alertProfilePicUpdated'));
    } catch (error: any) {
      console.error('Error uploading image:', error);
      Alert.alert(t('error'), error.message || t('alertUploadFailed'));
    } finally {
      setIsUploadingImage(false);
    }
  };

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
      Alert.alert(t('error'), t('alertProfileLoadFailed'));
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
      Alert.alert(t('alertValidationError'), t('alertFullNameRequired'));
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
      Alert.alert(t('success'), t('alertProfileUpdated'));
    } catch (error) {
      console.error('Failed to update profile', error);
      Alert.alert(t('error'), t('alertProfileUpdateFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleMenuPress = (itemId: string) => {
    switch (itemId) {
      case 'security':
        setPasswordMessage('');
        setActiveAction('security');
        break;
      case 'notifications':
        setActiveAction('notifications');
        break;
      case 'language':
        navigation.navigate('Language');
        break;
      case 'privacy':
        setActiveAction('privacy');
        break;
      case 'support':
        setActiveAction('support');
        break;
      default:
        break;
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessageType('error');
      setPasswordMessage(t('alertFillAllPasswordFields'));
      Alert.alert(t('alertValidationError'), t('alertFillAllPasswordFields'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessageType('error');
      setPasswordMessage(t('alertConfirmPasswordMismatch'));
      Alert.alert(t('alertValidationError'), t('alertConfirmPasswordMismatch'));
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordMessageType('error');
      setPasswordMessage(t('alertNewPasswordSameAsCurrent'));
      Alert.alert(t('alertValidationError'), t('alertNewPasswordSameAsCurrent'));
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessageType('error');
      setPasswordMessage(t('alertPasswordMinLength'));
      Alert.alert(t('alertValidationError'), t('alertPasswordMinLength'));
      return;
    }

    try {
      setIsChangingPassword(true);
      await authService.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessageType('success');
      setPasswordMessage(t('alertPasswordChangedSuccess'));
      Alert.alert(t('alertPasswordChanged'), t('alertPasswordChangedSuccess'));
    } catch (error: any) {
      const message = error?.message || t('alertUnableToUpdatePassword');
      setPasswordMessageType('error');
      setPasswordMessage(message);
      Alert.alert(
        message === 'Current password is incorrect.' ? t('alertIncorrectPassword') : t('alertPasswordUpdateFailed'),
        message
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      setActiveAction(null);
      navigation.reset({ index: 0, routes: [{ name: 'SignIn' }] });
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert(t('error'), t('alertLogoutError'));
    }
  };

  const openSupportEmail = async () => {
    const email = 'support@caremate.app';
    const url = `mailto:${email}`;
    const canOpen = await Linking.canOpenURL(url);

    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert(t('helpSupport'), 'Email us at support@caremate.app');
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
            <TouchableOpacity onPress={handlePickImage} disabled={isUploadingImage}>
              <View style={styles.avatar}>
                {isUploadingImage ? (
                  <ActivityIndicator color={colors.primary} />
                ) : profile?.profile_pic_url ? (
                  <Image source={{ uri: profile.profile_pic_url }} style={{ width: 80, height: 80, borderRadius: 40 }} />
                ) : (
                  <Text style={styles.avatarText}>{getInitials(profile?.full_name)}</Text>
                )}
              </View>
              <View style={styles.editBadge}>
                <Pencil color={colors.white} size={14} />
              </View>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>{profile?.full_name || t('user')}</Text>
          <Text style={styles.userInfo}>{profile?.email}</Text>
          <Text style={styles.userInfo}>{profile?.contact_number || t('noContactNumber')}</Text>
          
          <TouchableOpacity style={styles.editProfileBtn} onPress={openEditModal}>
            <UserIcon color={colors.primary} size={16} style={{ marginRight: 6 }} />
            <Text style={styles.editProfileText}>{t('editProfile')}</Text>
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
                onPress={() => handleMenuPress(item.id)}
                activeOpacity={0.7}
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
          <Text style={styles.footerText}>{t('appVersion')}</Text>
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
              <Text style={styles.modalTitle}>{t('editProfile')}</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <X color={colors.textDark} size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('fullName')}</Text>
              <TextInput
                style={styles.input}
                value={editFullName}
                onChangeText={setEditFullName}
                placeholder={t('enterFullName')}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('contactNumber')}</Text>
              <TextInput
                style={styles.input}
                value={editContactNumber}
                onChangeText={setEditContactNumber}
                placeholder={t('enterContactNumber')}
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
                <Text style={styles.saveButtonText}>{t('saveChanges')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={activeAction !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setActiveAction(null)}
      >
        <View style={styles.actionModalOverlay}>
          <View style={styles.actionModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activeAction === 'notifications' ? t('notificationPreferences') :
                  activeAction === 'privacy' ? t('privacyPolicy') :
                  activeAction === 'support' ? t('helpSupport') : t('settings')}
              </Text>
              <TouchableOpacity onPress={() => setActiveAction(null)}>
                <X color={colors.textDark} size={24} />
              </TouchableOpacity>
            </View>

            {activeAction === 'security' && (
              <View>
                <Text style={styles.modalBodyText}>
                  {t('securityDescription')}
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('currentPassword')}</Text>
                  <TextInput
                    style={styles.input}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder={t('enterCurrentPassword')}
                    secureTextEntry
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('newPassword')}</Text>
                  <TextInput
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder={t('enterNewPassword')}
                    secureTextEntry
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t('confirmPassword')}</Text>
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder={t('confirmNewPassword')}
                    secureTextEntry
                  />
                </View>

                {!!passwordMessage && (
                  <Text style={passwordMessageType === 'success' ? styles.successMessage : styles.errorMessage}>
                    {passwordMessage}
                  </Text>
                )}

                <TouchableOpacity style={styles.supportButton} onPress={handleChangePassword} disabled={isChangingPassword}>
                  <Text style={styles.supportButtonText}>{isChangingPassword ? t('updating') : t('changePassword')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.closeActionButton} onPress={handleLogout}>
                  <Text style={styles.closeActionButtonText}>{t('logOut')}</Text>
                </TouchableOpacity>
              </View>
            )}

            {activeAction === 'notifications' && (
              <View>
                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>{t('emailNotifications')}</Text>
                  <TouchableOpacity
                    style={[styles.toggle, emailNotifications && styles.toggleOn]}
                    onPress={() => setEmailNotifications(prev => !prev)}
                  >
                    <View style={[styles.toggleThumb, emailNotifications && styles.toggleThumbOn]} />
                  </TouchableOpacity>
                </View>

                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>{t('appNotifications')}</Text>
                  <TouchableOpacity
                    style={[styles.toggle, pushNotifications && styles.toggleOn]}
                    onPress={() => setPushNotifications(prev => !prev)}
                  >
                    <View style={[styles.toggleThumb, pushNotifications && styles.toggleThumbOn]} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {activeAction === 'privacy' && (
              <Text style={styles.modalBodyText}>
                {t('privacyDescription')}
              </Text>
            )}

            {activeAction === 'support' && (
              <View>
                <Text style={styles.modalBodyText}>
                  {t('supportDescription')}
                </Text>
                <TouchableOpacity style={styles.supportButton} onPress={openSupportEmail}>
                  <Text style={styles.supportButtonText}>{t('contactSupport')}</Text>
                </TouchableOpacity>
              </View>
            )}

            {activeAction !== 'security' && (
              <TouchableOpacity style={styles.closeActionButton} onPress={() => setActiveAction(null)}>
                <Text style={styles.closeActionButtonText}>{t('close')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FAFA'},
  scrollContent: {
    padding: layout.padding,
    paddingBottom: 40},
  profileHeader: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32},
  avatarContainer: {
    position: 'relative',
    marginBottom: 16},
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center'},
  avatarText: {
    color: colors.white,
    fontSize: 32,
    fontWeight: 'bold'},
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
    marginBottom: 4},
  userInfo: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 2},
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4F4',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 16},
  editProfileText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14},
  menuContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    overflow: 'hidden'},
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16},
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)'},
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6F4F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16},
  menuTextContainer: {
    flex: 1},
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 4},
  menuSubtitle: {
    fontSize: 13,
    color: colors.textMuted},
  menuRightElement: {
    marginLeft: 8},
  footerContainer: {
    marginTop: 32,
    alignItems: 'center'},
  footerText: {
    fontSize: 12,
    color: colors.textMuted},
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'},
  modalKeyboardAvoidingView: {
    justifyContent: 'flex-end'},
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 300},
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24},
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textDark},
  inputGroup: {
    marginBottom: 16},
  label: {
    fontSize: 14,
    color: colors.textDark,
    marginBottom: 8,
    fontWeight: '500'},
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.borderRadius,
    padding: 12,
    fontSize: 16,
    color: colors.textDark},
  saveButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: layout.borderRadius,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20},
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold'},
  actionModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 20},
  actionModalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20},
  modalBodyText: {
    fontSize: 15,
    color: colors.textDark,
    lineHeight: 22,
    marginBottom: 18},
  errorMessage: {
    color: '#B42318',
    fontSize: 14,
    marginBottom: 16,
    fontWeight: '600'},
  successMessage: {
    color: '#027A48',
    fontSize: 14,
    marginBottom: 16,
    fontWeight: '600'},
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18},
  toggleLabel: {
    fontSize: 15,
    color: colors.textDark,
    fontWeight: '500'},
  toggle: {
    width: 52,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D9E3E3',
    padding: 4,
    justifyContent: 'center'},
  toggleOn: {
    backgroundColor: colors.primary},
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.white,
    alignSelf: 'flex-start'},
  toggleThumbOn: {
    alignSelf: 'flex-end'},
  supportButton: {
    backgroundColor: '#E6F4F4',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 18},
  supportButtonText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 15},
  closeActionButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'},
  closeActionButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 15}
});
