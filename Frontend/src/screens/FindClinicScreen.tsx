import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView, Dimensions } from 'react-native';
import { ArrowLeft, Search, Crosshair, ChevronDown, MapPin, Smile, CornerUpRight, ArrowUpDown } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import { colors, layout } from '../theme';

const { width, height } = Dimensions.get('window');

const FILTERS = ['All Specialities', 'Pediatrics', 'Maternity', 'Vaccinations'];

export const FindClinicScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Coordinates for Colombo
  const initialRegion = {
    latitude: 6.9271,
    longitude: 79.8612,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const clinicLocation = {
    latitude: 6.9150,
    longitude: 79.8680,
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color={colors.textDark} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find a Clinic</Text>
        <View style={{ width: 24 }} /> {/* Placeholder for balance */}
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search color={colors.textMuted} size={20} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search clinics or locations..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity>
            <Crosshair color={colors.primary} size={20} />
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <View style={styles.filtersWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
            {FILTERS.map((filter, index) => (
              <TouchableOpacity 
                key={filter}
                style={[
                  styles.filterChip, 
                  index === 0 && styles.filterChipActive
                ]}
              >
                <Text style={[
                  styles.filterText, 
                  index === 0 && styles.filterTextActive
                ]}>
                  {filter}
                </Text>
                {index === 0 && <ChevronDown color={colors.white} size={16} style={{marginLeft: 4}} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Map Area */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
          provider={null} // Important to use null for standard Maps (and custom tiles) on some platforms
          mapType="none" // Hide default map to show OSM
        >
          <UrlTile
            urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
            flipY={false}
          />
          
          <Marker coordinate={clinicLocation}>
            <View style={styles.markerContainer}>
              <View style={styles.markerLabel}>
                <Text style={styles.markerLabelText}>Maternal & Child Health...</Text>
                <Text style={styles.markerLabelDistance}>1.2 km</Text>
              </View>
              <View style={styles.markerIconWrapper}>
                <View style={styles.markerIconInner}>
                  <MapPin color={colors.white} size={16} fill={colors.white} />
                </View>
              </View>
            </View>
          </Marker>
        </MapView>
      </View>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.dragHandle} />
        
        <View style={styles.sheetHeader}>
          <View style={styles.sheetHeaderTitleRow}>
            <Text style={styles.sheetTitle}>Nearby Clinics</Text>
            <Text style={styles.sheetSubtitle}>(12 found)</Text>
          </View>
          <TouchableOpacity style={styles.sortButton}>
            <ArrowUpDown color={colors.primary} size={16} style={{marginRight: 4}} />
            <Text style={styles.sortText}>Sort</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.clinicCard}>
          <View style={styles.clinicCardTopRow}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>OPEN NOW</Text>
            </View>
            <View style={styles.distanceRow}>
              <MapPin color={colors.textMuted} size={12} />
              <Text style={styles.distanceText}>1.2 km</Text>
            </View>
          </View>

          <View style={styles.clinicCardMiddleRow}>
            <View style={{flex: 1}}>
              <Text style={styles.clinicName}>Maternal & Child Health Clinic</Text>
              <Text style={styles.clinicAddress}>Horton Place, Colombo 07</Text>
            </View>
            <View style={styles.iconCircle}>
              <Smile color={colors.primary} size={24} />
            </View>
          </View>

          <View style={styles.clinicCardBottomRow}>
            <TouchableOpacity 
              style={styles.detailsButton}
              onPress={() => navigation.navigate('ClinicDetails', { 
                clinic: { id: 'maternal', name: 'Maternal & Child Health Clinic' } 
              })}
            >
              <Text style={styles.detailsButtonText}>View Details</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.directionsButton}>
              <CornerUpRight color={colors.primary} size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

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
  searchSection: {
    paddingHorizontal: layout.padding,
    paddingBottom: 16,
    zIndex: 2,
    backgroundColor: '#F7FCFC',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: colors.textDark,
  },
  filtersWrapper: {
    flexDirection: 'row',
  },
  filtersScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: colors.white,
    marginRight: 10,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textDark,
  },
  filterTextActive: {
    color: colors.white,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: width,
    height: '100%',
  },
  markerContainer: {
    alignItems: 'center',
    marginTop: -40, // Adjust to put point exactly on coordinate
  },
  markerLabel: {
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 8,
  },
  markerLabelText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  markerLabelDistance: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  markerIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(31, 114, 117, 0.2)', // Light primary with opacity
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerIconInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#F7FCFC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: layout.padding,
    paddingBottom: 40,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sheetHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    marginRight: 8,
  },
  sheetSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  clinicCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  clinicCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    backgroundColor: '#E6F4F1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.primary,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4,
  },
  clinicCardMiddleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  clinicName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  clinicAddress: {
    fontSize: 14,
    color: '#475569',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5EFEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clinicCardBottomRow: {
    flexDirection: 'row',
    gap: 12,
  },
  detailsButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  directionsButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
