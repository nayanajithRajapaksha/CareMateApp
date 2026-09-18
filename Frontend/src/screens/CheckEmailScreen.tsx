import React from 'react';
import { View, Text, StyleSheetTouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MailCheck } from 'lucide-react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, typography, layout } from '../theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  SignIn: undefined;
};

type CheckEmailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignIn'>;

interface Props {
  navigation: CheckEmailScreenNavigationProp;
}

export const CheckEmailScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <MailCheck color={colors.primary} size={40} />
          </View>

          <Text style={styles.title}>Check Your Email</Text>
          <Text style={styles.subtitle}>
            We've sent password reset instructions to your registered email address.
          </Text>
          
          <Text style={styles.emailText}>nad***@gmail.com</Text>

          <PrimaryButton 
            title="Open Email App" 
            onPress={() => console.log('Open Email App')} 
          />

          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.backButtonText}>Back to Sign In</Text>
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the email? </Text>
            <TouchableOpacity>
              <Text style={styles.resendLink}>Resend Email</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.timerText}>Resend in 00:45</Text>
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background},
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: layout.padding},
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2},
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E6F4F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24},
  title: {
    ...typography.h2,
    marginBottom: 16,
    textAlign: 'center'},
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: 24},
  emailText: {
    ...typography.h2,
    fontSize: 16,
    color: colors.primary,
    marginBottom: 32},
  backButton: {
    marginTop: 16,
    marginBottom: 32},
  backButtonText: {
    color: colors.textMuted,
    fontSize: 14},
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8},
  resendText: {
    color: colors.textMuted,
    fontSize: 12},
  resendLink: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: 'bold'},
  timerText: {
    color: colors.textMuted,
    fontSize: 12}
});
