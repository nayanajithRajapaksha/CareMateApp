import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { ChevronLeft, Circle, CheckCircle2 } from 'lucide-react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, typography, layout } from '../theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Splash: undefined;
  Language: undefined;
  Welcome: undefined;
};

type LanguageScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Language'>;

interface Props {
  navigation: LanguageScreenNavigationProp;
}

export const LanguageScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const languages = [
    { id: 'en', code: 'En', name: 'English', subtitle: 'Default' },
    { id: 'si', code: 'සි', name: 'සිංහල', subtitle: 'Sinhala' },
    { id: 'ta', code: 'த', name: 'தமிழ்', subtitle: 'Tamil' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft color={colors.primary} size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Select Language</Text>
        <Text style={styles.subtitle}>Choose your preferred language to continue using CareMate.</Text>

        <View style={styles.list}>
          {languages.map((lang) => {
            const isSelected = selectedLanguage === lang.name;
            return (
              <TouchableOpacity
                key={lang.id}
                style={[styles.languageCard, isSelected && styles.languageCardSelected]}
                onPress={() => setSelectedLanguage(lang.name)}
                activeOpacity={0.7}
              >
                <View style={styles.iconContainer}>
                  <Text style={styles.iconText}>{lang.code}</Text>
                </View>
                
                <View style={styles.textContainer}>
                  <Text style={styles.languageName}>{lang.name}</Text>
                  <Text style={styles.languageSubtitle}>{lang.subtitle}</Text>
                </View>
                
                {isSelected ? (
                  <CheckCircle2 color={colors.primary} size={24} />
                ) : (
                  <Circle color={colors.border} size={24} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton 
          title="Continue →" 
          onPress={() => navigation.navigate('Welcome')} 
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
  header: {
    paddingHorizontal: layout.padding,
    paddingTop: 16,
    paddingBottom: 24,
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
  content: {
    flex: 1,
    paddingHorizontal: layout.padding,
  },
  title: {
    ...typography.h1,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    marginBottom: 32,
  },
  list: {
    gap: 16,
  },
  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: layout.borderRadius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  languageCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#E6F4F4', // Light teal tint
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  textContainer: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  languageSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: layout.padding,
    paddingBottom: 40,
  }
});
