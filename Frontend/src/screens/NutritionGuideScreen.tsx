import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bookmark, Share2, Lightbulb, TriangleAlert, CupSoda } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../i18n/LanguageContext';

export const NutritionGuideScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useLanguage();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#053130" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("nutritionHeaderTitle")}</Text>
        
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} bounces={false}>
        
        {/* Hero Image */}
        <Image 
          source={require('../../assets/toddler_nutrition_plate.jpg')}
          style={styles.heroImage}
          resizeMode="cover"
        />

        <View style={styles.contentPadding}>
          {/* Tags */}
          <View style={styles.tagsContainer}>
            <View style={styles.tagBadge}>
              <Text style={styles.tagText}>Nutrition</Text>
            </View>
            <View style={styles.tagBadge}>
              <Text style={styles.tagText}>1-3 Years</Text>
            </View>
          </View>

          {/* Title & Author */}
          <Text style={styles.articleTitle}>{t("nutritionTitle")}</Text>
          <View style={styles.authorRow}>
            <View style={styles.authorAvatar}>
              <Text style={styles.authorInitial}>Dr</Text>
            </View>
            <Text style={styles.authorText}>{t("nutritionAuthor")}</Text>
          </View>

          {/* Text Content */}
          <Text style={styles.paragraph}>{t("nutritionP1")}</Text>

          <Text style={styles.subHeading}>{t("nutritionH2_1")}</Text>
          <Text style={styles.paragraph}>{t("nutritionP2")}</Text>

          {/* Bullet List */}
          <View style={styles.bulletItem}>
            <Text style={styles.paragraph}>
              <Text style={styles.boldText}>{t("nutritionL1Bold")}</Text>{t("nutritionL1Desc")}</Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.paragraph}>
              <Text style={styles.boldText}>{t("nutritionL2Bold")}</Text>{t("nutritionL2Desc")}</Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.paragraph}>
              <Text style={styles.boldText}>{t("nutritionL3Bold")}</Text>{t("nutritionL3Desc")}</Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.paragraph}>
              <Text style={styles.boldText}>{t("nutritionL4Bold")}</Text>{t("nutritionL4Desc")}</Text>
          </View>

          {/* Key Tip Box */}
          <View style={styles.tipBox}>
            <View style={styles.tipHeader}>
              <Lightbulb color="#117871" size={18} style={{ marginRight: 8 }} />
              <Text style={styles.tipTitle}>{t("nutritionTipTitle")}</Text>
            </View>
            <Text style={styles.tipText}>{t("nutritionTipDesc")}</Text>
          </View>

          <Text style={styles.subHeading}>{t("nutritionH2_2")}</Text>
          <Text style={styles.paragraph}>{t("nutritionP3")}</Text>

          {/* Hazard Cards */}
          <View style={styles.hazardCard}>
            <View style={styles.hazardHeader}>
              <TriangleAlert color="#E74C3C" size={18} style={{ marginRight: 8 }} />
              <Text style={styles.hazardTitleRed}>{t("nutritionHazard1Title")}</Text>
            </View>
            <Text style={styles.hazardText}>{t("nutritionHazard1Desc")}</Text>
          </View>

          <View style={styles.hazardCard}>
            <View style={styles.hazardHeader}>
              <CupSoda color="#475569" size={18} style={{ marginRight: 8 }} />
              <Text style={styles.hazardTitleBlue}>{t("nutritionHazard2Title")}</Text>
            </View>
            <Text style={styles.hazardText}>{t("nutritionHazard2Desc")}</Text>
          </View>

          

          <View style={{ height: 60 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FAFA', // Light cyan background matching screenshot
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F4FAFA',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#117871', // teal title in header
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 6,
    marginLeft: 8,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroImage: {
    width: '100%',
    height: 250,
  },
  contentPadding: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tagBadge: {
    backgroundColor: '#D2EEED',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
  },
  tagText: {
    fontSize: 12,
    color: '#117871',
    fontWeight: '600',
  },
  articleTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#053130',
    lineHeight: 34,
    marginBottom: 16,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  authorAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  authorInitial: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  authorText: {
    fontSize: 13,
    color: '#475569',
  },
  paragraph: {
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 22,
    marginBottom: 20,
  },
  subHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#053130',
    marginTop: 8,
    marginBottom: 12,
  },
  bulletItem: {
    marginBottom: -4, // Counteract paragraph margin for tight list
  },
  boldText: {
    fontWeight: 'bold',
    color: '#053130',
  },
  tipBox: {
    backgroundColor: '#D2EEED',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#053130',
  },
  tipText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  hazardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  hazardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  hazardTitleRed: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E74C3C',
  },
  hazardTitleBlue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#475569',
  },
  hazardText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  actionButtonsContainer: {
    marginTop: 20,
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#117871',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  shareButton: {
    backgroundColor: '#D2EEED',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  shareButtonText: {
    color: '#117871',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
