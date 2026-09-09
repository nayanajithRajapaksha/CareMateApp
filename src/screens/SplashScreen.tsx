import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { HeartPulse } from 'lucide-react-native';
import { colors, typography } from '../theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
};

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

interface Props {
  navigation: SplashScreenNavigationProp;
}

export const SplashScreen: React.FC<Props> = ({ navigation }) => {

  useEffect(() => {
    // Navigate to Welcome screen after 2.5 seconds
    const timer = setTimeout(() => {
      navigation.replace('Welcome');
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <HeartPulse size={140} color={colors.primary} />
          <Text style={styles.title}>CareMate</Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by trust</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    marginTop: 16,
    color: colors.primary,
    fontSize: 40,
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    ...typography.body,
    fontSize: 14,
    color: colors.textMuted,
  },
});
