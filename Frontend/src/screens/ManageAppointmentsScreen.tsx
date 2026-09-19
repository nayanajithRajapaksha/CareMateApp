import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Calendar, Clock, ChevronLeft, MapPin, UserRound, XCircle, Stethoscope, BriefcaseMedical } from 'lucide-react-native';
import { colors, layout } from '../theme';
import { appointmentService } from '../services/appointmentService';

const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

const formatTime = (time: string) => {
  const [hourText, minute] = time.slice(0, 5).split(':');
  const hour = Number(hourText);
  return `${hour % 12 || 12}:${minute} ${hour >= 12 ? 'PM' : 'AM'}`;
};

export const ManageAppointmentsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const fetchAppointments = async () => {
    try {
      const response = await appointmentService.getMine();
      setAppointments(response.appointments || []);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load appointments.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  const handleCancel = (id: number) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No, Keep it', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            setCancellingId(id);
            try {
              await appointmentService.cancel(id);
              Alert.alert('Success', 'Appointment cancelled successfully.');
              fetchAppointments();
            } catch (error: any) {
              Alert.alert('Cancellation failed', error.message || 'Could not cancel the appointment.');
            } finally {
              setCancellingId(null);
            }
          }
        }
      ]
    );
  };

  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);

  const upcomingAppointments = appointments.filter(a => {
    const apptDate = new Date(a.appointment_date);
    return apptDate.getTime() >= now.getTime() && a.status === 'booked';
  });

  const pastAppointments = appointments.filter(a => {
    const apptDate = new Date(a.appointment_date);
    return apptDate.getTime() < now.getTime() || a.status !== 'booked';
  });

  const renderAppointmentCard = (appt: any, isUpcoming: boolean) => {
    const apptDate = new Date(appt.appointment_date);
    const diffTime = apptDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Can cancel if it's upcoming and at least 1 day away
    const canCancel = isUpcoming && diffDays > 0;

    return (
      <View key={appt.id} style={[styles.card, !isUpcoming && styles.cardPast]}>
        <View style={styles.cardHeader}>
          <View style={styles.childInfo}>
            <UserRound color={colors.primary} size={18} />
            <Text style={styles.childName}>{appt.child_name}</Text>
          </View>
          <View style={[styles.statusBadge, appt.status === 'cancelled' && styles.statusBadgeCancelled, !isUpcoming && appt.status === 'booked' && styles.statusBadgeCompleted]}>
            <Text style={[styles.statusText, appt.status === 'cancelled' && styles.statusTextCancelled, !isUpcoming && appt.status === 'booked' && styles.statusTextCompleted]}>
              {appt.status === 'cancelled' ? 'Cancelled' : (!isUpcoming ? 'Completed' : 'Upcoming')}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.detailRow}>
            <BriefcaseMedical color={colors.textMuted} size={16} />
            <Text style={styles.detailText}>{appt.clinic_name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Stethoscope color={colors.textMuted} size={16} />
            <Text style={styles.detailText}>With {appt.midwife_name}</Text>
          </View>
          <View style={styles.dateTimeContainer}>
            <View style={styles.detailRow}>
              <Calendar color={colors.primary} size={16} />
              <Text style={styles.dateTimeText}>{formatDate(appt.appointment_date)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Clock color={colors.primary} size={16} />
              <Text style={styles.dateTimeText}>{formatTime(appt.start_time)}</Text>
            </View>
          </View>
        </View>

        {canCancel && (
          <View style={styles.cardFooter}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => handleCancel(appt.id)}
              disabled={cancellingId === appt.id}
            >
              {cancellingId === appt.id ? (
                <ActivityIndicator color="#EF4444" size="small" />
              ) : (
                <>
                  <XCircle color="#EF4444" size={16} />
                  <Text style={styles.cancelButtonText}>Cancel Appointment</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft color={colors.textDark} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Appointments</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        >
          {appointments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Calendar color={colors.textMuted} size={48} />
              <Text style={styles.emptyTitle}>No Appointments</Text>
              <Text style={styles.emptySubtitle}>You haven't booked any appointments yet.</Text>
            </View>
          ) : (
            <>
              {upcomingAppointments.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Upcoming</Text>
                  {upcomingAppointments.map(a => renderAppointmentCard(a, true))}
                </View>
              )}

              {pastAppointments.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Past & Cancelled</Text>
                  {pastAppointments.map(a => renderAppointmentCard(a, false))}
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4FAFA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.padding,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: '#F4FAFA'},
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textDark },
  scrollContent: { padding: layout.padding, paddingBottom: 40 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textDark, marginBottom: 12 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 60, padding: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.textDark, marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D7E1E3',
    marginBottom: 16,
    overflow: 'hidden'},
  cardPast: {
    opacity: 0.75},
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'},
  childInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8},
  childName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textDark},
  statusBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8},
  statusText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '600'},
  statusBadgeCancelled: {
    backgroundColor: '#FEF2F2'},
  statusTextCancelled: {
    color: '#DC2626'},
  statusBadgeCompleted: {
    backgroundColor: '#F3F4F6'},
  statusTextCompleted: {
    color: '#4B5563'},
  cardBody: {
    padding: 16,
    gap: 12},
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8},
  detailText: {
    fontSize: 14,
    color: colors.textDark},
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    marginTop: 4},
  dateTimeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary},
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    padding: 12,
    backgroundColor: '#FAFAFA'},
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8},
  cancelButtonText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 14}
});
