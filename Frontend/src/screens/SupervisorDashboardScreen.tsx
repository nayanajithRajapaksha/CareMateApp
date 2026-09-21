import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Shield, Clock, Bell } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, layout } from '../theme';
import { vaccineService, Vaccine } from '../services/vaccineService';
import { useLanguage } from '../i18n/LanguageContext';
import { PrimaryButton } from '../components/PrimaryButton';

export const SupervisorDashboardScreen: React.FC = () => {
  const { t } = useLanguage();
  const navigation = useNavigation<any>();
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [ageMonths, setAgeMonths] = useState('');

  useEffect(() => {
    fetchVaccines();
  }, []);

  const fetchVaccines = async () => {
    setLoading(true);
    try {
      const res = await vaccineService.getVaccines();
      setVaccines(res.vaccines || []);
    } catch (error) {
      console.error('Error fetching vaccines:', error);
      Alert.alert('Error', 'Failed to load vaccine schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVaccine = async () => {
    if (!name || !ageMonths) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      await vaccineService.addVaccine({
        name,
        recommended_age_months: parseInt(ageMonths, 10),
      });
      setShowAddForm(false);
      setName('');
      setAgeMonths('');
      fetchVaccines();
    } catch (error) {
      console.error('Error adding vaccine:', error);
      Alert.alert('Error', 'Failed to add vaccine');
    }
  };

  const renderItem = ({ item }: { item: Vaccine }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Shield color={colors.primary} size={24} />
        <Text style={styles.cardTitle}>{item.name}</Text>
      </View>
      <View style={styles.cardBody}>
        <Clock color={colors.textMuted} size={16} />
        <Text style={styles.cardAge}>Recommended Age: {item.recommended_age_months} months</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vaccine Master Schedule</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
            <Bell color={colors.textDark} size={24} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddForm(!showAddForm)}>
            <Plus color={colors.white} size={20} />
          </TouchableOpacity>
        </View>
      </View>

      {showAddForm && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Add New Vaccine</Text>
          <TextInput
            style={styles.input}
            placeholder="Vaccine Name (e.g., MMR)"
            value={name}
            onChangeText={setName}
            placeholderTextColor={colors.textMuted}
          />
          <TextInput
            style={styles.input}
            placeholder="Recommended Age (in months)"
            value={ageMonths}
            onChangeText={setAgeMonths}
            keyboardType="numeric"
            placeholderTextColor={colors.textMuted}
          />
          <PrimaryButton title="Save Vaccine" onPress={handleAddVaccine} />
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={vaccines}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No vaccines found in the schedule.</Text>
          }
        />
      )}
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
    paddingHorizontal: layout.padding,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    backgroundColor: colors.white,
    padding: layout.padding,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    marginBottom: 8,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    color: colors.textDark,
  },
  listContent: {
    padding: layout.padding,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark,
    marginLeft: 12,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 36,
  },
  cardAge: {
    fontSize: 14,
    color: colors.textMuted,
    marginLeft: 6,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: 40,
  }
});
