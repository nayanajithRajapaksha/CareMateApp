import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, Info, CheckCircle, Circle, ShieldAlert } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, layout } from '../theme';
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
      Alert.alert(t('error'), t('failedToLoadTimeline'));
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
        Alert.alert(t('blockedTitle'), t('markPreviousDoseFirst'));
        return;
      }
    }

    Alert.alert(
      t('markAsAdministeredTitle'),
      t('confirmAdministerMessage', { vaccine: vaccine.name }),
      [
        { text: t('cancelBtn'), style: 'cancel' },
        { 
          text: t('confirmBtn'), 
          onPress: async () => {
            try {
              await vaccineService.markAdministered(child.id, {
                vaccine_id: vaccine.id,
              });
              fetchTimeline();
            } catch (err) {
              console.error('Error marking administered:', err);
              Alert.alert(t('error'), t('failedToUpdateVaccine'));
            }
          }
        }
      ]
    );
  };

  if (!child) return null;

  // Group timeline items by recommended_age_months
  const groups = timeline.reduce((acc, vaccine) => {
    const age = vaccine.recommended_age_months;
    if (!acc[age]) {
      acc[age] = {
        ageMonths: age,
        title: age === 0 ? 'Birth' : `${age} Months`,
        ageShort: age === 0 ? 'Birth' : `${age}M`,
        tag: age === 0 ? 'Hospital' : 'Clinic',
        tagColor: age === 0 ? '#2B837F' : '#B6D7D7',
        tagTextColor: age === 0 ? '#FFF' : '#4A6261',
        vaccines: []
      };
    }
    acc[age].vaccines.push(vaccine);
    return acc;
  }, {} as any);

  const groupedTimeline = Object.values(groups).sort((a: any, b: any) => a.ageMonths - b.ageMonths);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.canGoBack() && navigation.goBack()}>
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
        <Text style={styles.pageTitle}>{child.full_name}'s Milestones</Text>
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

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : groupedTimeline.length === 0 ? (
          <Text style={{textAlign: 'center', color: '#888', marginTop: 40}}>No vaccines found.</Text>
        ) : (
          <View style={styles.timelineContainer}>
            {groupedTimeline.map((group: any, index: number) => {
              const isLastGroup = index === groupedTimeline.length - 1;

              return (
                <View key={index} style={styles.timelineRow}>
                  {/* Timeline Line & Circle */}
                  <View style={styles.timelineLeft}>
                    <View style={styles.ageCircle}>
                      <Text style={styles.ageCircleText}>{group.ageShort}</Text>
                    </View>
                    {!isLastGroup && <View style={styles.timelineLine} />}
                  </View>

                  {/* Milestone Card */}
                  <View style={styles.milestoneCard}>
                    <View style={styles.milestoneHeader}>
                      <Text style={styles.milestoneTitle}>{group.title}</Text>
                      <View style={[styles.tagBadge, { backgroundColor: group.tagColor }]}>
                        <Text style={[styles.tagText, { color: group.tagTextColor }]}>
                          {group.tag}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.vaccineList}>
                      {group.vaccines.map((vaccine: TimelineVaccine, vIndex: number) => {
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

                        let daysRemaining = -1;
                        if (isUpcoming && !isBlocked) {
                          const diffTime = deadlineDateCompare.getTime() - today.getTime();
                          daysRemaining = Math.ceil(diffTime / (1000 * 3600 * 24));
                        }

                        let iconColor = colors.border;
                        let badgeBg = '#F1F5F9';
                        let badgeTextCol = colors.textMuted;
                        let statusLabel = 'Upcoming';

                        if (vaccine.is_completed) {
                          iconColor = colors.primary; // Green
                          badgeBg = '#DCFCE7';
                          badgeTextCol = '#15803D';
                          statusLabel = t('completedStatusText');
                        } else if (isOverdue) {
                          iconColor = '#EF4444'; // Red
                          badgeBg = '#FEE2E2';
                          badgeTextCol = '#B91C1C';
                          statusLabel = t('overdueText');
                        } else if (isUpcoming) {
                          iconColor = '#3B82F6'; // Blue
                          badgeBg = '#DBEAFE';
                          badgeTextCol = '#1D4ED8';
                          statusLabel = isBlocked ? t('blockedTitle') : t('upcomingText');
                        }

                        return (
                          <TouchableOpacity 
                            key={vaccine.id} 
                            style={[styles.vaccineItem, vIndex > 0 && { borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 16 }]}
                            onPress={() => handleVaccinePress(vaccine)}
                            activeOpacity={0.7}
                          >
                            <View style={{marginTop: 2}}>
                              {vaccine.is_completed ? (
                                <CheckCircle color={colors.primary} size={22} fill="#DCFCE7" style={styles.vaccineIcon} />
                              ) : isOverdue ? (
                                <ShieldAlert color="#EF4444" size={22} fill="#FEE2E2" style={styles.vaccineIcon} />
                              ) : (
                                <Circle color={iconColor} size={22} style={styles.vaccineIcon} />
                              )}
                            </View>
                            
                            <View style={styles.vaccineContent}>
                              <View style={styles.vaccineHeader}>
                                <Text style={[styles.vaccineName, vaccine.is_completed && {color: colors.primary}]}>
                                  {vaccine.name}
                                </Text>
                                <View style={[styles.statusBadge, { backgroundColor: badgeBg }]}>
                                  <Text style={[styles.statusText, { color: badgeTextCol }]}>{statusLabel}</Text>
                                </View>
                              </View>
                              
                              <Text style={styles.vaccineDose}>
                                Dose {vaccine.dose_number}
                                {!vaccine.is_completed && !isBlocked && daysRemaining > 0 && (
                                  <Text style={{ color: '#3B82F6', fontWeight: 'bold' }}> · {daysRemaining} days left</Text>
                                )}
                              </Text>

                              {vaccine.is_completed && vaccine.administered_date && (
                                <Text style={styles.dateText}>Administered: {new Date(vaccine.administered_date).toLocaleDateString()}</Text>
                              )}
                              
                              {!vaccine.is_completed && role !== 'parent' && (
                                <Text style={styles.actionPrompt}>Tap to mark administered</Text>
                              )}
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
        
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
    fontSize: 11,
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
  },
  vaccineContent: {
    flex: 1,
  },
  vaccineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  vaccineName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#053130',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  vaccineDose: {
    fontSize: 13,
    color: '#4A6261',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  actionPrompt: {
    fontSize: 12,
    color: '#117871',
    marginTop: 4,
    fontWeight: '500',
  }
});
