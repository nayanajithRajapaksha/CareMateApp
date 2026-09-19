import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, typography, layout } from '../theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  SignUp: undefined;
};

type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

interface Props {
  navigation: WelcomeScreenNavigationProp;
}

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={{ width: 140, height: 140 }}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Welcome to CareMate</Text>
        <Text style={styles.subtitle}>
          Supporting healthier families, every step of the way.
        </Text>

      </View>

      <View style={styles.footer}>
        <PrimaryButton 
          title="Get Started" 
          onPress={() => navigation.navigate('SignUp')} 
        />
        <View style={{ height: 16 }} />
        <PrimaryButton 
          title="Sign In" 
          variant="outline"
          onPress={() => navigation.navigate('SignIn')} 
        />
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
    alignItems: 'center',
    paddingHorizontal: layout.padding},
  logoContainer: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center'},
  title: {
    ...typography.h1,
    textAlign: 'center',
    marginBottom: 16},
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    paddingHorizontal: 20},
  footer: {
    paddingHorizontal: layout.padding,
    paddingBottom: 40}
});
