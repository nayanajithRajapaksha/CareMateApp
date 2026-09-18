import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Lock, KeyRound } from 'lucide-react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { InputField } from '../components/InputField';
import { colors, typography, layout } from '../theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { API_URL } from '../config';

type RootStackParamList = {
  SignIn: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email: string };
};

type ResetPasswordScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ResetPassword'>;
type ResetPasswordScreenRouteProp = RouteProp<RootStackParamList, 'ResetPassword'>;

interface Props {
  navigation: ResetPasswordScreenNavigationProp;
  route: ResetPasswordScreenRouteProp;
}

export const ResetPasswordScreen: React.FC<Props> = ({ navigation, route }) => {
  const { email } = route.params;
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!otp || !newPassword) {
      Alert.alert('Error', 'Please enter the OTP and a new password.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: otp, newPassword }),
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      Alert.alert('Success', 'Password has been reset successfully. Please sign in with your new password.', [
        { text: 'OK', onPress: () => navigation.navigate('SignIn') }
      ]);
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
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to {email} along with your new password.
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>6-Digit OTP</Text>
            <InputField 
              placeholder="123456"
              icon={KeyRound}
              keyboardType="number-pad"
              value={otp}
              onChangeText={setOtp}
              maxLength={6}
            />

            <Text style={styles.label}>New Password</Text>
            <InputField 
              placeholder="Enter new password"
              icon={Lock}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
            ) : (
              <PrimaryButton 
                title="Reset Password" 
                onPress={handleReset} 
              />
            )}
          </View>

          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('SignIn')}>
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
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: layout.padding,
    paddingTop: 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    ...typography.h2,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  form: {
    marginBottom: 40,
  },
  label: {
    ...typography.body,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 8,
    marginTop: 12,
  },
  backButton: {
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 40,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  }
});
