import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Lock, KeyRound } from 'lucide-react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { InputField } from '../components/InputField';
import { colors, typography, layout } from '../theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { API_BASE_URL } from '../services/apiConfig';
import { useLanguage } from '../i18n/LanguageContext';

type RootStackParamList = {
  SignIn: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email: string };
};

type ResetPasswordScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ResetPassword'>;
type ResetPasswordScreenRouteProp = RouteProp<RootStackParamList, 'ResetPassword'>;

interface Props {
  navigation: any;
  route: any;
}

export const ResetPasswordScreen: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useLanguage();
  const { email } = route.params;
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!otp || !newPassword) {
      Alert.alert(t('error'), t('alertEnterOTPAndPassword'));
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert(t('error'), t('alertPasswordMin6'));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: otp, newPassword })});
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      Alert.alert(t('success'), t('passwordResetSuccess'), [
        { text: 'OK', onPress: () => navigation.navigate('SignIn') }
      ]);
    } catch (error: any) {
      Alert.alert(t('error'), error.message);
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
            <Text style={styles.title}>{t('resetPassword')}</Text>
            <Text style={styles.subtitle}>
              {t('resetPasswordSubtitle', { email })}
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>{t('sixDigitOTP')}</Text>
            <InputField 
              placeholder="123456"
              icon={KeyRound}
              keyboardType="number-pad"
              value={otp}
              onChangeText={setOtp}
              maxLength={6}
            />

            <Text style={styles.label}>{t('newPassword')}</Text>
            <InputField 
              placeholder={t('enterNewPassword')}
              icon={Lock}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
            ) : (
              <PrimaryButton 
                title={t('resetPassword')} 
                onPress={handleReset} 
              />
            )}
          </View>

          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.backButtonText}>{t('backToSignIn')}</Text>
          </TouchableOpacity>
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
    paddingTop: 80},
  header: {
    alignItems: 'center',
    marginBottom: 40},
  title: {
    ...typography.h2,
    marginBottom: 16,
    textAlign: 'center'},
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    paddingHorizontal: 20},
  form: {
    marginBottom: 40},
  label: {
    ...typography.body,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 8,
    marginTop: 12},
  backButton: {
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 40},
  backButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600'}
});
