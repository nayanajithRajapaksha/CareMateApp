import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, Thermometer, Heart, AlertCircle, CheckCircle2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme';
import { useLanguage } from '../i18n/LanguageContext';
import { NotificationIcon } from '../components/NotificationIcon';

export const AfterVaccineScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useLanguage();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color={colors.textDark || '#053130'} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CareMate</Text>
        <NotificationIcon color={colors.textDark || '#053130'} size={24} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>{t('afterVaccineTitle')}</Text>
          <Text style={styles.subTitle}>
            A practical guide for parents on managing post-vaccination side effects, ensuring your child's comfort and your peace of mind.
          </Text>
        </View>

        {/* Hero Image */}
        <View style={styles.heroImageContainer}>
          <Image 
            source={require('../../assets/after_vaccine.png')} 
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        {/* Common Mild Reactions Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: '#CBEBE9' }]}>
              <Thermometer color="#117871" size={20} />
            </View>
            <Text style={styles.cardTitle}>{t('commonMildReactions')}</Text>
          </View>
          
          <Text style={styles.cardDescription}>
            It's completely normal for your child to experience some mild side effects after a vaccination. This indicates their immune system is working.
          </Text>

          <View style={styles.listItem}>
            <CheckCircle2 color="#117871" size={20} style={styles.listIcon} />
            <View style={styles.listTextContainer}>
              <Text style={styles.listTitle}>{t('slightFever')}</Text>
              <Text style={styles.listDesc}>{t('slightFeverDesc')}</Text>
            </View>
          </View>

          <View style={styles.listItem}>
            <CheckCircle2 color="#117871" size={20} style={styles.listIcon} />
            <View style={styles.listTextContainer}>
              <Text style={styles.listTitle}>{t('sorenessRedness')}</Text>
              <Text style={styles.listDesc}>{t('sorenessRednessDesc')}</Text>
            </View>
          </View>

          <View style={styles.listItem}>
            <CheckCircle2 color="#117871" size={20} style={styles.listIcon} />
            <View style={styles.listTextContainer}>
              <Text style={styles.listTitle}>{t('fussinessFatigue')}</Text>
              <Text style={styles.listDesc}>{t('fussinessFatigueDesc')}</Text>
            </View>
          </View>
        </View>

        {/* How to Soothe Card */}
        <View style={[styles.card, { backgroundColor: '#F0F9F8', borderColor: '#D4ECEC' }]}>
          <View style={styles.cardHeader}>
            <Heart color="#117871" size={24} style={{ marginRight: 12 }} />
            <Text style={styles.cardTitle}>{t('howToSoothe')}</Text>
          </View>

          <View style={styles.sootheBlock}>
            <Text style={styles.sootheTitle}>{t('extraComfort')}</Text>
            <Text style={styles.sootheDesc}>{t('extraComfortDesc')}</Text>
          </View>

          <View style={styles.sootheBlock}>
            <Text style={styles.sootheTitle}>{t('coolCompress')}</Text>
            <Text style={styles.sootheDesc}>{t('coolCompressDesc')}</Text>
          </View>

          <View style={styles.sootheBlock}>
            <Text style={styles.sootheTitle}>{t('hydration')}</Text>
            <Text style={styles.sootheDesc}>{t('hydrationDesc')}</Text>
          </View>
        </View>

        {/* When to Call a Doctor Card */}
        <View style={[styles.card, { backgroundColor: '#FEF2F2', borderColor: '#FEE2E2' }]}>
          <View style={styles.cardHeader}>
            <AlertCircle color="#DC2626" size={24} style={{ marginRight: 12 }} />
            <Text style={[styles.cardTitle, { color: '#053130' }]}>{t('whenToCallDoctor')}</Text>
          </View>

          <Text style={[styles.cardDescription, { color: '#4A6261', marginBottom: 16 }]}>
            While most reactions are mild, seek medical advice if you notice any of the following:
          </Text>

          <View style={styles.alertItem}>
            <View style={styles.alertDot} />
            <Text style={styles.alertText}>{t('feverAbove104')}</Text>
          </View>

          <View style={styles.alertItem}>
            <View style={styles.alertDot} />
            <Text style={styles.alertText}>{t('cryingContinuously')}</Text>
          </View>

          <View style={styles.alertItem}>
            <View style={styles.alertDot} />
            <Text style={styles.alertText}>{t('seizuresUnresponsive')}</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FAFA', // Light cyan background matching screenshots
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
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  titleSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#053130',
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 15,
    color: '#4A6261',
    lineHeight: 22,
  },
  heroImageContainer: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#053130',
  },
  cardDescription: {
    fontSize: 15,
    color: '#4A6261',
    lineHeight: 22,
    marginBottom: 20,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  listIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  listTextContainer: {
    flex: 1,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#053130',
    marginBottom: 4,
  },
  listDesc: {
    fontSize: 14,
    color: '#4A6261',
    lineHeight: 20,
  },
  sootheBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D4ECEC',
  },
  sootheTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#117871',
    marginBottom: 6,
  },
  sootheDesc: {
    fontSize: 14,
    color: '#4A6261',
    lineHeight: 20,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
    marginRight: 12,
  },
  alertText: {
    fontSize: 15,
    color: '#053130',
    fontWeight: '500',
  }
});
