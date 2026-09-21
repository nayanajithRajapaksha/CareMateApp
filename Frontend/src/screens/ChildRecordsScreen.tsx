import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, FileText, CheckCircle, XCircle, Shield } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, typography, layout } from '../theme';
import { appointmentService } from '../services/appointmentService';
import { useLanguage } from '../i18n/LanguageContext';

const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};
const formatTime = (time: string) => {
  const [hourText, minute] = time.slice(0, 5).split(':');
  const hour = Number(hourText);
  return `${hour % 12 || 12}:${minute} ${hour >= 12 ? 'PM' : 'AM'}`;
};

export const ChildRecordsScreen: React.FC = () => {
  const { t } = useLanguage();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const child = route.params?.child;

  const [loading, setLoading] = useState(true);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!child) return;
    
    appointmentService.getMine()
      .then(res => {
        const all = res.appointments || [];
        const childAppts = all.filter((a: any) => String(a.child_id) === String(child.id));
        
        const now = new Date();
        const upc: any[] = [];
        const hist: any[] = [];

        childAppts.forEach((a: any) => {
          const apptDate = new Date(a.appointment_date);
          const [hh, mm] = a.start_time.split(':');
          apptDate.setHours(Number(hh), Number(mm), 0, 0);

          if (a.status === 'booked' && apptDate >= now) {
            upc.push(a);
          } else {
            hist.push(a);
          }
        });

        setUpcoming(upc.sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()));
        setHistory(hist.sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime()));
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [child]);

  if (!child) return null;

  const renderCard = (appt: any, isUpcoming: boolean) => (
    <View key={appt.id} style={styles.card}>
      <View style={styles.cardIcon}>
        {appt.status === 'completed' ? (
          <CheckCircle color="#10B981" size={24} />
        ) : appt.status === 'cancelled' ? (
          <XCircle color="#EF4444" size={24} />
        ) : (
          <Calendar color={colors.primary} size={24} />
        )}
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.clinicName}>{appt.clinic_name}</Text>
        <Text style={styles.dateTime}>
          {formatDate(appt.appointment_date)} at {formatTime(appt.start_time)}
        </Text>
        <Text style={styles.midwifeName}>Midwife: {appt.midwife_name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: appt.status === 'booked' ? '#E6F4F4' : appt.status === 'completed' ? '#DCFCE7' : '#FEE2E2' }]}>
          <Text style={[styles.statusText, { color: appt.status === 'booked' ? colors.primary : appt.status === 'completed' ? '#15803D' : '#DC2626' }]}>
            {appt.status.toUpperCase()}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color={colors.textDark} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('childRecordsTitle', { childName: child.full_name })}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            <TouchableOpacity 
              style={styles.vaccineCard} 
              onPress={() => navigation.navigate('ChildVaccination', { child })}
            >
              <View style={styles.vaccineIconContainer}>
                <Shield color={colors.primary} size={24} />
              </View>
              <View style={styles.vaccineTextContainer}>
                <Text style={styles.vaccineTitle}>{t('vaccinationTimeline')}</Text>
                <Text style={styles.vaccineSub}>View upcoming and past vaccinations</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Calendar color={colors.textDark} size={20} />
                <Text style={styles.sectionTitle}>{t('upcomingBookingsTitle')}</Text>
              </View>
              {upcoming.length === 0 ? (
                <Text style={styles.emptyText}>{t('noUpcomingBookings')}</Text>
              ) : (
                upcoming.map(a => renderCard(a, true))
              )}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <FileText color={colors.textDark} size={20} />
                <Text style={styles.sectionTitle}>{t('bookingHistoryTitle')}</Text>
              </View>
              {history.length === 0 ? (
                <Text style={styles.emptyText}>{t('noPastBookings')}</Text>
              ) : (
                history.map(a => renderCard(a, false))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FAFA'},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.padding,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)'},
  backButton: {
    padding: 8,
    marginLeft: -8},
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark},
  scrollContent: {
    padding: layout.padding,
    paddingBottom: 40},
  section: {
    marginBottom: 32},
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8},
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark},
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    fontStyle: 'italic'},
  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)'},
  cardIcon: {
    marginRight: 16,
    justifyContent: 'center'},
  cardContent: {
    flex: 1},
  clinicName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 4},
  dateTime: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 2},
  midwifeName: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 8},
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12},
  statusText: {
    fontSize: 11,
    fontWeight: 'bold'},
  vaccineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)'},
  vaccineIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F4FAFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16},
  vaccineTextContainer: {
    flex: 1},
  vaccineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 4},
  vaccineSub: {
    fontSize: 13,
    color: colors.textMuted}
});
