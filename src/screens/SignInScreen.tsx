import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { HeartPulse, User, Lock } from 'lucide-react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { InputField } from '../components/InputField';
import { colors, typography, layout } from '../theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';

type RootStackParamList = {
  SignIn: undefined;
  SignInSuccess: undefined;
};

type SignInScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignIn'>;

interface Props {
  navigation: SignInScreenNavigationProp;
}

export const SignInScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    setLoading(false);

    if (error) {
      Alert.alert('Sign In Failed', error.message);
    } else {
      navigation.navigate('SignInSuccess');
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
            <HeartPulse size={64} color={colors.primary} style={styles.logo} />
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue to CareMate</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Email Address</Text>
            <InputField 
              placeholder="Enter your email"
              icon={User}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Password</Text>
            <InputField 
              placeholder="Enter your password"
              icon={Lock}
              isPassword
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            {loading ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: 16 }} />
            ) : (
              <PrimaryButton 
                title="Sign In" 
                onPress={handleSignIn} 
              />
            )}
            
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
