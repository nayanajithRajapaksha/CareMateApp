import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { HeartPulse, User, Lock } from 'lucide-react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { InputField } from '../components/InputField';
import { colors, typography, layout } from '../theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  SignIn: undefined;
  SignInSuccess: undefined;
};

type SignInScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignIn'>;

interface Props {
  navigation: SignInScreenNavigationProp;
}

export const SignInScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.content}>
          
          <View style={styles.header}>
            <HeartPulse size={64} color={colors.primary} style={styles.logo} />
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue to CareMate</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Email or Mobile Number</Text>
            <InputField 
              placeholder="Enter your email or mobile"
              icon={User}
              autoCapitalize="none"
            />

            <Text style={styles.label}>Password</Text>
            <InputField 
              placeholder="Enter your password"
              icon={Lock}
              isPassword
            />

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <PrimaryButton 
              title="Sign In" 
              onPress={() => navigation.navigate('SignInSuccess')} 
            />
            
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity>
                <Text style={styles.signupLink}>Create Account</Text>
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
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: layout.padding,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    marginBottom: 24,
  },
  title: {
    ...typography.h2,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
  },
  form: {
    marginBottom: 32,
  },
  label: {
    ...typography.body,
    fontSize: 14,
    color: colors.textDark,
    marginBottom: 8,
    fontWeight: '500',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -8,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    marginTop: 20,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  signupText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  signupLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
