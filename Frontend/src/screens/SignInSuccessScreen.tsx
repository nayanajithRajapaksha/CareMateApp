import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import { colors, typography } from '../theme';

import { useNavigation } from '@react-navigation/native';

export const SignInSuccessScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  // Simple bouncing animation for the 3 dots
  const dot1 = new Animated.Value(0);
  const dot2 = new Animated.Value(0);
  const dot3 = new Animated.Value(0);

  useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot, { toValue: -10, duration: 300, delay, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(400)
        ])
      ).start();
    };

    animateDot(dot1, 0);
    animateDot(dot2, 150);
    animateDot(dot3, 300);

    const timer = setTimeout(() => {
      navigation.replace('Main');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={{ width: 160, height: 160 }}
            resizeMode="contain"
          />
        </View>

        <View style={styles.successIconContainer}>
          <Check color={colors.white} size={32} strokeWidth={3} />
        </View>

        <Text style={styles.title}>Sign In Successful</Text>
        <Text style={styles.subtitle}>
          Welcome back to CareMate. Taking you to your dashboard...
        </Text>

        <View style={styles.dotsContainer}>
          <Animated.View style={[styles.dot, { transform: [{ translateY: dot1 }] }]} />
          <Animated.View style={[styles.dot, { transform: [{ translateY: dot2 }] }]} />
          <Animated.View style={[styles.dot, { transform: [{ translateY: dot3 }] }]} />
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FAFA'},
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24},
  logoContainer: {
    marginBottom: 24},
  successIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32},
  title: {
    ...typography.h1,
    marginBottom: 12,
    textAlign: 'center'},
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    color: colors.textMuted,
    paddingHorizontal: 16,
    marginBottom: 40},
  dotsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20},
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary}
});
