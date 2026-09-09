import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { HeartPulse, CheckCircle2 } from 'lucide-react-native';
import { colors, typography } from '../theme';

export const SignInSuccessScreen: React.FC = () => {

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        <View style={styles.logoContainer}>
          <HeartPulse size={120} color={colors.primary} />
        </View>

        <View style={styles.successIconContainer}>
          <CheckCircle2 size={64} color={colors.primary} />
        </View>

        <Text style={styles.title}>Sign In Successful</Text>
        <Text style={styles.subtitle}>
          Welcome back to CareMate. Taking you to your dashboard...
        </Text>

        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIconContainer: {
    marginBottom: 24,
  },
  title: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  }
});
