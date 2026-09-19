import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail } from 'lucide-react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { InputField } from '../components/InputField';
import { colors, typography, layout } from '../theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { API_BASE_URL } from '../services/apiConfig';

type RootStackParamList = {
  SignIn: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email: string };
};

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;

interface Props {
  navigation: ForgotPasswordScreenNavigationProp;
}

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendResetLink = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })});
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      navigation.navigate('ResetPassword', { email });
    } catch (error: any) {
      Alert.alert('Error', error.message);
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
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you a 6-digit OTP to reset your password.
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Email Address</Text>
            <InputField 
              placeholder="name@example.com"
              icon={Mail}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
            ) : (
              <PrimaryButton 
                title="Send OTP" 
                onPress={handleSendResetLink} 
              />
            )}
          </View>

          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Back to Sign In</Text>
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
    marginBottom: 8},
  backButton: {
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 40},
  backButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600'}
});
