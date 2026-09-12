import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { Bell, Search, Map as MapIcon, ChevronRight, Zap, Info, ShieldPlus, PlusSquare, Activity, MapPin } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, layout } from '../theme';

const MOCK_CLINICS = [
  {
    id: '1',
    name: 'Dediyawala Clinic',
    type: 'Child health care center',
    distance: '2.5 km',
    fastest: true,
    tags: ['FLU', 'COVID-19', 'HEP B'],
    status: 'available'
  },
  {
    id: '2',
    name: 'Teaching Hospital',
    type: 'Kalutara District',
    distance: '4.1 km',
    fastest: false,
    tags: [],
    status: 'bookable',
    nextAvailable: 'Today, 10:30 AM'
  },
  {
    id: '3',
    name: 'Maternity & Children\'s Hospital',
    type: 'Katukurunda',
    distance: '5.8 km',
    fastest: false,
    tags: [],
    status: 'full'
  }
];

export const SelectClinicScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Vaccines');

  const filters = ['All Vaccines', 'Flu', 'COVID-19'];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header (same as Dashboard) */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={{ uri: 'https://i.pravatar.cc/150?img=47' }} style={styles.profilePic} />
          <Text style={styles.headerTitle}>CareMate</Text>
        </View>
        <TouchableOpacity style={styles.notificationBtn}>
          <Bell color={colors.primary} size={24} />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Select Clinic</Text>
        <Text style={styles.pageSubtitle}>Find a nearby clinic for your vaccination.</Text>

        <View style={styles.searchContainer}>
          <Search color={colors.textMuted} size={20} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search by area or clinic name"
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filtersRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
            {filters.map(filter => (
              <TouchableOpacity 
                key={filter}
                style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
                onPress={() => setActiveFilter(filter)}
              >
                {filter === 'All Vaccines' && <ShieldPlus size={16} color={activeFilter === filter ? colors.primary : colors.textDark} style={{marginRight: 6}} />}
                <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity 
            style={styles.mapButton}
            onPress={() => navigation.navigate('FindClinic')}
          >
            <MapIcon color={colors.primary} size={16} style={{marginRight: 6}} />
            <Text style={styles.mapButtonText}>Map</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.clinicsList}>
          {MOCK_CLINICS.map(clinic => (
            <TouchableOpacity 
              key={clinic.id} 
              style={[
                styles.clinicCard, 
                clinic.status === 'bookable' && styles.clinicCardGreenBg
              ]}
              onPress={() => navigation.navigate('ClinicDetails', { clinic })}
            >
              <View style={styles.clinicCardHeader}>
                <View style={[
                  styles.clinicIconContainer,
                  clinic.id === '1' && { backgroundColor: '#CBEBE8' },
                  clinic.id === '2' && { backgroundColor: '#FFFFFF' },
                  clinic.id === '3' && { backgroundColor: '#D1E6E6' },
                ]}>
                  {clinic.id === '1' && <ShieldPlus color="#1F4D4F" size={24} />}
                  {clinic.id === '2' && <PlusSquare color={colors.primary} size={24} />}
                  {clinic.id === '3' && <Activity color="#4F7375" size={24} />}
                </View>
                <View style={styles.clinicMainInfo}>
                  <View style={styles.clinicNameRow}>
                    <Text style={styles.clinicName}>{clinic.name}</Text>
                    {clinic.fastest && (
                      <View style={styles.fastestBadge}>
                        <Zap color={colors.primary} size={12} fill={colors.primary} />
                        <Text style={styles.fastestText}>Fastest</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.locationRow}>
                    <MapPin color={colors.textDark} size={12} />
                    <Text style={styles.clinicDetails}>
                      {clinic.type} • {clinic.distance}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Separator for Card 1 & 2 */}
              {clinic.status !== 'full' && (
                <View style={styles.separator} />
              )}

              {clinic.status === 'available' && (
                <View style={styles.clinicCardFooterRow}>
                  <View style={styles.tagsContainer}>
                    {clinic.tags.map(tag => (
                      <View key={tag} style={styles.tagBadge}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                  <TouchableOpacity style={styles.actionLinkRow} onPress={() => navigation.navigate('ClinicDetails', { clinic })}>
                    <Text style={styles.actionLinkText}>Select</Text>
                    <ChevronRight color={colors.primary} size={16} />
                  </TouchableOpacity>
                </View>
              )}

              {clinic.status === 'bookable' && (
                <View style={styles.clinicCardFooterRow}>
                  <View>
                    <Text style={styles.nextAvailableLabel}>Next available</Text>
                    <Text style={styles.nextAvailableText}>{clinic.nextAvailable}</Text>
                  </View>
                  <TouchableOpacity style={styles.bookButton}>
                    <Text style={styles.bookButtonText}>Book</Text>
                  </TouchableOpacity>
                </View>
              )}

              {clinic.status === 'full' && (
                <View style={[styles.clinicCardFooterRow, { marginTop: 16 }]}>
                  <View style={styles.fullStatusRow}>
                    <Info color="#EF4444" size={16} />
                    <Text style={styles.fullStatusText}>Fully Booked Today</Text>
                  </View>
                  <TouchableOpacity>
                    <Text style={styles.viewDatesText}>View Dates</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          ))}
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
  scrollContent: {
    padding: layout.padding,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingTop: 10,
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePic: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
  },
  notificationBtn: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: colors.textDark,
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  filtersScroll: {
    flex: 1,
    marginRight: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: colors.white,
    marginRight: 10,
  },
  filterChipActive: {
    backgroundColor: '#D6F2F0',
    borderColor: '#D6F2F0',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textDark,
  },
  filterTextActive: {
    color: colors.primary,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5EFEF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  mapButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  clinicsList: {
    gap: 16,
  },
  clinicCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  clinicCardGreenBg: {
    backgroundColor: '#EDF7F6',
    borderColor: '#EDF7F6',
  },
  clinicCardHeader: {
    flexDirection: 'row',
  },
  clinicIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  clinicMainInfo: {
    flex: 1,
  },
  clinicNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  clinicName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginRight: 8,
  },
  fastestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4F1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  fastestText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clinicDetails: {
    fontSize: 14,
    color: '#475569',
    marginLeft: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 16,
  },
  clinicCardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tagBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#475569',
  },
  actionLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginRight: 2,
  },
  nextAvailableLabel: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 4,
  },
  nextAvailableText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  bookButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  bookButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  fullStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fullStatusText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  viewDatesText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  }
});
