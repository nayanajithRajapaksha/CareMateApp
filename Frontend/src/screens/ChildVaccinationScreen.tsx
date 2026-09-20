import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle, Circle, ShieldAlert } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, typography, layout } from '../theme';
import { vaccineService, TimelineVaccine } from '../services/vaccineService';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';

export const ChildVaccinationScreen: React.FC = () => {
  const { t } = useLanguage();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const child = route.params?.child;
  const { role } = useAuth();

  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState<TimelineVaccine[]>([]);

  useEffect(() => {
    if (child) {
      fetchTimeline();
    }
  }, [child]);

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const res = await vaccineService.getChildTimeline(child.id);
      setTimeline(res.timeline || []);
    } catch (error) {
      console.error('Error fetching timeline:', error);
      Alert.alert('Error', 'Failed to load vaccination timeline');
    } finally {
      setLoading(false);
    }
  };

  const handleVaccinePress = (vaccine: TimelineVaccine) => {
    if (vaccine.is_completed) return;
    
    // Only Midwife/PHM can mark as administered
    if (role !== 'phm' && role !== 'midwife') {
      return; 
    }

    if (vaccine.previous_dose_id) {
      const prevDose = timeline.find((v: any) => v.id === vaccine.previous_dose_id);
      if (!prevDose || !prevDose.is_completed) {
        Alert.alert('Blocked', 'Please mark the previous dose as administered first.');
        return;
      }
    }

    Alert.alert(
      'Mark as Administered',
      `Are you sure you want to mark ${vaccine.name} as administered today?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: async () => {
            try {
              await vaccineService.markAdministered(child.id, {
                vaccine_id: vaccine.id,
              });
              fetchTimeline();
            } catch (err) {
              console.error('Error marking administered:', err);
              Alert.alert('Error', 'Failed to update vaccine record');
            }
          }
        }
      ]
    );
  };

  if (!child) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color={colors.textDark} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{child.full_name}'s Vaccines</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.timelineContainer}>
            {timeline.length === 0 ? (
              <Text style={styles.emptyText}>No vaccines found in the schedule.</Text>
            ) : (
              timeline.map((vaccine, index) => {
                const isLast = index === timeline.length - 1;
                
                let dueDate = new Date(child.dob);
                dueDate.setMonth(dueDate.getMonth() + vaccine.recommended_age_months);
                
                let deadlineDate = new Date(dueDate);
                deadlineDate.setDate(deadlineDate.getDate() + (vaccine.minimum_interval_days || 0));

                let isBlocked = false;

                if (vaccine.previous_dose_id) {
                  const prevDose = timeline.find((v: any) => v.id === vaccine.previous_dose_id);
                  if (prevDose && prevDose.is_completed && prevDose.administered_date) {
                    dueDate = new Date(prevDose.administered_date);
                    dueDate.setDate(dueDate.getDate() + (vaccine.minimum_interval_days || 0));
                    deadlineDate = new Date(dueDate);
                    deadlineDate.setDate(deadlineDate.getDate() + 14); // 14 days grace period for subsequent doses
                  } else {
                    isBlocked = true;
                  }
                }

                const today = new Date();
                today.setHours(0,0,0,0);
                const dueDateCompare = new Date(dueDate);
                dueDateCompare.setHours(0,0,0,0);
                const deadlineDateCompare = new Date(deadlineDate);
                deadlineDateCompare.setHours(0,0,0,0);
                
                const isOverdue = !vaccine.is_completed && !isBlocked && today > deadlineDateCompare;
                const isUpcoming = !vaccine.is_completed && !isOverdue;

                let iconColor = colors.border;
                let badgeBg = '#F1F5F9';
                let badgeTextCol = colors.textMuted;
                let statusLabel = 'Upcoming';

                if (vaccine.is_completed) {
                  iconColor = colors.primary; // Green
                  badgeBg = '#DCFCE7';
                  badgeTextCol = '#15803D';
                  statusLabel = 'Completed';
                } else if (isOverdue) {
                  iconColor = '#EF4444'; // Red
                  badgeBg = '#FEE2E2';
                  badgeTextCol = '#B91C1C';
                  statusLabel = 'Overdue';
                } else if (isUpcoming) {
                  iconColor = '#3B82F6'; // Blue
                  badgeBg = '#DBEAFE';
                  badgeTextCol = '#1D4ED8';
                  statusLabel = isBlocked ? 'Blocked' : 'Upcoming';
                }

                return (
                  <TouchableOpacity 
                    key={vaccine.id} 
                    style={styles.timelineItem}
                    activeOpacity={0.7}
                    onPress={() => handleVaccinePress(vaccine)}
                  >
                    {/* Line behind icon */}
                    {!isLast && <View style={[styles.timelineLine, { backgroundColor: vaccine.is_completed ? colors.primary : colors.border }]} />}
                    
                    {/* Icon */}
                    <View style={styles.iconContainer}>
                      {vaccine.is_completed ? (
                        <CheckCircle color={colors.primary} size={28} fill="#DCFCE7" />
                      ) : isOverdue ? (
                        <ShieldAlert color="#EF4444" size={28} fill="#FEE2E2" />
                      ) : (
                        <Circle color={iconColor} size={28} />
                      )}
                    </View>

                    {/* Content */}
                    <View style={styles.contentContainer}>
                      <View style={styles.card}>
                        <View style={styles.cardHeader}>
                          <Text style={[styles.vaccineName, vaccine.is_completed && styles.vaccineNameCompleted]}>
                            {vaccine.name} {vaccine.dose_number && vaccine.dose_number > 1 ? `(Dose ${vaccine.dose_number})` : ''}
                          </Text>
                          <View style={[styles.statusBadge, { backgroundColor: badgeBg }]}>
                            <Text style={[styles.statusText, { color: badgeTextCol }]}>
                              {statusLabel}
                            </Text>
                          </View>
                        </View>
                        
                        <Text style={styles.ageText}>
                          Due at: {vaccine.recommended_age_months} months
                        </Text>
                        
                        {vaccine.is_completed && vaccine.administered_date && (
                          <Text style={styles.dateText}>
                            Administered: {new Date(vaccine.administered_date).toLocaleDateString()}
                          </Text>
                        )}
                        
                        {!vaccine.is_completed && (role === 'phm' || role === 'midwife') && (
                          <View style={styles.actionPrompt}>
                            <ShieldAlert size={14} color={colors.primary} />
                            <Text style={styles.actionText}>Tap to mark administered</Text>
                          </View>
                        )}
                        
                        {!vaccine.is_completed && role === 'parent' && (
                          <View style={{ marginTop: 12 }}>
                            {isBlocked && (
                               <Text style={{ fontSize: 13, color: colors.textMuted }}>Waiting on previous dose</Text>
                            )}
                            {isOverdue && (
                              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' }}>
                                <ShieldAlert size={14} color="#EF4444" style={{ marginRight: 4 }} />
                                <Text style={{ fontSize: 12, color: '#EF4444', fontWeight: 'bold' }}>Unsafe (Overdue)</Text>
                              </View>
                            )}
                            {!isBlocked && (today >= dueDateCompare) && (
                              <TouchableOpacity 
                                style={{ backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, alignSelf: 'flex-start' }}
                                onPress={() => navigation.navigate('ScheduleTab', { childId: child.id })}
                              >
                                <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}>Book Clinic</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FAFA'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.padding,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)'
  },
  backButton: {
    padding: 8,
    marginLeft: -8
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark
  },
  scrollContent: {
    padding: layout.padding,
    paddingBottom: 40
  },
  timelineContainer: {
    paddingVertical: 10
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24,
    position: 'relative'
  },
  timelineLine: {
    position: 'absolute',
    left: 13,
    top: 28,
    bottom: -24,
    width: 2,
    zIndex: 0
  },
  iconContainer: {
    width: 28,
    height: 28,
    zIndex: 1,
    backgroundColor: '#F4FAFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  contentContainer: {
    flex: 1
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  vaccineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textDark,
    flex: 1
  },
  vaccineNameCompleted: {
    color: colors.primary
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold'
  },
  ageText: {
    fontSize: 14,
    color: colors.textDark,
    marginBottom: 4
  },
  dateText: {
    fontSize: 13,
    color: colors.textMuted
  },
  actionPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)'
  },
  actionText: {
    fontSize: 12,
    color: colors.primary,
    marginLeft: 6,
    fontWeight: '500'
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: 40
  }
});
