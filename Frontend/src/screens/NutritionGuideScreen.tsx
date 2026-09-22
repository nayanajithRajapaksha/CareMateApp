import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bookmark, Share2, Lightbulb, TriangleAlert, CupSoda } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export const NutritionGuideScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.canGoBack() && navigation.goBack()}>
          <ArrowLeft color="#053130" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nutrition Guide</Text>
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
          source={require('../../assets/toddler_nutrition_plate.jpg')}
          style={styles.heroImage}
          resizeMode="cover"
        />

        <View style={styles.contentPadding}>
          {/* Tags */}
          <View style={styles.tagsContainer}>
            <View style={styles.tagBadge}>
              <Text style={styles.tagText}>Nutrition</Text>
            </View>
            <View style={styles.tagBadge}>
              <Text style={styles.tagText}>1-3 Years</Text>
            </View>
          </View>

          {/* Title & Author */}
          <Text style={styles.articleTitle}>Nutrition Guide{'\n'}for Toddlers</Text>
          <View style={styles.authorRow}>
            <View style={styles.authorAvatar}>
              <Text style={styles.authorInitial}>Dr</Text>
            </View>
            <Text style={styles.authorText}>By Dr. Amarasinghe • 5 min read</Text>
          </View>

          {/* Text Content */}
          <Text style={styles.paragraph}>
            Ensuring your toddler receives the right balance of nutrients is crucial for their rapid physical and cognitive development during these formative years. As they transition from infant formulas or breast milk to solid foods, introducing a variety of textures and flavors helps establish healthy lifelong eating habits.
          </Text>

          <Text style={styles.subHeading}>Building a Balanced Plate</Text>
          <Text style={styles.paragraph}>
            A toddler's stomach is small, so they need nutrient-dense meals and snacks spread throughout the day. Aim for three small meals and two to three healthy snacks daily. Each main meal should ideally include components from major food groups.
          </Text>

          {/* Bullet List */}
          <View style={styles.bulletItem}>
            <Text style={styles.paragraph}>
              <Text style={styles.boldText}>Proteins: </Text>Essential for growth. Include lean meats, poultry, fish, eggs, beans, and lentils.
            </Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.paragraph}>
              <Text style={styles.boldText}>Carbohydrates: </Text>Provide necessary energy. Focus on whole grains like brown rice, whole-wheat pasta, and oats.
            </Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.paragraph}>
              <Text style={styles.boldText}>Fruits & Vegetables: </Text>Vital for vitamins, minerals, and fiber. Offer a rainbow of colors daily.
            </Text>
          </View>
          <View style={styles.bulletItem}>
            <Text style={styles.paragraph}>
              <Text style={styles.boldText}>Dairy or Alternatives: </Text>Crucial for calcium and bone health. Whole milk, yogurt, and cheese are excellent choices for this age group.
            </Text>
          </View>

          {/* Key Tip Box */}
          <View style={styles.tipBox}>
            <View style={styles.tipHeader}>
              <Lightbulb color="#117871" size={18} style={{ marginRight: 8 }} />
              <Text style={styles.tipTitle}>Key Tip: Managing Picky Eating</Text>
            </View>
            <Text style={styles.tipText}>
              It's common for toddlers to suddenly refuse foods they previously loved. Keep offering a variety of healthy options without pressuring them to eat. It can take up to 15 exposures to a new food before a child accepts it.
            </Text>
          </View>

          <Text style={styles.subHeading}>Foods to Limit or Avoid</Text>
          <Text style={styles.paragraph}>
            While exploring new foods is encouraged, certain items should be restricted to protect a toddler's developing system and prevent choking hazards.
          </Text>

          {/* Hazard Cards */}
          <View style={styles.hazardCard}>
            <View style={styles.hazardHeader}>
              <TriangleAlert color="#E74C3C" size={18} style={{ marginRight: 8 }} />
              <Text style={styles.hazardTitleRed}>Choking Hazards</Text>
            </View>
            <Text style={styles.hazardText}>
              Avoid whole grapes, nuts, popcorn, hot dogs (unless cut lengthwise), and hard candies.
            </Text>
          </View>

          <View style={styles.hazardCard}>
            <View style={styles.hazardHeader}>
              <CupSoda color="#475569" size={18} style={{ marginRight: 8 }} />
              <Text style={styles.hazardTitleBlue}>Added Sugars & Sodium</Text>
            </View>
            <Text style={styles.hazardText}>
              Limit fruit juices (even 100% juice), highly processed snacks, and foods with high added salt content.
            </Text>
          </View>

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
    color: '#117871', // teal title in header
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
    marginBottom: -4, // Counteract paragraph margin for tight list
  },
  boldText: {
    fontWeight: 'bold',
    color: '#053130',
  },
  tipBox: {
    backgroundColor: '#D2EEED',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#053130',
  },
  tipText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  hazardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  hazardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  hazardTitleRed: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E74C3C',
  },
  hazardTitleBlue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#475569',
  },
  hazardText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  actionButtonsContainer: {
    marginTop: 20,
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
