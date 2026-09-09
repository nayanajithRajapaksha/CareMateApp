import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { User, Lock, Mail, Phone, ChevronLeft } from 'lucide-react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { InputField } from '../components/InputField';
import { colors, typography, layout } from '../theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Welcome: undefined;
  SignUp: undefined;
  SignIn: undefined;
  SignInSuccess: undefined;
};

type SignUpScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignUp'>;

interface Props {
  navigation: SignUpScreenNavigationProp;
}

export const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !contactNumber || !password) {
      Alert.alert('Validation Error', 'Please fill in all fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters long.');
      return;
    }

    if (contactNumber.length < 9) {
      Alert.alert('Validation Error', 'Please enter a valid contact number.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://192.168.8.222:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          full_name: name,
          email: email.toLowerCase().trim(), 
          contact_number: contactNumber,
          password 
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      navigation.navigate('SignInSuccess');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join CareMate to manage your child's health.</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Full Name</Text>
            <InputField 
              placeholder="Enter your full name"
              icon={User}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Email Address</Text>
            <InputField 
              placeholder="Enter your email"
              icon={Mail}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>Contact Number</Text>
            <InputField 
              placeholder="Enter your mobile number"
              icon={Phone}
              keyboardType="phone-pad"
              value={contactNumber}
              onChangeText={setContactNumber}
            />

            <Text style={styles.label}>Password</Text>
            <InputField 
              placeholder="Create a password"
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
                title="Sign Up" 
                onPress={handleSignUp} 
              />
            )}
            
            <View style={styles.signinContainer}>
              <Text style={styles.signinText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                <Text style={styles.signinLink}>Sign In</Text>
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
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: layout.padding,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    marginBottom: 32,
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
  footer: {
    marginTop: 'auto',
  },
  signinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  signinText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  signinLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
