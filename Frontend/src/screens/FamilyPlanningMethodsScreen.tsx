import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bookmark, Share2, Info, MapPin, CheckCircle2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export const FamilyPlanningMethodsScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#053130" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Family Planning Guide</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Bookmark color="#053130" size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Share2 color="#053130" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} bounces={false}>
        
        {/* Hero Image */}
        <Image 
          source={require('../../assets/family_planning_hands.png')}
          style={styles.heroImage}
          resizeMode="cover"
        />

        <View style={styles.contentPadding}>
          {/* Tags */}
          <View style={styles.tagsContainer}>
            <View style={styles.tagBadge}>
              <Text style={styles.tagText}>Family Planning</Text>
            </View>
            <View style={styles.tagBadge}>
              <Text style={styles.tagText}>Wellness</Text>
            </View>
          </View>

          {/* Title & Author */}
          <Text style={styles.articleTitle}>Family Planning{'\n'}in Sri Lanka</Text>
          <View style={styles.authorRow}>
            <View style={styles.authorAvatar}>
              <Text style={styles.authorInitial}>CM</Text>
            </View>
            <Text style={styles.authorText}>By CareMate • 4 min read</Text>
          </View>

          {/* Text Content */}
          <Text style={styles.paragraph}>
            Every family’s journey is different. Whether you are preparing for your first baby, considering another child, or choosing to delay pregnancy, family planning helps you make informed decisions about your future. It supports your right to decide whether and when to have children, while reducing the health risks associated with unintended pregnancies.
          </Text>

          <Text style={styles.subHeading}>Prepare for pregnancy with confidence</Text>
          <Text style={styles.paragraph}>
            A healthy pregnancy begins with care before conception. Arrange a discussion with a healthcare professional about existing health conditions, medicines, vaccinations, and any concerns about previous pregnancies or inherited conditions. This helps identify the support you may need before trying for a baby.
          </Text>
          <Text style={styles.paragraph}>
            Folic acid is an important part of this preparation. WHO recommends 400 micrograms daily from the time you begin trying to conceive until 12 weeks of pregnancy. Ask your doctor or clinic about the appropriate dose for you, as some people need a different prescription.
          </Text>

          <Text style={styles.subHeading}>Understand your family planning options</Text>
          <Text style={styles.paragraph}>
            Contraceptive methods differ in how they are used and how long they work. Options include:
          </Text>

          {/* Bullet List */}
          <View style={styles.bulletItem}>
            <CheckCircle2 color="#117871" size={16} style={styles.checkIcon} />
            <Text style={styles.listText}>
              <Text style={styles.boldText}>Condoms: </Text>Help prevent pregnancy and also protect against sexually transmitted infections.
            </Text>
          </View>
          <View style={styles.bulletItem}>
            <CheckCircle2 color="#117871" size={16} style={styles.checkIcon} />
            <Text style={styles.listText}>
              <Text style={styles.boldText}>Contraceptive pills: </Text>Require regular use according to the prescribed instructions.
            </Text>
          </View>
          <View style={styles.bulletItem}>
            <CheckCircle2 color="#117871" size={16} style={styles.checkIcon} />
            <Text style={styles.listText}>
              <Text style={styles.boldText}>Injectable contraceptives: </Text>Require repeat appointments at the recommended intervals.
            </Text>
          </View>
          <View style={styles.bulletItem}>
            <CheckCircle2 color="#117871" size={16} style={styles.checkIcon} />
            <Text style={styles.listText}>
              <Text style={styles.boldText}>Implants and IUDs: </Text>Provide highly effective, long-lasting, reversible contraception.
            </Text>
          </View>
          <View style={styles.bulletItem}>
            <CheckCircle2 color="#117871" size={16} style={styles.checkIcon} />
            <Text style={styles.listText}>
              <Text style={styles.boldText}>Permanent methods: </Text>Intended for people who are certain they do not want future pregnancies.
            </Text>
          </View>

          <Text style={[styles.paragraph, {marginTop: 12}]}>
            Fertility-awareness methods require careful monitoring and are generally less reliable than modern contraceptive methods. Your health, breastfeeding status, preferences, and future pregnancy plans should guide your choice with a trained healthcare provider.
          </Text>

          <Text style={styles.subHeading}>Build healthy everyday habits</Text>
          <Text style={styles.paragraph}>
            Choose varied, balanced meals using familiar foods such as vegetables, leafy greens, fruit, dhal, beans, whole grains, eggs, or fish. Limit foods and drinks high in added sugar, salt, and unhealthy fats. Healthy eating supports your general wellbeing as you prepare for parenthood.
          </Text>
          <Text style={styles.paragraph}>
            Regular physical activity and avoiding tobacco and alcohol are also part of preparing for pregnancy. Both partners can support healthier routines and discuss concerns with a healthcare professional. Small, consistent changes can make preparation more manageable.
          </Text>

          {/* Info Cards */}
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <MapPin color="#117871" size={20} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Find support in Sri Lanka</Text>
              <Text style={styles.infoDescription}>
                Your local Public Health Midwife (PHM) or Medical Officer of Health (MOH) clinic is a practical starting point for family planning advice. Ask about available methods, possible side effects, follow-up appointments, and planning pregnancy after childbirth.
              </Text>
            </View>
          </View>

          <View style={[styles.infoCard, { backgroundColor: '#E8F5F5', borderColor: '#D4ECEC' }]}>
            <View style={styles.infoIconContainer}>
              <Info color="#117871" size={20} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Take the next step</Text>
              <Text style={styles.infoDescription}>
                Write down your questions and discuss your goals with a healthcare professional. You may involve your partner if you wish, while keeping your own comfort and preferences central to the decision.
              </Text>
            </View>
          </View>
          
          <Text style={styles.disclaimerText}>
            This article provides general health information. Your PHM or doctor can help you choose care suited to your individual needs.
          </Text>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.saveButton}>
              <Bookmark color="#FFF" size={18} fill="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.saveButtonText}>Save Article</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.shareButton}>
              <Share2 color="#117871" size={18} style={{ marginRight: 8 }} />
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 60 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FAFA', // Light cyan background matching screenshot
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F4FAFA',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#117871',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 6,
    marginLeft: 8,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroImage: {
    width: '100%',
    height: 250,
  },
  contentPadding: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tagBadge: {
    backgroundColor: '#D2EEED',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
  },
  tagText: {
    fontSize: 12,
    color: '#117871',
    fontWeight: '600',
  },
  articleTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#053130',
    lineHeight: 34,
    marginBottom: 16,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  authorAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  authorInitial: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  authorText: {
    fontSize: 13,
    color: '#475569',
  },
  paragraph: {
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 22,
    marginBottom: 20,
  },
  subHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#053130',
    marginTop: 8,
    marginBottom: 12,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  checkIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  listText: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 22,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#053130',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#D2EEED',
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#B6D7D7',
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
    color: '#053130',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 13,
    color: '#4A6261',
    lineHeight: 20,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  actionButtonsContainer: {
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#117871',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  shareButton: {
    backgroundColor: '#D2EEED',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  shareButtonText: {
    color: '#117871',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
