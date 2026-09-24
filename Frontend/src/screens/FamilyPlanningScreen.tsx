import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Calendar, ArrowRight, Bell, ArrowLeft, Utensils, UtensilsCrossed } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme';
import { useLanguage } from '../i18n/LanguageContext';
import { NotificationIcon } from '../components/NotificationIcon';

export const FamilyPlanningScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useLanguage();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.canGoBack() && navigation.goBack()}>
          <ArrowLeft color={colors.textDark || '#053130'} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CareMate</Text>
        <NotificationIcon color={colors.textDark || '#053130'} size={24} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Main Card */}
        <View style={styles.mainCard}>
          <View style={styles.hubTag}>
            <Text style={styles.hubTagText}>{t('familyPlanningHub')}</Text>
          </View>
          
          <Text style={styles.heroTitle}>{t('welcomeSharedJourney')}</Text>
          <Text style={styles.heroDescription}>{t("heroDescriptionFP")}</Text>
          
          <TouchableOpacity style={styles.getStartedBtn}>
            <Text style={styles.getStartedText}>{t('getStarted')}</Text>
            <ArrowRight color="#FFFFFF" size={18} style={{marginLeft: 6}} />
          </TouchableOpacity>
          
          <Image 
            source={require('../../assets/family_planning.jpg')}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        {/* Feature Cards */}
        <TouchableOpacity style={styles.featureCard} onPress={() => navigation.navigate('PreconceptionCare')}>
          <View style={styles.iconCircle}>
            <Heart color={colors.primary || '#117871'} size={24} />
          </View>
          <Text style={styles.featureTitle}>{t('preconceptionCareTitle')}</Text>
          <Text style={styles.featureDescription}>{t('preconceptionCareDesc')}</Text>
          <View style={styles.featureFooter}>
            <Text style={styles.featureAction}>{t('exploreCare')}</Text>
            <ArrowRight color={colors.primary || '#117871'} size={16} />
          </View>
          <View style={styles.cardDecoration} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.featureCard} onPress={() => navigation.navigate('FamilyPlanningMethods')}>
          <View style={styles.iconCircle}>
            <Calendar color={colors.primary || '#117871'} size={24} />
          </View>
          <Text style={styles.featureTitle}>{t('familyPlanningMethodsTitle')}</Text>
          <Text style={styles.featureDescription}>{t('familyPlanningMethodsDesc')}</Text>
          <View style={styles.featureFooter}>
            <Text style={styles.featureAction}>{t('viewMethods')}</Text>
            <ArrowRight color={colors.primary || '#117871'} size={16} />
          </View>
          <View style={styles.cardDecoration} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.featureCard} onPress={() => navigation.navigate('NutritionGuide')}>
          <View style={styles.iconCircle}>
            <UtensilsCrossed color={colors.primary || '#117871'} size={24} />
          </View>
          <Text style={styles.featureTitle}>{t('nutritionLifestyleTitle')}</Text>
          <Text style={styles.featureDescription}>{t('nutritionLifestyleDesc')}</Text>
          <View style={styles.featureFooter}>
            <Text style={styles.featureAction}>{t('readGuide')}</Text>
            <ArrowRight color={colors.primary || '#117871'} size={16} />
          </View>
          <View style={styles.cardDecoration} />
        </TouchableOpacity>
        
        {/* Add bottom spacing */}
        <View style={{height: 40}}/>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FAFA', // Light cyan background to match the image
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
  mainCard: {
    backgroundColor: '#FAF7EF', // very pale beige/yellow for the main card background
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  hubTag: {
    backgroundColor: '#C5EBE9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  hubTagText: {
    color: '#0D6864',
    fontSize: 12,
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#053130',
    marginBottom: 12,
    lineHeight: 34,
  },
  heroDescription: {
    fontSize: 15,
    color: '#4A6261',
    lineHeight: 22,
    marginBottom: 24,
  },
  getStartedBtn: {
    backgroundColor: '#117871', // colors.primary
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 30,
  },
  getStartedText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  heroImage: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    overflow: 'hidden',
    position: 'relative',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D2EEED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#053130',
    marginBottom: 10,
  },
  featureDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 20,
  },
  featureFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureAction: {
    color: '#117871',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
  },
  cardDecoration: {
    position: 'absolute',
    bottom: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F4FAFA', // very light teal decoration bubble
    zIndex: -1, // Keep behind text
  },
});
