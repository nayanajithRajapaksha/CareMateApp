import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, Info, Shield, ShieldAlert, Droplet, Syringe, Bug } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme';
import { useLanguage } from '../i18n/LanguageContext';

export const EssentialVaccinesScreen: React.FC = () => {
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
        <TouchableOpacity style={styles.bellButton} onPress={() => navigation.navigate('Notification')}>
          <Bell color={colors.textDark || '#053130'} size={24} />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Hero Section with text overlay */}
        <View style={styles.heroImageContainer}>
          <Image 
            source={require('../../assets/essential_vaccinations.png')} 
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>{t('essentialVaccinesTitle')}</Text>
          </View>
        </View>

        <Text style={styles.introText}>
          {t('essentialVaccinesIntro')}
        </Text>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <Info color="#4A6261" size={20} />
          </View>
          <Text style={styles.infoText}>
            {t('essentialVaccinesDisclaimer')}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>{t('keyVaccinesOverview')}</Text>

        {/* BCG Card */}
        <View style={styles.vaccineCard}>
          <View style={styles.vaccineHeader}>
            <View style={styles.vaccineTitleRow}>
              <Syringe color="#117871" size={22} style={{ marginRight: 8 }} />
              <Text style={styles.vaccineTitle}>{t('bcgTitle')}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{t('bcgTiming')}</Text>
            </View>
          </View>
          <Text style={styles.vaccineDesc}>
            {t('bcgDesc')}
          </Text>
        </View>

        {/* Pentavalent Card */}
        <View style={styles.vaccineCard}>
          <View style={styles.vaccineHeader}>
            <View style={styles.vaccineTitleRow}>
              <ShieldAlert color="#117871" size={22} style={{ marginRight: 8 }} />
              <Text style={styles.vaccineTitle}>{t('pentavalentTitle')}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{t('pentavalentTiming')}</Text>
            </View>
          </View>
          <Text style={styles.vaccineDesc}>
            {t('pentavalentDesc')}
          </Text>
        </View>

        {/* Polio Card */}
        <View style={styles.vaccineCard}>
          <View style={styles.vaccineHeader}>
            <View style={styles.vaccineTitleRow}>
              <Droplet color="#117871" size={22} style={{ marginRight: 8 }} />
              <Text style={styles.vaccineTitle}>{t('polioTitle')}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: '#475569' }]}>
              <Text style={styles.badgeText}>{t('polioTiming')}</Text>
            </View>
          </View>
          <Text style={styles.vaccineDesc}>
            {t('polioDesc')}
          </Text>
        </View>

        {/* MMR Card */}
        <View style={styles.vaccineCard}>
          <View style={styles.vaccineHeader}>
            <View style={styles.vaccineTitleRow}>
              <Bug color="#117871" size={22} style={{ marginRight: 8 }} />
              <Text style={styles.vaccineTitle}>{t('mmrTitle')}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{t('mmrTiming')}</Text>
            </View>
          </View>
          <Text style={styles.vaccineDesc}>
            {t('mmrDesc')}
          </Text>
        </View>

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
    backgroundColor: '#FF5252',
    borderWidth: 1,
    borderColor: '#F4FAFA',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
  },
  heroImageContainer: {
    width: '100%',
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 20,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    justifyContent: 'flex-end',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  heroTitle: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  introText: {
    fontSize: 16,
    color: '#1E293B',
    lineHeight: 24,
    marginBottom: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#BDE3E5', // Light blue/cyan matching screenshot
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoIconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#4A6261',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#053130',
    marginBottom: 16,
  },
  vaccineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  vaccineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  vaccineTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vaccineTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#053130',
  },
  badge: {
    backgroundColor: '#117871', // Teal background
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  vaccineDesc: {
    fontSize: 15,
    color: '#4A6261',
    lineHeight: 22,
  }
});
