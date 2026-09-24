import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bookmark, Share2, Info, MapPin, CheckCircle2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../i18n/LanguageContext';

export const FamilyPlanningMethodsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useLanguage();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#053130" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("fpMethodsHeader")}</Text>
        
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} bounces={false}>
        
        {/* Hero Image */}
        <Image 
          source={require('../../assets/family_planning_hands.png')}
          style={styles.heroImage}
          resizeMode="cover"
        />

        <View style={styles.contentPadding}>
          {/* Tags */}
          <View style={styles.tagsContainer}>
            <View style={styles.tagBadge}>
              <Text style={styles.tagText}>Family Planning</Text>
            </View>
            <View style={styles.tagBadge}>
              <Text style={styles.tagText}>Wellness</Text>
            </View>
          </View>

          {/* Title & Author */}
          <Text style={styles.articleTitle}>{t("fpMethodsTitle")}</Text>
          <View style={styles.authorRow}>
            <View style={styles.authorAvatar}>
              <Text style={styles.authorInitial}>CM</Text>
            </View>
            <Text style={styles.authorText}>By CareMate • 4 min read</Text>
          </View>

          {/* Text Content */}
          <Text style={styles.paragraph}>{t("fpMethodsP1")}</Text>

          <Text style={styles.subHeading}>{t("fpMethodsH2_1")}</Text>
          <Text style={styles.paragraph}>{t("fpMethodsP2")}</Text>
          <Text style={styles.paragraph}>{t("fpMethodsP3")}</Text>

          <Text style={styles.subHeading}>{t("fpMethodsH2_2")}</Text>
          <Text style={styles.paragraph}>{t("fpMethodsP4")}</Text>

          {/* Bullet List */}
          <View style={styles.bulletItem}>
            <CheckCircle2 color="#117871" size={16} style={styles.checkIcon} />
            <Text style={styles.listText}>
              <Text style={styles.boldText}>{t("fpMethodsL1Bold")}</Text>{t("fpMethodsL1Desc")}</Text>
          </View>
          <View style={styles.bulletItem}>
            <CheckCircle2 color="#117871" size={16} style={styles.checkIcon} />
            <Text style={styles.listText}>
              <Text style={styles.boldText}>{t("fpMethodsL2Bold")}</Text>{t("fpMethodsL2Desc")}</Text>
          </View>
          <View style={styles.bulletItem}>
            <CheckCircle2 color="#117871" size={16} style={styles.checkIcon} />
            <Text style={styles.listText}>
              <Text style={styles.boldText}>{t("fpMethodsL3Bold")}</Text>{t("fpMethodsL3Desc")}</Text>
          </View>
          <View style={styles.bulletItem}>
            <CheckCircle2 color="#117871" size={16} style={styles.checkIcon} />
            <Text style={styles.listText}>
              <Text style={styles.boldText}>{t("fpMethodsL4Bold")}</Text>{t("fpMethodsL4Desc")}</Text>
          </View>
          <View style={styles.bulletItem}>
            <CheckCircle2 color="#117871" size={16} style={styles.checkIcon} />
            <Text style={styles.listText}>
              <Text style={styles.boldText}>{t("fpMethodsL5Bold")}</Text>{t("fpMethodsL5Desc")}</Text>
          </View>

          <Text style={[styles.paragraph, {marginTop: 12}]}>{t("fpMethodsP5")}</Text>

          <Text style={styles.subHeading}>{t("fpMethodsH2_3")}</Text>
          <Text style={styles.paragraph}>{t("fpMethodsP6")}</Text>
          <Text style={styles.paragraph}>{t("fpMethodsP7")}</Text>

          {/* Info Cards */}
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <MapPin color="#117871" size={20} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>{t("fpMethodsSupportTitle")}</Text>
              <Text style={styles.infoDescription}>{t("fpMethodsSupportDesc")}</Text>
            </View>
          </View>

          <View style={[styles.infoCard, { backgroundColor: '#E8F5F5', borderColor: '#D4ECEC' }]}>
            <View style={styles.infoIconContainer}>
              <Info color="#117871" size={20} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>{t("fpMethodsNextStepTitle")}</Text>
              <Text style={styles.infoDescription}>{t("fpMethodsNextStepDesc")}</Text>
            </View>
          </View>
          
          <Text style={styles.disclaimerText}>{t("fpMethodsDisclaimer")}</Text>

          

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
    color: '#117871',
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  checkIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  listText: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 22,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#053130',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#D2EEED',
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
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
  disclaimerText: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  actionButtonsContainer: {
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
