import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Modal, FlatList, Platform, Image } from 'react-native';
import { ChevronLeft, User, Calendar, Edit2, CheckCircle2, ChevronDown, MapPin, X, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, typography, layout } from '../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PrimaryButton } from '../components/PrimaryButton';
import { childService } from '../services/childService';
import { clinicService, Clinic } from '../services/clinicService';
import DateTimePicker from '@react-native-community/datetimepicker';

export const RegisterChildScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const isEditMode = route.params?.mode === 'edit';
  const editingChild = route.params?.child;
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isClinicModalVisible, setIsClinicModalVisible] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    clinicService.getAll()
      .then(data => setClinics(data))
      .catch(err => console.error('Failed to load clinics', err));
  }, []);

  const defaultForm = {
    full_name: '',
    dob: '',
    gender: 'Male',
    relationship: 'Parent',
    birth_cert_number: '',
    blood_group: 'O+',
    birth_weight_kg: '',
    allergies: '',
    existing_conditions: '',
    primary_clinic: ''
  };

  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    if (!isEditMode || !editingChild) {
      setFormData(defaultForm);
      return;
    }

    setFormData({
      full_name: editingChild.full_name || '',
      dob: editingChild.dob || '',
      gender: editingChild.gender || 'Male',
      relationship: editingChild.relationship || 'Parent',
      birth_cert_number: editingChild.birth_cert_number || '',
      blood_group: editingChild.blood_group || 'O+',
      birth_weight_kg: editingChild.birth_weight_kg !== null && editingChild.birth_weight_kg !== undefined ? String(editingChild.birth_weight_kg) : '',
      allergies: editingChild.allergies || '',
      existing_conditions: editingChild.existing_conditions || '',
      primary_clinic: editingChild.primary_clinic || ''
    });

    if (editingChild.profile_pic_url) {
      setProfilePic(editingChild.profile_pic_url);
    }
  }, [isEditMode, editingChild]);

  const handleImagePick = async () => {
    if (!isEditMode || !editingChild?.id) return;

    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'You need to allow access to your photos to upload a profile picture.');
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
        const imageUri = pickerResult.assets[0].uri;
        setProfilePic(imageUri); // Optimistic UI update

        setUploadingImage(true);
        try {
          await childService.uploadChildProfilePic(editingChild.id, imageUri);
          Alert.alert('Success', 'Profile picture updated successfully!');
        } catch (error: any) {
          console.error('Error uploading profile pic:', error);
          Alert.alert('Upload Failed', error.message || 'Could not upload profile picture.');
          // Revert if failed
          setProfilePic(editingChild.profile_pic_url || null);
        } finally {
          setUploadingImage(false);
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'An unexpected error occurred while picking the image.');
    }
  };

  const updateForm = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.full_name || !formData.dob) {
        Alert.alert('Validation Error', 'Please fill in the full name and date of birth.');
        return;
      }
    }
    if (step === 2) {
      if (!formData.birth_weight_kg) {
        Alert.alert('Validation Error', 'Please enter birth weight.');
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        birth_weight_kg: formData.birth_weight_kg === '' ? 0 : parseFloat(formData.birth_weight_kg)
      };

      if (isEditMode && editingChild?.id) {
        await childService.updateChild(editingChild.id, payload);
        Alert.alert('Success', 'Child details updated successfully.');
      } else {
        await childService.registerChild(payload);
      }

      navigation.goBack();
    } catch (error: any) {
      console.error('Error submitting form:', error);
      Alert.alert('Error', error.message || (isEditMode ? 'Failed to update child details.' : 'Failed to register child. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => {
    return (
      <View style={styles.stepIndicatorContainer}>
        <View style={styles.stepWrapper}>
          <View style={[styles.stepCircle, step >= 1 ? styles.stepCircleActive : null]}>
            {step > 1 ? <CheckCircle2 color="#fff" size={16} /> : <Text style={styles.stepTextActive}>1</Text>}
          </View>
          <Text style={[styles.stepLabel, step >= 1 ? styles.stepLabelActive : null]}>Details</Text>
        </View>

        <View style={[styles.stepLine, step >= 2 ? styles.stepLineActive : null]} />

        <View style={styles.stepWrapper}>
          <View style={[styles.stepCircle, step >= 2 ? styles.stepCircleActive : null]}>
            {step > 2 ? <CheckCircle2 color="#fff" size={16} /> : <Text style={[styles.stepText, step >= 2 ? styles.stepTextActive : null]}>2</Text>}
          </View>
          <Text style={[styles.stepLabel, step >= 2 ? styles.stepLabelActive : null]}>Medical</Text>
        </View>

        <View style={[styles.stepLine, step >= 3 ? styles.stepLineActive : null]} />

        <View style={styles.stepWrapper}>
          <View style={[styles.stepCircle, step >= 3 ? styles.stepCircleActive : null]}>
            <Text style={[styles.stepText, step >= 3 ? styles.stepTextActive : null]}>3</Text>
          </View>
          <Text style={[styles.stepLabel, step >= 3 ? styles.stepLabelActive : null]}>Review</Text>
        </View>
      </View>
    );
  };

  const renderStep1 = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formSubtitle}>Please provide the child's basic information to begin setting up their health profile.</Text>

      {isEditMode && (
        <View style={styles.profilePicContainer}>
          <TouchableOpacity style={styles.profilePicWrapper} onPress={handleImagePick} disabled={uploadingImage}>
            {profilePic ? (
              <Image source={{ uri: profilePic }} style={styles.profileImage} />
            ) : (
              <View style={styles.profilePicPlaceholder}>
                <User color={colors.textMuted} size={40} />
              </View>
            )}
            
            {uploadingImage ? (
              <View style={styles.profilePicOverlay}>
                <ActivityIndicator color={colors.white} size="small" />
              </View>
            ) : (
              <View style={styles.editIconBadge}>
                <Camera color={colors.white} size={14} />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.profilePicHint}>Tap to change profile picture</Text>
        </View>
      )}

      <Text style={styles.label}>Full Name (as on Birth Certificate)</Text>
      <View style={styles.inputContainer}>
        <User color={colors.textMuted} size={20} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="e.g. Jane Doe"
          value={formData.full_name}
          onChangeText={(val) => updateForm('full_name', val)}
        />
      </View>

      <Text style={styles.label}>Date of Birth</Text>
      <TouchableOpacity style={styles.inputContainer} onPress={() => setShowDatePicker(true)}>
        <Calendar color={colors.textMuted} size={20} style={styles.inputIcon} />
        <Text style={[styles.input, { marginTop: Platform.OS === 'ios' ? 14 : 12, color: formData.dob ? colors.textDark : colors.textMuted }]}>
          {formData.dob || 'YYYY-MM-DD'}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={formData.dob ? new Date(formData.dob) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowDatePicker(Platform.OS === 'ios');
            if (selectedDate) {
              const year = selectedDate.getFullYear();
              const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
              const day = String(selectedDate.getDate()).padStart(2, '0');
              updateForm('dob', `${year}-${month}-${day}`);
            }
          }}
        />
      )}

      <Text style={styles.label}>Gender</Text>
      <View style={styles.row}>
        {['Male', 'Female', 'Other'].map(g => (
          <TouchableOpacity 
            key={g} 
            style={[styles.radioBtn, formData.gender === g && styles.radioBtnActive]}
            onPress={() => updateForm('gender', g)}
          >
            <Text style={[styles.radioText, formData.gender === g && styles.radioTextActive]}>{g}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Relationship to Child</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="e.g. Parent, Guardian"
          value={formData.relationship}
          onChangeText={(val) => updateForm('relationship', val)}
        />
      </View>

      <Text style={styles.label}>Birth Certificate Number (Optional)</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="e.g. 123-456-789"
          value={formData.birth_cert_number}
          onChangeText={(val) => updateForm('birth_cert_number', val)}
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formSubtitle}>Please provide the child's medical information to help us personalize their care plan.</Text>

      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.label}>Blood Group</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Select"
              value={formData.blood_group}
              onChangeText={(val) => updateForm('blood_group', val)}
            />
          </View>
        </View>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.label}>Birth Wt. (kg)</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="e.g. 3.2"
              keyboardType="numeric"
              value={formData.birth_weight_kg}
              onChangeText={(val) => updateForm('birth_weight_kg', val)}
            />
          </View>
        </View>
      </View>

      <Text style={styles.label}>Allergies <Text style={styles.optional}>(Optional)</Text></Text>
      <View style={[styles.inputContainer, styles.textAreaContainer]}>
        <TextInput
          style={styles.textArea}
          placeholder="e.g. Penicillin, Peanuts"
          multiline
          numberOfLines={3}
          value={formData.allergies}
          onChangeText={(val) => updateForm('allergies', val)}
        />
      </View>

      <Text style={styles.label}>Existing Conditions <Text style={styles.optional}>(Optional)</Text></Text>
      <View style={[styles.inputContainer, styles.textAreaContainer]}>
        <TextInput
          style={styles.textArea}
          placeholder="e.g. Asthma"
          multiline
          numberOfLines={3}
          value={formData.existing_conditions}
          onChangeText={(val) => updateForm('existing_conditions', val)}
        />
      </View>

      <Text style={styles.label}>Primary Doctor/Clinic Name</Text>
      <TouchableOpacity 
        style={[styles.inputContainer, { justifyContent: 'space-between' }]}
        onPress={() => setIsClinicModalVisible(true)}
      >
        <Text style={{ fontSize: 16, color: formData.primary_clinic ? colors.textDark : colors.textMuted }}>
          {formData.primary_clinic || 'Select a registered clinic'}
        </Text>
        <ChevronDown color={colors.textMuted} size={20} />
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.formContainer}>
      
      {/* Basic Details Card */}
      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewTitle}>BASIC DETAILS</Text>
          <TouchableOpacity onPress={() => setStep(1)} style={styles.editBtn}>
            <Edit2 size={14} color={colors.primary} />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.reviewLabel}>Name</Text>
            <Text style={styles.reviewValue}>{formData.full_name}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.reviewLabel}>Date of Birth</Text>
            <Text style={styles.reviewValue}>{formData.dob}</Text>
          </View>
        </View>
        <View style={[styles.row, { marginTop: 16 }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.reviewLabel}>Gender</Text>
            <Text style={styles.reviewValue}>{formData.gender}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.reviewLabel}>Relationship</Text>
            <Text style={styles.reviewValue}>{formData.relationship}</Text>
          </View>
        </View>
      </View>

      {/* Medical Details Card */}
      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewTitle}>MEDICAL DETAILS</Text>
          <TouchableOpacity onPress={() => setStep(2)} style={styles.editBtn}>
            <Edit2 size={14} color={colors.primary} />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.reviewLabel}>Blood Group</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{formData.blood_group}</Text>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.reviewLabel}>Birth Weight</Text>
            <Text style={styles.reviewValue}>{formData.birth_weight_kg} kg</Text>
          </View>
        </View>
        
        <View style={{ marginTop: 16 }}>
          <Text style={styles.reviewLabel}>Allergies</Text>
          <Text style={styles.reviewValue}>{formData.allergies || 'None'}</Text>
        </View>
        
        <View style={{ marginTop: 16 }}>
          <Text style={styles.reviewLabel}>Existing Conditions</Text>
          <Text style={styles.reviewValue}>{formData.existing_conditions || 'None'}</Text>
        </View>

        <View style={{ marginTop: 16 }}>
          <Text style={styles.reviewLabel}>Primary Clinic</Text>
          <Text style={styles.reviewValue}>{formData.primary_clinic || 'Not Provided'}</Text>
        </View>
      </View>

    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => {
          if (step > 1) setStep(prev => prev - 1);
          else navigation.goBack();
        }}>
          <ChevronLeft color={colors.textDark} size={24} />
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{isEditMode ? 'Edit Child Details' : 'Register Child'}</Text>
        
        {renderStepIndicator()}
        
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        
      </ScrollView>

      <View style={styles.footer}>
        {step < 3 ? (
          <PrimaryButton 
            title={step === 1 ? "Continue to Medical Details" : "Continue to Review"} 
            onPress={handleNext} 
          />
        ) : (
          <PrimaryButton 
            title={loading ? (isEditMode ? 'Saving...' : 'Registering...') : (isEditMode ? 'Save Changes' : 'Complete Registration')} 
            onPress={handleSubmit} 
            disabled={loading}
          />
        )}
      </View>

      {/* Clinic Selection Modal */}
      <Modal
        visible={isClinicModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsClinicModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Clinic</Text>
              <TouchableOpacity onPress={() => setIsClinicModalVisible(false)} style={styles.modalCloseBtn}>
                <X color={colors.textDark} size={24} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={clinics}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => {
                    updateForm('primary_clinic', item.name);
                    setIsClinicModalVisible(false);
                  }}
                >
                  <View style={styles.modalOptionIcon}>
                    <MapPin color={colors.primary} size={20} />
                  </View>
                  <View style={styles.modalOptionContent}>
                    <Text style={styles.modalOptionTitle}>{item.name}</Text>
                    {item.address && <Text style={styles.modalOptionSubtitle} numberOfLines={1}>{item.address}</Text>}
                  </View>
                </TouchableOpacity>
              )}
              contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
              ListEmptyComponent={
                <Text style={{ textAlign: 'center', color: colors.textMuted, marginTop: 20 }}>No clinics found.</Text>
              }
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FAFA',
  },
  header: {
    paddingHorizontal: layout.padding,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  scrollContent: {
    padding: layout.padding,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 24,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  stepWrapper: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E6F4F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCircleActive: {
    backgroundColor: colors.primary,
  },
  stepText: {
    color: colors.textMuted,
    fontWeight: 'bold',
  },
  stepTextActive: {
    color: colors.white,
    fontWeight: 'bold',
  },
  stepLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  stepLabelActive: {
    color: colors.primary,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E6F4F4',
    marginHorizontal: 8,
    marginBottom: 20, // offset label height
  },
  stepLineActive: {
    backgroundColor: colors.primary,
  },
  formContainer: {
    marginBottom: 20,
  },
  formSubtitle: {
    fontSize: 15,
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 8,
  },
  optional: {
    fontWeight: 'normal',
    color: colors.textLight,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    height: 52,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 15,
    color: colors.textDark,
  },
  textAreaContainer: {
    height: 100,
    alignItems: 'flex-start',
    paddingTop: 12,
  },
  textArea: {
    flex: 1,
    textAlignVertical: 'top',
    fontSize: 15,
    color: colors.textDark,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  radioBtn: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: colors.white,
  },
  radioBtnActive: {
    borderColor: colors.primary,
    backgroundColor: '#F0F9F9',
  },
  radioText: {
    fontSize: 15,
    color: colors.textMuted,
    fontWeight: '500',
  },
  radioTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  footer: {
    padding: layout.padding,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  reviewCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    paddingBottom: 12,
    marginBottom: 16,
  },
  reviewTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textDark,
    letterSpacing: 1,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  reviewLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 4,
  },
  reviewValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textDark,
  },
  badge: {
    backgroundColor: '#E6F4F4',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  modalOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F9F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalOptionContent: {
    flex: 1,
  },
  modalOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 4,
  },
  modalOptionSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
  },
  profilePicContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profilePicWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  profilePicPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profilePicOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconBadge: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 4,
    alignItems: 'center',
  },
  profilePicHint: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
