import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { ArrowRight, BriefcaseMedical, ChevronRight, Clock, UserRound } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, layout } from '../theme';
import { childService } from '../services/childService';
import { appointmentService } from '../services/appointmentService';

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const formatTime = (time: string) => {
  const [hourText, minute] = time.slice(0, 5).split(':');
  const hour = Number(hourText);
  return `${hour % 12 || 12}:${minute} ${hour >= 12 ? 'PM' : 'AM'}`;
};
const dateLabel = (date: Date) => date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

export const ScheduleScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const clinic = route.params?.clinic;
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(route.params?.childId || null);
  const [slots, setSlots] = useState<any[]>([]);
  const [myAppointments, setMyAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const dates = useMemo(() => Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + index);
    return date;
  }), []);

  useEffect(() => {
    childService.getChildren().then(data => {
      setChildren(data.children || []);
      if (!selectedChildId && data.children?.[0]) setSelectedChildId(data.children[0].id);
    }).catch(error => Alert.alert('Unable to load children', error.message));
  }, [selectedChildId]);

  const loadAvailability = useCallback(async () => {
    if (!clinic?.id) {
      setSlots([]);
      return;
    }
    setLoading(true);
    setSelectedTime('');
    try {
      const [data, myAppsData] = await Promise.all([
        appointmentService.getAvailability(clinic.id, formatDate(selectedDate)),
        appointmentService.getMine().catch(() => ({ appointments: [] }))
      ]);
      setSlots(data.slots || []);
      setMyAppointments(myAppsData.appointments || []);
    } catch (error: any) {
      Alert.alert('Unable to load times', error.message);
    } finally {
      setLoading(false);
    }
  }, [clinic?.id, selectedDate]);

  useEffect(() => { loadAvailability(); }, [loadAvailability]);

  const handleBooking = async () => {
    if (!clinic?.id) {
      navigation.navigate('SelectClinic', { mode: 'select' });
      return;
    }
    if (!selectedChildId || !selectedTime) {
      Alert.alert('Choose details', 'Select a child and an available 30-minute time slot.');
      return;
    }
    setBooking(true);
    try {
      await appointmentService.book({ clinic_id: clinic.id, child_id: selectedChildId, appointment_date: formatDate(selectedDate), start_time: selectedTime });
      Alert.alert('Booking confirmed', `${dateLabel(selectedDate)} at ${formatTime(selectedTime)}.`, [{ text: 'Done', onPress: () => loadAvailability() }]);
    } catch (error: any) {
      Alert.alert('Booking failed', error.message);
      loadAvailability();
    } finally {
      setBooking(false);
    }
  };

  const handleCancel = async (appointmentId: number) => {
    setBooking(true);
    try {
      await appointmentService.cancel(appointmentId);
      Alert.alert('Appointment Cancelled', 'Your appointment has been cancelled successfully.', [{ text: 'Done', onPress: () => loadAvailability() }]);
    } catch (error: any) {
      Alert.alert('Cancellation failed', error.message);
    } finally {
      setBooking(false);
    }
  };

  const selectedChild = children.find(child => String(child.id) === String(selectedChildId));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Schedule Appointment</Text>
        {clinic ? (
          <TouchableOpacity style={styles.clinicCard} onPress={() => navigation.navigate('SelectClinic', { mode: 'select' })}>
            <View style={styles.clinicIcon}><BriefcaseMedical color={colors.primary} size={24} /></View>
            <View style={styles.flex}>
              <Text style={styles.muted}>Selected Clinic</Text>
              <Text style={styles.clinicName}>{clinic.name}</Text>
              <Text style={styles.muted}>{clinic.address || clinic.type}</Text>
            </View>
            <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 14 }}>Change</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.chooseClinic} onPress={() => navigation.navigate('SelectClinic', { mode: 'select' })}>
            <BriefcaseMedical color={colors.primary} size={22} />
            <Text style={styles.chooseClinicText}>Choose a clinic to see available times</Text>
            <ChevronRight color={colors.primary} size={20} />
          </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>For which child?</Text>
        {children.length === 0 ? (
          <TouchableOpacity style={styles.emptyChild} onPress={() => navigation.navigate('RegisterChild')}>
            <Text style={styles.muted}>Add a child before booking an appointment.</Text>
          </TouchableOpacity>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.childScroll}>
            {children.map(child => (
              <TouchableOpacity key={child.id} style={[styles.childChip, String(child.id) === String(selectedChildId) && styles.childChipSelected]} onPress={() => setSelectedChildId(child.id)}>
                <UserRound size={16} color={String(child.id) === String(selectedChildId) ? colors.white : colors.primary} />
                <Text style={[styles.childChipText, String(child.id) === String(selectedChildId) && styles.selectedText]}>{child.full_name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <Text style={styles.sectionTitle}>Select date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
          {dates.map(date => {
            const selected = formatDate(date) === formatDate(selectedDate);
            return <TouchableOpacity key={formatDate(date)} style={[styles.dateChip, selected && styles.dateChipSelected]} onPress={() => setSelectedDate(date)}>
              <Text style={[styles.dateDay, selected && styles.selectedText]}>{date.toLocaleDateString(undefined, { weekday: 'short' })}</Text>
              <Text style={[styles.dateNumber, selected && styles.selectedText]}>{date.getDate()}</Text>
            </TouchableOpacity>;
          })}
        </ScrollView>

        <View style={styles.timeHeading}><Text style={styles.sectionTitle}>Available times</Text><Clock color={colors.textMuted} size={18} /></View>
        {loading ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : !clinic ? <Text style={styles.muted}>Select a clinic first.</Text> : slots.length === 0 ? <Text style={styles.muted}>No midwife availability is configured for this clinic yet.</Text> : (
          <View style={styles.timeGrid}>
            {slots.map(slot => {
              const selected = selectedTime === slot.start_time;
              const userAppt = myAppointments.find(a => 
                a.status === 'booked' && 
                String(a.child_id) === String(selectedChildId) && 
                a.start_time.slice(0, 5) === slot.start_time && 
                formatDate(new Date(a.appointment_date)) === formatDate(selectedDate) &&
                Number(a.clinic_id) === Number(clinic.id)
              );
              const isUserBooked = !!userAppt;

              return <TouchableOpacity 
                key={slot.start_time} 
                disabled={!slot.available && !isUserBooked} 
                onPress={() => setSelectedTime(slot.start_time)} 
                style={[
                  styles.timeButton, 
                  !slot.available && !isUserBooked && styles.timeDisabled, 
                  isUserBooked && !selected && { backgroundColor: '#15803D', borderColor: '#15803D' },
                  selected && !isUserBooked && styles.timeSelected,
                  selected && isUserBooked && { backgroundColor: '#DC2626', borderColor: '#DC2626' }
                ]}>
                <Text style={[
                  styles.timeText, 
                  !slot.available && !isUserBooked && styles.disabledText, 
                  isUserBooked && !selected && { color: '#FFFFFF' }, 
                  selected && styles.selectedText
                ]}>{formatTime(slot.start_time)}</Text>
                <Text style={[
                  styles.remainingText, 
                  !slot.available && !isUserBooked && styles.disabledText, 
                  isUserBooked && !selected && { color: '#DCFCE7' }, 
                  selected && styles.selectedText
                ]}>
                  {isUserBooked ? 'Booked' : (slot.available ? `${slot.remaining} left` : 'Full')}
                </Text>
              </TouchableOpacity>;
            })}
          </View>
        )}
        {selectedChild && selectedTime && <Text style={styles.summary}>Selected {selectedChild.full_name} for {formatTime(selectedTime)} on {dateLabel(selectedDate)}.</Text>}
      </ScrollView>
      <View style={styles.footer}>
        {(() => {
          const selectedUserAppt = myAppointments.find(a => 
            a.status === 'booked' && 
            String(a.child_id) === String(selectedChildId) && 
            a.start_time.slice(0, 5) === selectedTime && 
            formatDate(new Date(a.appointment_date)) === formatDate(selectedDate) &&
            Number(a.clinic_id) === Number(clinic?.id)
          );
          const isSelectedTimeBooked = !!selectedUserAppt;

          return (
            <TouchableOpacity 
              style={[styles.continueButton, isSelectedTimeBooked && { backgroundColor: '#DC2626' }]} 
              onPress={isSelectedTimeBooked ? () => handleCancel(selectedUserAppt.id) : handleBooking} 
              disabled={booking}
            >
              {booking ? <ActivityIndicator color={colors.white} /> : <><Text style={styles.continueText}>{!clinic ? 'Choose Clinic' : isSelectedTimeBooked ? 'Cancel Appointment' : 'Book Appointment'}</Text><ArrowRight color={colors.white} size={20} /></>}
            </TouchableOpacity>
          );
        })()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4FAFA' },
  flex: { flex: 1 },
  scrollContent: { padding: layout.padding, paddingBottom: 100 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: colors.textDark, marginTop: 10, marginBottom: 16 },
  clinicCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#D7E1E3', marginBottom: 16 },
  clinicIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#D9F3F6', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  clinicName: { fontSize: 15, fontWeight: '700', color: colors.textDark, marginVertical: 2 },
  muted: { color: colors.textMuted, fontSize: 13 },
  chooseClinic: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10, backgroundColor: colors.white, borderRadius: 12, marginBottom: 16 },
  chooseClinicText: { flex: 1, color: colors.textDark, fontWeight: '600', fontSize: 14 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.textDark, marginBottom: 8 },
  childScroll: { marginBottom: 16 },
  childChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16, backgroundColor: colors.white, borderWidth: 1, borderColor: '#CBD5E1', marginRight: 8 },
  childChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  childChipText: { color: colors.textDark, fontWeight: '600', fontSize: 13 },
  selectedText: { color: colors.white },
  emptyChild: { backgroundColor: colors.white, padding: 12, borderRadius: 10, marginBottom: 16 },
  dateScroll: { marginBottom: 16 },
  dateChip: { alignItems: 'center', minWidth: 52, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.white, marginRight: 8, borderWidth: 1, borderColor: '#D7E1E3' },
  dateChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  dateDay: { fontSize: 11, color: colors.textMuted, marginBottom: 2 },
  dateNumber: { fontSize: 16, fontWeight: '700', color: colors.textDark },
  timeHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  timeButton: { width: '48%', backgroundColor: colors.white, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, paddingVertical: 10, alignItems: 'center', marginBottom: 10 },
  timeSelected: { backgroundColor: '#B2DFDB', borderColor: colors.primary },
  timeDisabled: { backgroundColor: '#E5E7EB', borderColor: '#E5E7EB' },
  timeText: { color: colors.textDark, fontWeight: '600', fontSize: 13 },
  remainingText: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  disabledText: { color: '#9CA3AF' },
  loader: { marginTop: 12 },
  summary: { color: colors.primary, fontWeight: '600', marginTop: 6, lineHeight: 18, fontSize: 13 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12, paddingBottom: 16, backgroundColor: '#F4FAFA', borderTopWidth: 1, borderTopColor: '#D7E1E3' },
  continueButton: { minHeight: 48, borderRadius: 10, backgroundColor: colors.primary, flexDirection: 'row', gap: 8, justifyContent: 'center', alignItems: 'center' },
  continueText: { color: colors.white, fontSize: 15, fontWeight: '700' },
});
