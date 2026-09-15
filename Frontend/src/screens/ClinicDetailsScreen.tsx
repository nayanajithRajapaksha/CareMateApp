import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { ArrowLeft, Star, MapPin, Phone, CornerUpRight, Syringe, Activity, Baby, ShieldPlus } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, layout } from '../theme';

const { width } = Dimensions.get('window');

const SERVICES = [
  { id: '1', name: 'Vaccinations', icon: Syringe },
  { id: '2', name: 'Growth Monitoring', icon: Activity },
  { id: '3', name: 'Pre-natal Care', icon: Baby },
  { id: '4', name: 'General Pediatrics', icon: ShieldPlus },
];

const SPECIALISTS = [
  {
    id: '1',
    name: 'Dr. Ayesha Fernando',
    role: 'Senior Pediatrician',
    image: 'https://i.pravatar.cc/150?img=32',
    days: 'Mon, Wed, Fri',
    time: 'Morning',
    actionText: 'Book Appointment',
    isPrimary: true
  },
  {
    id: '2',
    name: 'Mr. Nuwan Perera',
    role: 'Public Health Officer (PHM)',
    image: 'https://i.pravatar.cc/150?img=11',
    days: 'Tue, Thu',
    time: 'All Day',
    actionText: 'View Schedule',
    isPrimary: false
  }
];

export const ClinicDetailsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  
  // Can use route.params.clinic if passed from SelectClinicScreen
  const clinicName = route.params?.clinic?.name || 'Maternal & Child Health Clinic';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color={colors.textDark} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Clinic Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Image Section */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1000&auto=format&fit=crop' }} 
            style={styles.clinicImage} 
          />
          <View style={styles.imageOverlay} />
          <View style={styles.imageTextContainer}>
            <Text style={styles.clinicTitle}>{clinicName}</Text>
            <View style={styles.ratingRow}>
              <Star color="#34D399" size={14} fill="#34D399" />
              <Text style={styles.ratingText}>4.5/5 • Colombo 07</Text>
            </View>
          </View>
        </View>

        {/* Info Card (overlapping image) */}
        <View style={styles.infoCard}>
          <View style={styles.locationRow}>
            <View style={styles.locationIconBg}>
              <MapPin color={colors.primary} size={20} />
            </View>
            <View style={styles.locationTextContainer}>
              <Text style={styles.addressText}>No. 12, Ward Place, Colombo 07</Text>
              <Text style={styles.hoursText}>Open today: 08:00 AM - 05:00 PM</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIconCircle}>
                <Phone color={colors.textDark} size={20} />
              </View>
              <Text style={styles.actionButtonText}>Call</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIconCircle}>
                <CornerUpRight color={colors.textDark} size={20} />
              </View>
              <Text style={styles.actionButtonText}>Directions</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Services Offered */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services Offered</Text>
          <View style={styles.servicesGrid}>
            {SERVICES.map(service => (
              <View key={service.id} style={styles.serviceItem}>
                <service.icon color={colors.primary} size={20} style={{marginRight: 10}} />
                <Text style={styles.serviceText}>{service.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Available Specialists */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Specialists</Text>
          <View style={styles.specialistsList}>
            {SPECIALISTS.map(specialist => (
              <View key={specialist.id} style={styles.specialistCard}>
                <View style={styles.specialistHeaderRow}>
                  <Image source={{ uri: specialist.image }} style={styles.specialistImage} />
                  <View style={styles.specialistInfo}>
                    <Text style={styles.specialistName}>{specialist.name}</Text>
                    <Text style={styles.specialistRole}>{specialist.role}</Text>
                    <View style={styles.badgeRow}>
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{specialist.days}</Text>
                      </View>
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{specialist.time}</Text>
                      </View>
                    </View>
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={[
                    styles.specialistActionBtn, 
                    specialist.isPrimary ? styles.specialistActionBtnPrimary : styles.specialistActionBtnSecondary
                  ]}
                  onPress={() => specialist.isPrimary && navigation.navigate('Main', { screen: 'ScheduleTab', params: { clinic: route.params?.clinic } })}
                >
                  <Text 
                    style={[
                      styles.specialistActionText,
                      specialist.isPrimary ? styles.specialistActionTextPrimary : styles.specialistActionTextSecondary
                    ]}
                  >
                    {specialist.actionText}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FCFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.padding,
    paddingVertical: 12,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageContainer: {
    width: '100%',
    height: 240,
    position: 'relative',
    marginTop: -60, // Pull up under the header
    zIndex: 1,
  },
  clinicImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFill as any,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  imageTextContainer: {
    position: 'absolute',
    bottom: 40,
    left: layout.padding,
    right: layout.padding,
  },
  clinicTitle: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    marginHorizontal: layout.padding,
    padding: 20,
    marginTop: -24,
    zIndex: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E6F4F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  locationTextContainer: {
    flex: 1,
  },
  addressText: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
    marginBottom: 4,
  },
  hoursText: {
    fontSize: 14,
    color: '#64748B',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginBottom: 20,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#CBEBE8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: layout.padding,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 16,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceItem: {
    width: (width - layout.padding * 2 - 16) / 2, // 2 columns with 16px gap
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  serviceText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
    flex: 1,
  },
  specialistsList: {
    gap: 16,
  },
  specialistCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  specialistHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  specialistImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  specialistInfo: {
    flex: 1,
  },
  specialistName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 2,
  },
  specialistRole: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  specialistActionBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  specialistActionBtnPrimary: {
    backgroundColor: colors.primary,
  },
  specialistActionBtnSecondary: {
    backgroundColor: '#E5EFEF',
  },
  specialistActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  specialistActionTextPrimary: {
    color: colors.white,
  },
  specialistActionTextSecondary: {
    color: colors.primary,
  },
});
