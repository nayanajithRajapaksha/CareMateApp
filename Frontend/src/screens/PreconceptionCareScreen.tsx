import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, CheckCircle2, Info, Briefcase, Pill, PersonStanding, Leaf } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme';
import { useLanguage } from '../i18n/LanguageContext';
import { NotificationIcon } from '../components/NotificationIcon';

export const PreconceptionCareScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useLanguage();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.canGoBack() && navigation.goBack()}>
          <ArrowLeft color="#053130" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CareMate</Text>
        <NotificationIcon color="#053130" size={24} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Intro Section */}
        <Text style={styles.greenSubtitle}>{t("preconceptionSubtitle")}</Text>
        <Text style={styles.introText}>{t("preconceptionIntroText")}</Text>

        <Image 
          source={require('../../assets/preconception_cooking.jpg')}
          style={styles.heroImage}
          resizeMode="cover"
        />

        <Text style={styles.paragraph}>{t("preconceptionPara1")}</Text>

        <Text style={styles.sectionTitle}>{t("preconceptionWhyMatters")}</Text>
        <Text style={styles.paragraph}>{t("preconceptionPara2")}</Text>

        <Text style={styles.sectionTitle}>{t("preconceptionChecklist")}</Text>

        {/* Checklist Cards */}
        {/* 1. Health Screenings */}
        <View style={styles.checklistCard}>
          <View style={styles.iconCircle}>
            <Briefcase color="#117871" size={20} />
          </View>
          <Text style={styles.cardTitle}>{t("preconceptionHealthScreenings")}</Text>
          <View style={styles.checklistItem}>
            <CheckCircle2 color="#117871" size={16} style={styles.checkIcon} />
            <Text style={styles.checklistText}>{t("preconceptionCheck1")}</Text>
          </View>
          <View style={styles.checklistItem}>
            <CheckCircle2 color="#117871" size={16} style={styles.checkIcon} />
            <Text style={styles.checklistText}>{t("preconceptionCheck2")}</Text>
          </View>
          <View style={styles.checklistItem}>
            <CheckCircle2 color="#117871" size={16} style={styles.checkIcon} />
            <Text style={styles.checklistText}>{t("preconceptionCheck3")}</Text>
          </View>
        </View>

        {/* 2. Nutrition & Vitamins */}
        <View style={styles.checklistCard}>
          <View style={styles.iconCircle}>
            <Pill color="#117871" size={20} />
          </View>
          <Text style={styles.cardTitle}>{t("preconceptionNutritionVitamins")}</Text>
          <View style={styles.checklistItem}>
            <CheckCircle2 color="#117871" size={16} style={styles.checkIcon} />
            <Text style={styles.checklistText}>{t("preconceptionCheck4")}</Text>
          </View>
          <View style={styles.checklistItem}>
            <CheckCircle2 color="#117871" size={16} style={styles.checkIcon} />
            <Text style={styles.checklistText}>{t("preconceptionCheck5")}</Text>
          </View>
          <View style={styles.checklistItem}>
            <CheckCircle2 color="#117871" size={16} style={styles.checkIcon} />
            <Text style={styles.checklistText}>{t("preconceptionCheck6")}</Text>
          </View>
        </View>

        {/* 3. Lifestyle Adjustments */}
        <View style={styles.checklistCard}>
          <View style={styles.iconCircle}>
            <PersonStanding color="#117871" size={20} />
          </View>
          <Text style={styles.cardTitle}>{t("preconceptionLifestyle")}</Text>
          <View style={styles.checklistItem}>
            <CheckCircle2 color="#117871" size={16} style={styles.checkIcon} />
            <Text style={styles.checklistText}>{t("preconceptionCheck7")}</Text>
          </View>
          <View style={styles.checklistItem}>
            <CheckCircle2 color="#117871" size={16} style={styles.checkIcon} />
            <Text style={styles.checklistText}>{t("preconceptionCheck8")}</Text>
          </View>
          <View style={styles.checklistItem}>
            <CheckCircle2 color="#117871" size={16} style={styles.checkIcon} />
            <Text style={styles.checklistText}>{t("preconceptionCheck9")}</Text>
          </View>
        </View>

        {/* 4. Environmental Factors */}
        <View style={styles.checklistCard}>
          <View style={styles.iconCircle}>
            <Leaf color="#117871" size={20} />
          </View>
          <Text style={styles.cardTitle}>{t("preconceptionEnvironment")}</Text>
          <View style={styles.checklistItem}>
            <CheckCircle2 color="#117871" size={16} style={styles.checkIcon} />
            <Text style={styles.checklistText}>{t("preconceptionCheck10")}</Text>
          </View>
          <View style={styles.checklistItem}>
            <CheckCircle2 color="#117871" size={16} style={styles.checkIcon} />
            <Text style={styles.checklistText}>{t("preconceptionCheck11")}</Text>
          </View>
          <View style={styles.checklistItem}>
            <CheckCircle2 color="#117871" size={16} style={styles.checkIcon} />
            <Text style={styles.checklistText}>{t("preconceptionCheck12")}</Text>
          </View>
        </View>

        {/* Note for Partners */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <Info color="#117871" size={20} />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>{t("preconceptionPartnersNote")}</Text>
            <Text style={styles.infoDescription}>{t("preconceptionPartnersDesc")}</Text>
          </View>
        </View>
        
        {/* Extra spacing at bottom */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#F4FAFA',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#053130',
  },
  scrollContent: {
    padding: 20,
  },
  greenSubtitle: {
    color: '#117871',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  introText: {
    fontSize: 15,
    color: '#4A6261',
    lineHeight: 22,
    marginBottom: 20,
  },
  heroImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 20,
  },
  paragraph: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#117871',
    marginBottom: 12,
  },
  checklistCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D2EEED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#117871',
    marginBottom: 12,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  checkIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  checklistText: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#D2EEED',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#B6D7D7',
  },
  infoIconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#053130',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 13,
    color: '#4A6261',
    lineHeight: 20,
  },
});
