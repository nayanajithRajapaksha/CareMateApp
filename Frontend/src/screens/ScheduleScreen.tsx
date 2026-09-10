import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { BriefcaseMedical, ChevronLeft, ChevronRight, Sun, ArrowRight } from 'lucide-react-native';
import { colors, typography, layout } from '../theme';

const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
// Mock static calendar days for October 2023 snippet
const calendarDays = [
  { day: 29, currentMonth: false },
  { day: 30, currentMonth: false },
  { day: 1, currentMonth: true },
  { day: 2, currentMonth: true },
  { day: 3, currentMonth: true },
  { day: 4, currentMonth: true },
  { day: 5, currentMonth: true },
  { day: 6, currentMonth: true },
  { day: 7, currentMonth: true },
  { day: 8, currentMonth: true },
  { day: 9, currentMonth: true },
  { day: 10, currentMonth: true },
  { day: 11, currentMonth: true },
  { day: 12, currentMonth: true },
  { day: 13, currentMonth: true },
  { day: 14, currentMonth: true }, // Selected
  { day: 15, currentMonth: true },
  { day: 16, currentMonth: true },
  { day: 17, currentMonth: true },
  { day: 18, currentMonth: true },
  { day: 19, currentMonth: true },
];

const timeSlots = [
  { time: '09:00 AM', available: true },
  { time: '09:30 AM', available: false },
  { time: '10:00 AM', available: true },
  { time: '10:30 AM', available: true }, // Selected
  { time: '11:00 AM', available: true },
  { time: '11:30 AM', available: true },
];

export const ScheduleScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(14);
  const [selectedTime, setSelectedTime] = useState('10:30 AM');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Schedule Appointment</Text>
        </View>

        {/* Selected Clinic */}
        <View style={styles.clinicCard}>
          <View style={styles.clinicIconContainer}>
            <BriefcaseMedical color={colors.primary} size={24} />
          </View>
          <View style={styles.clinicInfo}>
            <Text style={styles.clinicLabel}>Selected Clinic</Text>
            <Text style={styles.clinicName}>Dediyawala Clinic</Text>
            <Text style={styles.clinicDoctor}>Dr. Sarah Jenkins • General Practice</Text>
          </View>
        </View>

        {/* Date Selector */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Select Date</Text>
            <View style={styles.monthSelector}>
              <TouchableOpacity style={styles.monthArrow}>
                <ChevronLeft color={colors.textDark} size={16} />
              </TouchableOpacity>
              <Text style={styles.monthText}>October 2023</Text>
              <TouchableOpacity style={styles.monthArrow}>
                <ChevronRight color={colors.textDark} size={16} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.calendarContainer}>
            {/* Days of Week */}
            <View style={styles.daysRow}>
              {daysOfWeek.map((day, index) => (
                <Text key={`dow-${index}`} style={styles.dowText}>{day}</Text>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
              {calendarDays.map((item, index) => {
                const isSelected = item.currentMonth && item.day === selectedDate;
                return (
                  <TouchableOpacity 
                    key={`day-${index}`} 
                    style={[styles.dayCell, isSelected && styles.selectedDayCell]}
                    onPress={() => item.currentMonth && setSelectedDate(item.day)}
                    disabled={!item.currentMonth}
                  >
                    <Text style={[
                      styles.dayText, 
                      !item.currentMonth && styles.disabledDayText,
                      isSelected && styles.selectedDayText
                    ]}>
                      {item.day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Time Slots */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Times</Text>
          <View style={styles.timeSectionHeader}>
            <Sun color={colors.textMuted} size={16} />
            <Text style={styles.timeSectionText}>Morning</Text>
          </View>

          <View style={styles.timeGrid}>
            {timeSlots.map((slot, index) => {
              const isSelected = slot.time === selectedTime;
              return (
                <TouchableOpacity 
                  key={`time-${index}`}
                  style={[
                    styles.timeButton,
                    !slot.available && styles.disabledTimeButton,
                    isSelected && styles.selectedTimeButton
                  ]}
                  onPress={() => slot.available && setSelectedTime(slot.time)}
                  disabled={!slot.available}
                >
                  <Text style={[
                    styles.timeButtonText,
                    !slot.available && styles.disabledTimeButtonText,
                    isSelected && styles.selectedTimeButtonText
                  ]}>
                    {slot.time}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueBtn}>
          <Text style={styles.continueBtnText}>Continue</Text>
          <ArrowRight color={colors.white} size={20} style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FAFA',
  },
  scrollContent: {
    padding: layout.padding,
    paddingBottom: 100, // Space for footer
  },
  header: {
    marginTop: 20,
    marginBottom: 24,
  },
  headerTitle: {
    ...typography.h1,
  },
  clinicCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
  },
  clinicIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E6F4F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  clinicInfo: {
    flex: 1,
  },
  clinicLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 2,
  },
  clinicName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 2,
  },
  clinicDoctor: {
    fontSize: 13,
    color: colors.textMuted,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthArrow: {
    padding: 4,
  },
  monthText: {
    fontSize: 14,
    color: colors.textDark,
    fontWeight: '500',
    marginHorizontal: 8,
  },
  calendarContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dowText: {
    width: 32,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedDayCell: {
    backgroundColor: colors.primary,
    borderRadius: 20, // Circular highlight
  },
  dayText: {
    fontSize: 16,
    color: colors.textDark,
  },
  disabledDayText: {
    color: '#D1D5DB', // Very light grey for non-current month
  },
  selectedDayText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  timeSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  timeSectionText: {
    fontSize: 14,
    color: colors.textMuted,
    marginLeft: 6,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12, // Requires RN 0.71+, else we use margins. Let's use standard spacing.
  },
  timeButton: {
    width: '48%', // 2 columns with a bit of space
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedTimeButton: {
    backgroundColor: '#B2DFDB', // Light teal fill
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  disabledTimeButton: {
    backgroundColor: '#E5E7EB',
    borderColor: '#E5E7EB',
  },
  timeButtonText: {
    fontSize: 15,
    color: colors.textDark,
    fontWeight: '500',
  },
  selectedTimeButtonText: {
    color: colors.textDark,
    fontWeight: '600',
  },
  disabledTimeButtonText: {
    color: '#9CA3AF',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: layout.padding,
    paddingBottom: 32, // Extra padding for safe area
    backgroundColor: '#F4FAFA', // Match background
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  continueBtn: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  }
});
