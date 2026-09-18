import React from 'react';
import { View, Text, StyleSheetScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MoreVertical, Calendar, FileText, AlertCircle, Plus, Pencil } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors, typography, layout } from '../theme';
import { PrimaryButton } from '../components/PrimaryButton';
import { childService } from '../services/childService';

const mockChildrenData = [
  {
    id: '1',
    name: 'Yenuli Dahamsa',
    age: '1 yrs 6 mos old',
    gender: 'Female',
    profile_pic_url: 'https://i.pravatar.cc/150?img=5',
    alert: null
  },
  {
    id: '2',
    name: 'Senuja Perera',
    age: '18 Months old',
    gender: 'Male',
    profile_pic_url: 'https://i.pravatar.cc/150?img=11',
    alert: {
      title: 'Upcoming Vaccination',
      message: 'MMR Dose 1 due next week'
    }
  }
];

export const ChildrenScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [childrenData, setChildrenData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const fetchChildren = async () => {
        try {
          const data = await childService.getChildren();
          setChildrenData(data.children);
        } catch (error) {
          console.error('Error fetching children:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchChildren();
    }, [])
  );

  // Use mock data fallback for testing if API returns empty, or you can strictly use API.
  // The plan requested to show "no children added" if not added.
  const displayData = childrenData.length > 0 ? childrenData : [];

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Children Added</Text>
      <Text style={styles.emptySubtitle}>You haven't added any children profiles yet. Add your child to start managing their health records and vaccination schedules.</Text>
      <PrimaryButton 
        title="Register a Child" 
        onPress={() => navigation.navigate('RegisterChild')}
        style={{ marginTop: 24, width: '80%' }}
      />
    </View>
  );
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Children</Text>
          <Text style={styles.headerSubtitle}>Manage profiles and vaccination schedules.</Text>
        </View>

        {/* Children List */}
        {loading ? (
          <Text style={{ textAlign: 'center', marginTop: 40, color: colors.textMuted }}>Loading...</Text>
        ) : displayData.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.childrenList}>
            {displayData.map(child => (
              <View key={child.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <Image source={{ uri: child.profile_pic_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(child.full_name) + '&background=0D8ABC&color=fff' }} style={styles.childImage} />
                  <View style={styles.childInfo}>
                    <Text style={styles.childName}>{child.full_name}</Text>
                    <Text style={styles.childDetails}>{child.gender}</Text>
                  </View>
                  <TouchableOpacity style={styles.menuIcon} onPress={() => navigation.navigate('RegisterChild', { mode: 'edit', child })}>
                    <Pencil color={colors.primary} size={20} />
                  </TouchableOpacity>
                </View>

                {/* Alert Banner - Placeholder for API */}
                {child.alert && (
                  <View style={styles.alertBanner}>
                    <View style={styles.alertIconContainer}>
                      <AlertCircle color={colors.white} size={16} />
                    </View>
                    <View style={styles.alertTextContent}>
                      <Text style={styles.alertTitle}>{child.alert.title}</Text>
                      <Text style={styles.alertMessage}>{child.alert.message}</Text>
                    </View>
                  </View>
                )}

                {/* Action Buttons */}
                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('ScheduleTab', { childId: child.id })}>
                    <Calendar color={colors.primary} size={16} style={{ marginRight: 6 }} />
                    <Text style={styles.actionButtonText}>Schedule</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('ChildRecords', { child })}>
                    <FileText color={colors.primary} size={16} style={{ marginRight: 6 }} />
                    <Text style={styles.actionButtonText}>Records</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

      </ScrollView>

      {/* FAB */}
      {displayData.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('RegisterChild')}>
          <Plus color={colors.white} size={28} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FAFA'},
  scrollContent: {
    padding: layout.padding,
    paddingBottom: 100, // Extra padding for FAB
  },
  header: {
    marginTop: 20,
    marginBottom: 24},
  headerTitle: {
    ...typography.h1,
    marginBottom: 8},
  headerSubtitle: {
    ...typography.body},
  childrenList: {
    gap: 16},
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)'},
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16},
  childImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16},
  childInfo: {
    flex: 1},
  childName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 4},
  childDetails: {
    fontSize: 14,
    color: colors.textMuted},
  menuIcon: {
    padding: 8},
  alertBanner: {
    flexDirection: 'row',
    backgroundColor: '#E6F4F4',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center'},
  alertIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12},
  alertTextContent: {
    flex: 1},
  alertTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.textDark},
  alertMessage: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2},
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12},
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6F4F4', // Light teal background
    paddingVertical: 12,
    borderRadius: 12},
  actionButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 15},
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4},
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20},
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 8},
  emptySubtitle: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22}
});
