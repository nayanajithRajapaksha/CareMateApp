import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, ShieldAlert, CheckCircle2 } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors, layout } from '../theme';
import { childService } from '../services/childService';
import { vaccineService } from '../services/vaccineService';
import { useLanguage } from '../i18n/LanguageContext';
import { NotificationIcon } from '../components/NotificationIcon';
import { PrimaryButton } from '../components/PrimaryButton';

export const ChildrenScreen: React.FC = () => {
  const { t } = useLanguage();
  const navigation = useNavigation<any>();
  const [childrenData, setChildrenData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchChildren = async () => {
        try {
          const res = await childService.getChildren();
          let children = res.children || [];
          
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
        } catch (error) {
          console.error('Error fetching children:', error);
          setChildrenData([]);
        } finally {
          setLoading(false);
        }
      };

      fetchChildren();
    }, [])
  );

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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('tabChildren')}</Text>
        <NotificationIcon color={colors.primary} size={24} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : childrenData.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.childrenList}>
            <PrimaryButton 
              title={t('registerChild')} 
              onPress={() => navigation.navigate('RegisterChild')}
              style={{ marginBottom: 16 }}
            />
            {childrenData.map(child => (
              <TouchableOpacity 
                key={child.id} 
                style={styles.childCard}
                onPress={() => navigation.navigate('ChildVaccination', { child })}
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
            ))}
          </View>
        )}
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
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
  },
  scrollContent: {
    padding: layout.padding,
    paddingBottom: 40,
  },
  loadingContainer: {
    marginTop: 40,
    alignItems: 'center',
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
    marginTop: 20,
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
  },
});
