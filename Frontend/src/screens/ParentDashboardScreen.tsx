import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, CheckCircle2, Calendar, Stethoscope, Syringe, MessageSquare, ChevronRight, Plus, ShieldAlert } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors, typography, layout } from '../theme';
import { PrimaryButton } from '../components/PrimaryButton';
import { childService } from '../services/childService';
import { profileService } from '../services/profileService';
import { appointmentService } from '../services/appointmentService';
import { vaccineService } from '../services/vaccineService';
import { useLanguage } from '../i18n/LanguageContext';
import { usePushNotifications } from '../hooks/usePushNotifications';

const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
};
const formatTime = (time: string) => {
  const [hourText, minute] = time.slice(0, 5).split(':');
  const hour = Number(hourText);
  return `${hour % 12 || 12}:${minute} ${hour >= 12 ? 'PM' : 'AM'}`;
};

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
  usePushNotifications();
  const { t } = useLanguage();
  const navigation = useNavigation<any>();
  const [childrenData, setChildrenData] = React.useState<any[]>([]);
  const [appointments, setAppointments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [userName, setUserName] = React.useState('User');

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          const [childrenResponse, profileResponse, appointmentsResponse] = await Promise.all([
            childService.getChildren(),
            profileService.getProfile(),
            appointmentService.getMine().catch(() => ({ appointments: [] }))
          ]);

          let children = childrenResponse.children || [];
          
          children = await Promise.all(children.map(async (child: any) => {
            try {
               const timelineRes = await vaccineService.getChildTimeline(child.id);
               const timeline = timelineRes.timeline || [];
               
               let maxOverdueDays = -1;
               let minUpcomingDays = -1;
               
               timeline.forEach((item: any) => {
                 if (item.status !== 'Completed' && !item.is_completed) {
                   let dueDate = new Date(child.dob);
                   dueDate.setMonth(dueDate.getMonth() + item.recommended_age_months);
                   
                   let deadlineDate = new Date(dueDate);
                   deadlineDate.setDate(deadlineDate.getDate() + (item.minimum_interval_days || 0));

                   if (item.previous_dose_id) {
                     const prevDose = timeline.find((v: any) => v.id === item.previous_dose_id);
                     if (prevDose && prevDose.is_completed && prevDose.administered_date) {
                       dueDate = new Date(prevDose.administered_date);
                       dueDate.setDate(dueDate.getDate() + (item.minimum_interval_days || 0));
                       deadlineDate = new Date(dueDate);
                       deadlineDate.setDate(deadlineDate.getDate() + 14); // 14 days grace period for subsequent doses
                     } else {
                       // Blocked by previous dose, cannot be overdue yet
                       return;
                     }
                   }

                   const today = new Date();
                   today.setHours(0,0,0,0);
                   deadlineDate.setHours(0,0,0,0);
                   
                   if (today > deadlineDate) {
                     const diffTime = Math.abs(today.getTime() - deadlineDate.getTime());
                     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                     if (diffDays > maxOverdueDays) {
                       maxOverdueDays = diffDays;
                     }
                   } else if (today <= deadlineDate) {
                     const diffTime = deadlineDate.getTime() - today.getTime();
                     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                     if (minUpcomingDays === -1 || diffDays < minUpcomingDays) {
                       minUpcomingDays = diffDays;
                     }
                   }
                 }
               });
               
               let safetyStatus: any = { safe: true };
               if (maxOverdueDays > -1) {
                 safetyStatus = { safe: false, days: maxOverdueDays };
               } else if (minUpcomingDays > -1) {
                 safetyStatus = { safe: true, upcomingDays: minUpcomingDays };
               }
               
               return {
                 ...child,
                 safetyStatus
               };
            } catch (err) {
               return { ...child, safetyStatus: { safe: true } }; // fallback
            }
          }));

          setChildrenData(children);
          setUserName(profileResponse.profile?.full_name || 'User');
          setAppointments((appointmentsResponse.appointments || []).filter((a: any) => a.status === 'booked'));
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
          setChildrenData([]);
          setAppointments([]);
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
      <Text style={styles.emptyTitle}>{t('noChildrenAdded')}</Text>
      <Text style={styles.emptySubtitle}>{t('noChildrenSubtitle')}</Text>
      <PrimaryButton 
        title={t('registerChild')} 
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
            <Image source={{ uri: 'https://i.pravatar.cc/150?img=47' }} style={styles.profilePic} />
            <Text style={styles.headerTitle}>CareMate</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.notificationBtn} onPress={() => navigation.navigate('Notifications')}>
            <Bell color={colors.primary} size={24} />
          </TouchableOpacity>
        </View>

        {/* Greeting Card */}
        <View style={styles.greetingCard}>
          <Text style={styles.greetingTitle}>{t('helloUser', { name: userName })}</Text>
          <Text style={styles.greetingText}>
            {t('familyHealthOnTrack')}
          </Text>
          <View style={styles.statusBadge}>
            <CheckCircle2 color={colors.white} size={16} />
            <Text style={styles.statusBadgeText}>{t('allGood')}</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('quickActions')}</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('ScheduleTab')}>
              <View style={styles.actionIconContainer}>
                <Calendar color={colors.textDark} size={24} />
              </View>
              <Text style={styles.actionText}>{t('bookAction')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('SelectClinic')}>
              <View style={styles.actionIconContainer}>
                <Stethoscope color={colors.textDark} size={24} />
              </View>
              <Text style={styles.actionText}>{t('clinicAction')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionItem} onPress={() => {
              if (displayData.length === 1) {
                navigation.navigate('ChildVaccination', { child: displayData[0] });
              } else {
                navigation.navigate('ChildrenTab');
              }
            }}>
              <View style={styles.actionIconContainer}>
                <Syringe color={colors.textDark} size={24} />
              </View>
              <Text style={styles.actionText}>{t('vaccinesAction')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('LearnTab')}>
              <View style={styles.actionIconContainer}>
                <MessageSquare color={colors.textDark} size={24} />
              </View>
              <Text style={styles.actionText}>{t('familyPlanningAction')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Upcoming Appointments Section */}
        {appointments.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('upcomingAppointments')}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('ManageAppointments')}>
                <Text style={styles.viewAllText}>{t('manageText')}</Text>
              </TouchableOpacity>
            </View>
            <View style={{ gap: 12 }}>
              {appointments.slice(0, 3).map((appt) => (
                <View key={appt.id} style={styles.appointmentCard}>
                  <View style={styles.apptIconBox}>
                    <Calendar color={colors.primary} size={24} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.apptChildName}>{t('appointmentWith', { childName: appt.child_name, clinicName: appt.clinic_name })}</Text>
                    <Text style={styles.apptDateText}>
                      {formatDate(appt.appointment_date)} at {formatTime(appt.start_time)}
                    </Text>
                    <Text style={styles.apptMidwifeText}>{t('withMidwife', { name: appt.midwife_name })}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Children Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('childrenSection')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ChildrenTab')}>
              <Text style={styles.viewAllText}>{t('viewAllText')}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.childrenList}>
            {loading ? (
              <Text style={{ textAlign: 'center', color: colors.textMuted, marginTop: 20 }}>{t('loadingText')}</Text>
            ) : displayData.length === 0 ? (
              renderEmptyState()
            ) : (
              displayData.map(child => (
                <TouchableOpacity 
                  key={child.id} 
                  style={styles.childCard}
                  onPress={() => navigation.navigate('RegisterChild', { mode: 'edit', child })}
                >
                  <Image source={{ uri: child.profile_pic_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(child.full_name) + '&background=0D8ABC&color=fff' }} style={styles.childImage} />
                  
                  <View style={styles.childInfo}>
                    <Text style={styles.childNameAge}>
                      <Text style={styles.childName}>{child.full_name}</Text>
                      <Text style={styles.childAge}> · {child.gender}</Text>
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      {child.safetyStatus?.safe ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
                          <CheckCircle2 color="#10B981" size={14} />
                          <Text style={{ color: '#10B981', fontSize: 12, fontWeight: 'bold', marginLeft: 4 }}>
                            {child.safetyStatus?.upcomingDays !== undefined 
                              ? `Next dose in ${child.safetyStatus.upcomingDays} day${child.safetyStatus.upcomingDays !== 1 ? 's' : ''}` 
                              : 'Up to Date'}
                          </Text>
                        </View>
                      ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 }}>
                          <ShieldAlert color="#EF4444" size={14} />
                          <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: 'bold', marginLeft: 4 }}>
                            Unsafe (Passed by {child.safetyStatus?.days} days)
                          </Text>
                        </View>
                      )}
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
    paddingBottom: 40},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24},
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center'},
  profilePic: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12},
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary},
  notificationBtn: {
    position: 'relative',
    padding: 8},
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
    marginBottom: 32},
  greetingTitle: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12},
  greetingText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20},
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20},
  statusBadgeText: {
    color: colors.white,
    marginLeft: 6,
    fontWeight: '600',
    fontSize: 14},
  section: {
    marginBottom: 32},
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16},
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textDark},
  viewAllText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 14},
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between'},
  actionItem: {
    alignItems: 'center',
    width: '22%'},
  actionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#E6F4F4', // Light teal background
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8},
  actionText: {
    fontSize: 13,
    color: colors.textDark,
    textAlign: 'center',
    fontWeight: '500'},
  childrenList: {
    gap: 16},
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)'},
  childImage: {
    width: 60,
    height: 60,
    borderRadius: 16,
    marginRight: 16},
  childInfo: {
    flex: 1},
  childNameAge: {
    marginBottom: 6},
  childName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark},
  childAge: {
    fontSize: 16,
    color: colors.textDark,
    fontWeight: '600'},
  childStatusRow: {
    flexDirection: 'row',
    alignItems: 'center'},
  childStatusText: {
    color: colors.textMuted,
    fontSize: 14,
    marginLeft: 6},
  chevronContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E6F4F4',
    justifyContent: 'center',
    alignItems: 'center'},
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)'},
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 8},
  emptySubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20},
  appointmentCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center'},
  apptIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E6F4F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16},
  apptChildName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 4},
  apptDateText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 2},
  apptMidwifeText: {
    fontSize: 13,
    color: colors.textMuted}
});
