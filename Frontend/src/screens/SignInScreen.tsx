import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Lock } from 'lucide-react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { InputField } from '../components/InputField';
import { colors, typography, layout } from '../theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { authService } from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLanguage } from '../i18n/LanguageContext';

import { usePushNotifications } from '../hooks/usePushNotifications';
import { profileService } from '../services/profileService';
import { useAuth } from '../context/AuthContext';

type RootStackParamList = {
  SignIn: undefined;
  SignInSuccess: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

type SignInScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignIn'>;

interface Props {
  navigation: SignInScreenNavigationProp;
}

export const SignInScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [signInMessage, setSignInMessage] = useState('');
  const { expoPushToken } = usePushNotifications();
  const { setRole } = useAuth();

  const handleSignIn = async () => {
    if (!email.trim()) {
      setSignInMessage(t('alertEnterEmail'));
      Alert.alert(t('signInError'), t('alertEnterEmail'));
      return;
    }

    if (!password) {
      setSignInMessage(t('alertEnterPassword'));
      Alert.alert(t('signInError'), t('alertEnterPassword'));
      return;
    }

    setLoading(true);
    setSignInMessage('');
    try {
      const data = await authService.login({ email: email.toLowerCase().trim(), password });

      // Store JWT token (Assuming you have AsyncStorage setup, for now we just navigate)
      await AsyncStorage.setItem('userToken', data.token);

      // Fetch profile to set role
      try {
        const profileResponse = await profileService.getProfile();
        setRole(profileResponse.profile?.role || 'parent');
      } catch (err) {
        console.warn('Failed to fetch profile role', err);
        setRole('parent'); // fallback
      }

      // Send push token to backend if available
      if (expoPushToken?.data) {
        try {
          await profileService.updatePushToken(expoPushToken.data);
          console.log('Push token sent to backend successfully');
        } catch (e) {
          console.warn('Failed to send push token to backend:', e);
        }
      }

      navigation.navigate('SignInSuccess');
    } catch (error: any) {
      const errorMessage = error?.message || '';
      const message = errorMessage.includes('connect') || errorMessage.includes('server')
        ? errorMessage
        : t('wrongCredentials');
      setSignInMessage(message);
      Alert.alert(t('signInFailed'), message);
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
        <View style={styles.content}>
          
          <View style={styles.header}>
            <Image 
              source={require('../../assets/logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>{t('welcomeBack')}</Text>
            <Text style={styles.subtitle}>{t('signInContinue')}</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>{t('emailAddress')}</Text>
            <InputField 
              placeholder={t('enterEmail')}
              icon={User}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>{t('password')}</Text>
            <InputField 
              placeholder={t('enterPassword')}
              icon={Lock}
              isPassword
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                setSignInMessage('');
              }}
            />

            {!!signInMessage && <Text style={styles.errorMessage}>{signInMessage}</Text>}

            <TouchableOpacity style={styles.forgotPasswordContainer} onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgotPasswordText}>{t('forgotPassword')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : (
              <PrimaryButton 
                title={t('signIn')} 
                onPress={handleSignIn} 
              />
            )}
            
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>{t('dontHaveAccount')}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.signupLink}>{t('signUp')}</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: layout.padding,
    paddingTop: 60,
    justifyContent: 'center'},
  header: {
    alignItems: 'center',
    marginBottom: 40},
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24},
  title: {
    ...typography.h1,
    marginBottom: 8},
  subtitle: {
    ...typography.body},
  form: {
    marginBottom: 24},
  label: {
    ...typography.body,
    fontSize: 14,
    color: colors.textDark,
    marginBottom: 8,
    fontWeight: '500'},
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: 8},
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600'},
  errorMessage: {
    color: '#B42318',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12},
  footer: {
    marginTop: 'auto',
    marginBottom: 40},
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24},
  signupText: {
    color: colors.textMuted,
    fontSize: 14},
  signupLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600'}});
