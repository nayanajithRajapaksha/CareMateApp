import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, CheckCircle2, Info, Briefcase, Pill, PersonStanding, Leaf } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme';
import { useLanguage } from '../i18n/LanguageContext';

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
        <TouchableOpacity style={styles.bellButton}>
          <Bell color="#053130" size={24} />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Intro Section */}
        <Text style={styles.greenSubtitle}>The Essential Guide to Preconception Care</Text>
        <Text style={styles.introText}>
          Preparing your body for a healthy pregnancy starts well before conception. Discover the crucial steps for both partners to ensure optimal health.
        </Text>

        <Image 
          source={require('../../assets/preconception_cooking.jpg')}
          style={styles.heroImage}
          resizeMode="cover"
        />

        <Text style={styles.paragraph}>
          Preconception care is a vital, proactive approach to family planning that focuses on optimizing health and identifying potential risks before conception. It's not just for women; preconception health is equally important for men to ensure healthy sperm development and a supportive environment.
        </Text>

        <Text style={styles.sectionTitle}>Why Preconception Care Matters</Text>
        <Text style={styles.paragraph}>
          Many critical developments in fetal growth occur within the first few weeks of pregnancy often before a woman even realizes she is pregnant. By adopting healthy habits and addressing medical conditions early, you significantly reduce the risk of complications and birth defects.
        </Text>

        <Text style={styles.sectionTitle}>The Preconception Checklist</Text>

        {/* Checklist Cards */}
        {/* 1. Health Screenings */}
        <View style={styles.checklistCard}>
          <View style={styles.iconCircle}>
            <Briefcase color="#117871" size={20} />
          </View>
          <Text style={styles.cardTitle}>Health Screenings</Text>
          <View style={styles.checklistItem}>
            <CheckCircle2 color="#117871" size={16} style={styles.checkIcon} />
            <Text style={styles.checklistText}>Comprehensive blood panel & thyroid check.</Text>
          </View>
          <View style={styles.checklistItem}>
            <CheckCircle2 color="#117871" size={16} style={styles.checkIcon} />
            <Text style={styles.checklistText}>Screening for STIs and genetic carrier testing.</Text>
          </View>
          <View style={styles.checklistItem}>
            <CheckCircle2 color="#117871" size={16} style={styles.checkIcon} />
            <Text style={styles.checklistText}>Review of current medications and immunizations.</Text>
          </View>
        </View>

        {/* 2. Nutrition & Vitamins */}
        <View style={styles.checklistCard}>
          <View style={styles.iconCircle}>
            <Pill color="#117871" size={20} />
          </View>
          <Text style={styles.cardTitle}>Nutrition & Vitamins</Text>
          <View style={styles.checklistItem}>
            <CheckCircle2 color="#117871" size={16} style={styles.checkIcon} />
            <Text style={styles.checklistText}>Start a daily prenatal vitamin with 400mcg of Folic Acid.</Text>
          </View>
          <View style={styles.checklistItem}>
            <CheckCircle2 color="#117871" size={16} style={styles.checkIcon} />
            <Text style={styles.checklistText}>Ensure adequate Iron, Calcium, and Vitamin D intake.</Text>
          </View>
          <View style={styles.checklistItem}>
            <CheckCircle2 color="#117871" size={16} style={styles.checkIcon} />
            <Text style={styles.checklistText}>Adopt a balanced diet rich in leafy greens and lean proteins.</Text>
          </View>
        </View>

        {/* 3. Lifestyle Adjustments */}
        <View style={styles.checklistCard}>
          <View style={styles.iconCircle}>
            <PersonStanding color="#117871" size={20} />
          </View>
          <Text style={styles.cardTitle}>Lifestyle Adjustments</Text>
          <View style={styles.checklistItem}>
            <CheckCircle2 color="#117871" size={16} style={styles.checkIcon} />
            <Text style={styles.checklistText}>Eliminate alcohol, smoking, and recreational drugs.</Text>
          </View>
          <View style={styles.checklistItem}>
            <CheckCircle2 color="#117871" size={16} style={styles.checkIcon} />
            <Text style={styles.checklistText}>Limit caffeine intake to less than 200mg per day.</Text>
          </View>
          <View style={styles.checklistItem}>
            <CheckCircle2 color="#117871" size={16} style={styles.checkIcon} />
            <Text style={styles.checklistText}>Maintain a healthy weight through regular, moderate exercise.</Text>
          </View>
        </View>

        {/* 4. Environmental Factors */}
        <View style={styles.checklistCard}>
          <View style={styles.iconCircle}>
            <Leaf color="#117871" size={20} />
          </View>
          <Text style={styles.cardTitle}>Environmental Factors</Text>
          <View style={styles.checklistItem}>
            <CheckCircle2 color="#117871" size={16} style={styles.checkIcon} />
            <Text style={styles.checklistText}>Avoid exposure to toxic substances (e.g., strong cleaning chemicals).</Text>
          </View>
          <View style={styles.checklistItem}>
            <CheckCircle2 color="#117871" size={16} style={styles.checkIcon} />
            <Text style={styles.checklistText}>Manage stress levels with relaxation techniques or counseling.</Text>
          </View>
          <View style={styles.checklistItem}>
            <CheckCircle2 color="#117871" size={16} style={styles.checkIcon} />
            <Text style={styles.checklistText}>Discuss any workplace hazards with your healthcare provider.</Text>
          </View>
        </View>

        {/* Note for Partners */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <Info color="#117871" size={20} />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>A Note for Partners</Text>
            <Text style={styles.infoDescription}>
              Sperm generation takes about 74 days. Male partners should adopt healthier lifestyle choices—such as reducing alcohol, quitting smoking, and eating a balanced diet—at least three months before trying to conceive.
            </Text>
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
  bellButton: {
    padding: 5,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 5,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E74C3C',
    borderWidth: 1,
    borderColor: '#FFF',
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
