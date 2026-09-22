import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, Shield, Users, Heart, Info, Calendar } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme';

export const WhyImmunizeScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.canGoBack() && navigation.goBack()}>
          <ArrowLeft color={colors.textDark || '#053130'} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CareMate</Text>
        <TouchableOpacity style={styles.bellButton}>
          <Bell color={colors.textDark || '#053130'} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Hero Section with text overlay */}
        <View style={styles.heroImageContainer}>
          <Image 
            source={require('../../assets/why_immunize.png')} 
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Why Immunize?</Text>
          </View>
        </View>

        <Text style={styles.introText}>
          Immunization is one of the safest and most effective ways to protect your child's health and the well-being of the community. Here is why staying on schedule matters.
        </Text>

        {/* Reason Cards */}
        <View style={styles.reasonCard}>
          <View style={[styles.iconCircle, { backgroundColor: '#E0EEED' }]}>
            <Shield color="#053130" size={20} />
          </View>
          <Text style={styles.reasonTitle}>Direct Protection</Text>
          <Text style={styles.reasonDesc}>
            Vaccines train your child's immune system to recognize and fight serious diseases, providing immunity before exposure.
          </Text>
        </View>

        <View style={styles.reasonCard}>
          <View style={[styles.iconCircle, { backgroundColor: '#E0EEED' }]}>
            <Users color="#053130" size={20} />
          </View>
          <Text style={styles.reasonTitle}>Community Defense</Text>
          <Text style={styles.reasonDesc}>
            High vaccination rates prevent outbreaks, protecting vulnerable individuals who cannot be vaccinated due to medical conditions.
          </Text>
        </View>

        <View style={styles.reasonCard}>
          <View style={[styles.iconCircle, { backgroundColor: '#BBE2E9', width: 64, height: 64, borderRadius: 16, marginBottom: 16 }]}>
            <Heart color="#053130" size={28} />
          </View>
          <Text style={styles.reasonTitle}>Long-term Health Investment</Text>
          <Text style={styles.reasonDesc}>
            Preventing disease today ensures a healthier tomorrow. Many vaccines provide lifelong protection against debilitating illnesses, reducing future healthcare interventions and ensuring your child can thrive.
          </Text>
        </View>

        <View style={[styles.reasonCard, { backgroundColor: '#F0F9F8', borderColor: '#D4ECEC' }]}>
          <View style={styles.safetyHeader}>
            <Info color="#053130" size={20} style={{ marginRight: 10 }} />
            <Text style={styles.safetyTitle}>Safety & Rigor</Text>
          </View>
          <Text style={styles.reasonDesc}>
            All vaccines undergo years of rigorous testing for safety and efficacy before approval, and are continuously monitored by global health authorities.
          </Text>
        </View>

        {/* Action Bottom Section */}
        <View style={styles.actionSection}>
          <Text style={styles.actionTitle}>Ready to review your schedule?</Text>
          <Text style={styles.actionDesc}>
            Check your personalized immunization timeline or book an appointment with your pediatrician.
          </Text>

          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.navigate('ChildVaccination')}
          >
            <Calendar color="#FFF" size={20} style={{ marginRight: 8 }} />
            <Text style={styles.primaryButtonText}>View Schedule</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('VaccineMilestones')}
          >
            <Text style={styles.secondaryButtonText}>Learn More</Text>
          </TouchableOpacity>
        </View>

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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#053130',
  },
  bellButton: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
  },
  heroImageContainer: {
    width: '100%',
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 20,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    justifyContent: 'flex-end',
    padding: 20,
    // Add a gradient in a real app, but for now we use a semi-transparent view
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  heroTitle: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  introText: {
    fontSize: 16,
    color: '#4A6261',
    lineHeight: 24,
    marginBottom: 24,
  },
  reasonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  reasonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#053130',
    marginBottom: 8,
  },
  reasonDesc: {
    fontSize: 15,
    color: '#4A6261',
    lineHeight: 22,
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  safetyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#053130',
  },
  actionSection: {
    backgroundColor: '#D2EEED',
    borderRadius: 16,
    padding: 24,
    marginTop: 8,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#053130',
    marginBottom: 8,
  },
  actionDesc: {
    fontSize: 15,
    color: '#4A6261',
    lineHeight: 22,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#117871',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#E8F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: '#117871',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
