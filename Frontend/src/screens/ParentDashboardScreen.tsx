import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Bell, CheckCircle2, Calendar, Stethoscope, Syringe, MessageSquare, ChevronRight, Plus } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors, typography, layout } from '../theme';
import { PrimaryButton } from '../components/PrimaryButton';
import { childService } from '../services/childService';
import { profileService } from '../services/profileService';

const mockChildren = [
  {
    id: '1',
    name: 'Yenuli',
    age: '1 yrs 6 mos',
    status: 'Next checkup in 5 days',
    statusIcon: 'calendar',
    image: 'https://i.pravatar.cc/150?img=5' // Placeholder child 1
  },
  {
    id: '2',
    name: 'Leo',
    age: '2 yrs',
    status: 'Up to date',
    statusIcon: 'check',
    image: 'https://i.pravatar.cc/150?img=11' // Placeholder child 2
  }
];

export const ParentDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [childrenData, setChildrenData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [userName, setUserName] = React.useState('User');
  const [userAvatar, setUserAvatar] = React.useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          const [childrenResponse, profileResponse] = await Promise.all([
            childService.getChildren(),
            profileService.getProfile()
          ]);

          setChildrenData(childrenResponse.children || []);
          setUserName(profileResponse.profile?.full_name || 'User');
          setUserAvatar(profileResponse.profile?.avatar_url || null);
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
          setChildrenData([]);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, [])
  );

  const displayData = childrenData.length > 0 ? childrenData : [];

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Children Added</Text>
      <Text style={styles.emptySubtitle}>Add a child profile to track their health and vaccinations.</Text>
      <PrimaryButton 
        title="Register a Child" 
        onPress={() => navigation.navigate('RegisterChild')}
        style={{ marginTop: 16 }}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerLeft} onPress={() => navigation.navigate('ProfileTab')}>
            <Image source={{ uri: userAvatar || 'https://i.pravatar.cc/150?img=47' }} style={styles.profilePic} />
            <Text style={styles.headerTitle}>CareMate</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.notificationBtn}>
            <Bell color={colors.primary} size={24} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* Greeting Card */}
        <View style={styles.greetingCard}>
          <Text style={styles.greetingTitle}>Hello, {userName}!</Text>
          <Text style={styles.greetingText}>
            Your family's health is on track. All children are up to date with vaccinations.
          </Text>
          <View style={styles.statusBadge}>
            <CheckCircle2 color={colors.white} size={16} />
            <Text style={styles.statusBadgeText}>All Good</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('ScheduleTab')}>
              <View style={styles.actionIconContainer}>
                <Calendar color={colors.textDark} size={24} />
              </View>
              <Text style={styles.actionText}>Book</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('SelectClinic')}>
              <View style={styles.actionIconContainer}>
                <Stethoscope color={colors.textDark} size={24} />
              </View>
              <Text style={styles.actionText}>Clinic</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('ChildrenTab')}>
              <View style={styles.actionIconContainer}>
                <Syringe color={colors.textDark} size={24} />
              </View>
              <Text style={styles.actionText}>Vaccines</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('LearnTab')}>
              <View style={styles.actionIconContainer}>
                <MessageSquare color={colors.textDark} size={24} />
              </View>
              <Text style={styles.actionText}>Family{"\n"}Planning</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Children Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Children</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ChildrenTab')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.childrenList}>
            {loading ? (
              <Text style={{ textAlign: 'center', color: colors.textMuted, marginTop: 20 }}>Loading...</Text>
            ) : displayData.length === 0 ? (
              renderEmptyState()
            ) : (
              displayData.map(child => (
                <TouchableOpacity 
                  key={child.id} 
                  style={styles.childCard}
                  onPress={() => navigation.navigate('RegisterChild', { mode: 'edit', child })}
                >
                  <Image source={{ uri: child.image || 'https://i.pravatar.cc/150?img=5' }} style={styles.childImage} />
                  
                  <View style={styles.childInfo}>
                    <Text style={styles.childNameAge}>
                      <Text style={styles.childName}>{child.full_name}</Text>
                      <Text style={styles.childAge}> · {child.gender}</Text>
                    </Text>
                    <View style={styles.childStatusRow}>
                      <Calendar color={colors.primary} size={14} />
                      <Text style={styles.childStatusText}>Up to date</Text>
                    </View>
                  </View>
                  
                  <View style={styles.chevronContainer}>
                    <ChevronRight color={colors.textDark} size={20} />
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FAFA', // Slight variation of background from theme to match screenshot
  },
  scrollContent: {
    padding: layout.padding,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
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
    backgroundColor: '#EF4444', // Red dot
  },
  greetingCard: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
  },
  greetingTitle: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  greetingText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statusBadgeText: {
    color: colors.white,
    marginLeft: 6,
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  viewAllText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionItem: {
    alignItems: 'center',
    width: '22%',
  },
  actionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#E6F4F4', // Light teal background
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 13,
    color: colors.textDark,
    textAlign: 'center',
    fontWeight: '500',
  },
  childrenList: {
    gap: 16,
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  childImage: {
    width: 60,
    height: 60,
    borderRadius: 16,
    marginRight: 16,
  },
  childInfo: {
    flex: 1,
  },
  childNameAge: {
    marginBottom: 6,
  },
  childName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  childAge: {
    fontSize: 16,
    color: colors.textDark,
    fontWeight: '600',
  },
  childStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  childStatusText: {
    color: colors.textMuted,
    fontSize: 14,
    marginLeft: 6,
  },
  chevronContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E6F4F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  }
});
