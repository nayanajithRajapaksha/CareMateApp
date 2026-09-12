import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { ChevronLeft, User, Calendar, Edit2, CheckCircle2 } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, typography, layout } from '../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PrimaryButton } from '../components/PrimaryButton';
import { childService } from '../services/childService';

export const RegisterChildScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const isEditMode = route.params?.mode === 'edit';
  const editingChild = route.params?.child;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

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
  }, [isEditMode, editingChild]);

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
      <View style={styles.inputContainer}>
        <Calendar color={colors.textMuted} size={20} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          value={formData.dob}
          onChangeText={(val) => updateForm('dob', val)}
        />
      </View>

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
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="e.g. City General Pediatrics"
          value={formData.primary_clinic}
          onChangeText={(val) => updateForm('primary_clinic', val)}
        />
      </View>
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
  }
});
