import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, Info, Syringe } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../i18n/LanguageContext';
import { colors, typography, layout } from '../theme';

const milestones = [
  {
    age: 'Birth',
    tag: 'Hospital',
    tagColor: '#2B837F',
    vaccines: [
      { name: 'Hepatitis B (HepB)', dose: 'Dose 1' }
    ]
  },
  {
    age: '2M',
    title: '2 Months',
    tag: 'Clinic',
    tagColor: '#B6D7D7',
    tagTextColor: '#4A6261',
    vaccines: [
      { name: 'HepB', dose: 'Dose 2 (1-2 mos)' },
      { name: 'RV (Rotavirus)', dose: 'Dose 1' },
      { name: 'DTaP', dose: 'Dose 1' },
      { name: 'Hib', dose: 'Dose 1' },
      { name: 'PCV13 or PCV15', dose: 'Dose 1' },
      { name: 'IPV (Polio)', dose: 'Dose 1' },
    ]
  },
  {
    age: '4M',
    title: '4 Months',
    tag: 'Clinic',
    tagColor: '#B6D7D7',
    tagTextColor: '#4A6261',
    vaccines: [
      { name: 'RV (Rotavirus)', dose: 'Dose 2' },
      { name: 'DTaP', dose: 'Dose 2' },
      { name: 'Hib', dose: 'Dose 2' },
      { name: 'PCV13 or PCV15', dose: 'Dose 2' },
      { name: 'IPV (Polio)', dose: 'Dose 2' },
    ]
  },
  {
    age: '6M',
    title: '6 Months',
    tag: 'Clinic',
    tagColor: '#B6D7D7',
    tagTextColor: '#4A6261',
    vaccines: [
      { name: 'HepB', dose: 'Dose 3 (6-18 mos)' },
      { name: 'DTaP', dose: 'Dose 3' },
      { name: 'PCV13 or PCV15', dose: 'Dose 3' },
      { name: 'Influenza', dose: 'Annual (1-2 doses)' },
    ]
  }
];

export const VaccineMilestonesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useLanguage();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#053130" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CareMate</Text>
        <TouchableOpacity style={styles.bellButton}>
          <Bell color="#053130" size={24} />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Title Section */}
        <Text style={styles.pageTitle}>Vaccination Milestones</Text>
        <Text style={styles.pageSubtitle}>
          A comprehensive guide for your child's first 5 years of immunizations.
        </Text>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <Info color="#117871" size={20} />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Why Vaccinate?</Text>
            <Text style={styles.infoDescription}>
              Vaccines protect your child from serious diseases. Always consult with your pediatrician to personalize this schedule based on your child's specific health needs.
            </Text>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.timelineContainer}>
          {milestones.map((milestone, index) => {
            const isLast = index === milestones.length - 1;

            return (
              <View key={index} style={styles.timelineRow}>
                {/* Timeline Line & Circle */}
                <View style={styles.timelineLeft}>
                  <View style={styles.ageCircle}>
                    <Text style={styles.ageCircleText}>{milestone.age}</Text>
                  </View>
                  {!isLast && <View style={styles.timelineLine} />}
                </View>

                {/* Milestone Card */}
                <View style={styles.milestoneCard}>
                  <View style={styles.milestoneHeader}>
                    <Text style={styles.milestoneTitle}>{milestone.title || milestone.age}</Text>
                    <View style={[styles.tagBadge, { backgroundColor: milestone.tagColor }]}>
                      <Text style={[styles.tagText, { color: milestone.tagTextColor || '#FFF' }]}>
                        {milestone.tag}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.vaccineList}>
                    {milestone.vaccines.map((vaccine, vIndex) => (
                      <View key={vIndex} style={styles.vaccineItem}>
                        <Syringe color="#117871" size={18} style={styles.vaccineIcon} />
                        <View>
                          <Text style={styles.vaccineName}>{vaccine.name}</Text>
                          <Text style={styles.vaccineDose}>{vaccine.dose}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            );
          })}
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
    backgroundColor: '#F4FAFA', // Light cyan background
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
  pageTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#053130',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 15,
    color: '#4A6261',
    lineHeight: 22,
    marginBottom: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E8F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#D4ECEC',
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
    color: '#117871',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: '#4A6261',
    lineHeight: 20,
  },
  timelineContainer: {
    paddingLeft: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelineLeft: {
    width: 40,
    alignItems: 'center',
    marginRight: 16,
  },
  ageCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#117871',
    backgroundColor: '#F4FAFA',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  ageCircleText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#117871',
  },
  timelineLine: {
    position: 'absolute',
    top: 36,
    bottom: -36, // extend to next circle
    width: 2,
    backgroundColor: '#D4ECEC',
    zIndex: 1,
  },
  milestoneCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  milestoneTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#053130',
  },
  tagBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  vaccineList: {
    gap: 16,
  },
  vaccineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  vaccineIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  vaccineName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#053130',
    marginBottom: 2,
  },
  vaccineDose: {
    fontSize: 13,
    color: '#4A6261',
  },
});
