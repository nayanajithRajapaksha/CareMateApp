import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, Thermometer, Heart, AlertCircle, CheckCircle2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme';

export const AfterVaccineScreen: React.FC = () => {
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
        
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>After the Vaccine</Text>
          <Text style={styles.subTitle}>
            A practical guide for parents on managing post-vaccination side effects, ensuring your child's comfort and your peace of mind.
          </Text>
        </View>

        {/* Hero Image */}
        <View style={styles.heroImageContainer}>
          <Image 
            source={require('../../assets/after_vaccine.png')} 
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        {/* Common Mild Reactions Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: '#CBEBE9' }]}>
              <Thermometer color="#117871" size={20} />
            </View>
            <Text style={styles.cardTitle}>Common Mild Reactions</Text>
          </View>
          
          <Text style={styles.cardDescription}>
            It's completely normal for your child to experience some mild side effects after a vaccination. This indicates their immune system is working.
          </Text>

          <View style={styles.listItem}>
            <CheckCircle2 color="#117871" size={20} style={styles.listIcon} />
            <View style={styles.listTextContainer}>
              <Text style={styles.listTitle}>Slight Fever</Text>
              <Text style={styles.listDesc}>A low-grade fever (under 101°F/38.3°C) is common in the first 24-48 hours.</Text>
            </View>
          </View>

          <View style={styles.listItem}>
            <CheckCircle2 color="#117871" size={20} style={styles.listIcon} />
            <View style={styles.listTextContainer}>
              <Text style={styles.listTitle}>Soreness or Redness</Text>
              <Text style={styles.listDesc}>The injection site may be tender, slightly swollen, or red.</Text>
            </View>
          </View>

          <View style={styles.listItem}>
            <CheckCircle2 color="#117871" size={20} style={styles.listIcon} />
            <View style={styles.listTextContainer}>
              <Text style={styles.listTitle}>Fussiness or Fatigue</Text>
              <Text style={styles.listDesc}>Your child may be more irritable than usual or sleep more.</Text>
            </View>
          </View>
        </View>

        {/* How to Soothe Card */}
        <View style={[styles.card, { backgroundColor: '#F0F9F8', borderColor: '#D4ECEC' }]}>
          <View style={styles.cardHeader}>
            <Heart color="#117871" size={24} style={{ marginRight: 12 }} />
            <Text style={styles.cardTitle}>How to Soothe</Text>
          </View>

          <View style={styles.sootheBlock}>
            <Text style={styles.sootheTitle}>Extra Comfort</Text>
            <Text style={styles.sootheDesc}>Provide extra cuddles and quiet time. Keeping them calm helps reduce stress.</Text>
          </View>

          <View style={styles.sootheBlock}>
            <Text style={styles.sootheTitle}>Cool Compress</Text>
            <Text style={styles.sootheDesc}>Apply a cool, damp cloth to the injection site to ease soreness.</Text>
          </View>

          <View style={styles.sootheBlock}>
            <Text style={styles.sootheTitle}>Hydration</Text>
            <Text style={styles.sootheDesc}>Offer plenty of fluids. A lukewarm sponge bath can also help if they feel warm.</Text>
          </View>
        </View>

        {/* When to Call a Doctor Card */}
        <View style={[styles.card, { backgroundColor: '#FEF2F2', borderColor: '#FEE2E2' }]}>
          <View style={styles.cardHeader}>
            <AlertCircle color="#DC2626" size={24} style={{ marginRight: 12 }} />
            <Text style={[styles.cardTitle, { color: '#053130' }]}>When to Call a Doctor</Text>
          </View>

          <Text style={[styles.cardDescription, { color: '#4A6261', marginBottom: 16 }]}>
            While most reactions are mild, seek medical advice if you notice any of the following:
          </Text>

          <View style={styles.alertItem}>
            <View style={styles.alertDot} />
            <Text style={styles.alertText}>Fever above 104°F (40°C)</Text>
          </View>

          <View style={styles.alertItem}>
            <View style={styles.alertDot} />
            <Text style={styles.alertText}>Crying continuously for {'>'}3 hours</Text>
          </View>

          <View style={styles.alertItem}>
            <View style={styles.alertDot} />
            <Text style={styles.alertText}>Seizures or unusual unresponsiveness</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FAFA', // Light cyan background matching screenshots
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
  },
  titleSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#053130',
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 15,
    color: '#4A6261',
    lineHeight: 22,
  },
  heroImageContainer: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#053130',
  },
  cardDescription: {
    fontSize: 15,
    color: '#4A6261',
    lineHeight: 22,
    marginBottom: 20,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  listIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  listTextContainer: {
    flex: 1,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#053130',
    marginBottom: 4,
  },
  listDesc: {
    fontSize: 14,
    color: '#4A6261',
    lineHeight: 20,
  },
  sootheBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D4ECEC',
  },
  sootheTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#117871',
    marginBottom: 6,
  },
  sootheDesc: {
    fontSize: 14,
    color: '#4A6261',
    lineHeight: 20,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
    marginRight: 12,
  },
  alertText: {
    fontSize: 15,
    color: '#053130',
    fontWeight: '500',
  }
});
