import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Lock, Mail, Phone, ChevronLeft } from 'lucide-react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { InputField } from '../components/InputField';
import { colors, typography, layout } from '../theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { authService } from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../i18n/LanguageContext';

type RootStackParamList = {
  Welcome: undefined;
  SignUp: undefined;
  SignIn: undefined;
  SignInSuccess: undefined;
  CheckEmail: undefined;
};

type SignUpScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignUp'>;

interface Props {
  navigation: SignUpScreenNavigationProp;
}

export const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !contactNumber || !password) {
      Alert.alert(t('alertValidationError'), t('alertFillAllFields'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert(t('alertValidationError'), t('alertInvalidEmail'));
      return;
    }

    if (password.length < 6) {
      Alert.alert(t('alertValidationError'), t('alertPasswordMin6'));
      return;
    }

    if (contactNumber.length < 9) {
      Alert.alert(t('alertValidationError'), t('alertInvalidContact'));
      return;
    }

    setLoading(true);
    try {
      const data = await authService.register({
        full_name: name,
        email: email.toLowerCase().trim(),
        contact_number: contactNumber,
        password});

      await AsyncStorage.setItem('userToken', data.token);
      navigation.navigate('SignInSuccess');
    } catch (error: any) {
      Alert.alert(t('registrationFailed'), error.message || t('somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <ChevronLeft color={colors.primary} size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.titleContainer}>
            <Text style={styles.title}>{t('createAccount')}</Text>
            <Text style={styles.subtitle}>{t('joinCareMate')}</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>{t('fullName')}</Text>
            <InputField 
              placeholder={t('enterFullName')}
              icon={User}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>{t('emailAddress')}</Text>
            <InputField 
              placeholder={t('enterEmail')}
              icon={Mail}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>{t('contactNumber')}</Text>
            <InputField 
              placeholder={t('enterMobileNumber')}
              icon={Phone}
              keyboardType="phone-pad"
              value={contactNumber}
              onChangeText={setContactNumber}
            />

            <Text style={styles.label}>{t('password')}</Text>
            <InputField 
              placeholder={t('createPassword')}
              icon={Lock}
              isPassword
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <View style={styles.footer}>
            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: 16 }} />
            ) : (
              <PrimaryButton 
                title={t('signUp')} 
                onPress={handleSignUp} 
              />
            )}
            
            <View style={styles.signinContainer}>
              <Text style={styles.signinText}>{t('alreadyHaveAccount')}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                <Text style={styles.signinLink}>{t('signIn')}</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background},
  flex: {
    flex: 1},
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: layout.padding,
    paddingBottom: 40},
  header: {
    paddingTop: 16,
    paddingBottom: 16},
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'},
  titleContainer: {
    marginBottom: 32},
  title: {
    ...typography.h2,
    marginBottom: 8},
  subtitle: {
    ...typography.body},
  form: {
    marginBottom: 32},
  label: {
    ...typography.body,
    fontSize: 14,
    color: colors.textDark,
    marginBottom: 8,
    fontWeight: '500'},
  footer: {
    marginTop: 'auto'},
  signinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16},
  signinText: {
    color: colors.textMuted,
    fontSize: 14},
  signinLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600'}});
