import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { HeartPulse } from 'lucide-react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, typography, layout } from '../theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
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
          {/* Placeholder for the logo. A heart with a pulse fits the medical aesthetic */}
          <HeartPulse size={120} color={colors.primary} />
        </View>

        <Text style={styles.title}>Welcome to CareMate</Text>
        <Text style={styles.subtitle}>
          Supporting healthier families, every step of the way.
        </Text>

      </View>

      <View style={styles.footer}>
        <PrimaryButton 
          title="Get Started" 
          onPress={() => console.log('Get Started')} 
        />
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
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: layout.padding,
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.h1,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  footer: {
    paddingHorizontal: layout.padding,
    paddingBottom: 40,
  }
});
