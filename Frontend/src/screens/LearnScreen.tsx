import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native';
import { Search, ArrowRight } from 'lucide-react-native';
import { colors, typography, layout } from '../theme';

const filterTopics = ['All Topics', 'Nutrition', 'Vaccinations', 'Mental Health'];

const recentArticles = [
  {
    id: '1',
    category: 'Nutrition',
    title: 'The Essential Breastfeeding Guide for New Mothers',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=300&q=80' // Mock image of mother/baby
  },
  {
    id: '2',
    category: 'Health Basics',
    title: 'Managing Common Fevers in Toddlers at Home',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&q=80' // Mock thermometer image
  },
  {
    id: '3',
    category: 'Nutrition',
    title: 'Healthy Meal Plans for Picky Eaters',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&q=80' // Mock healthy food
  }
];

export const LearnScreen: React.FC = () => {
  const [activeTopic, setActiveTopic] = useState('All Topics');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Health Education</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search color={colors.textMuted} size={20} style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search topics, symptoms, or guides..."
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* Filter Chips */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.filterContainer}
          style={styles.filterScroll}
        >
          {filterTopics.map((topic, index) => {
            const isActive = topic === activeTopic;
            return (
              <TouchableOpacity 
                key={`topic-${index}`} 
                style={[styles.chip, isActive && styles.activeChip]}
                onPress={() => setActiveTopic(topic)}
              >
                <Text style={[styles.chipText, isActive && styles.activeChipText]}>
                  {topic}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Featured Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured</Text>
          <View style={styles.featuredCard}>
            <View style={styles.featuredImageContainer}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1631815587646-b85a1bb02246?w=600&q=80' }} // Mock doctor and child image
                style={styles.featuredImage}
              />
              <View style={styles.imageBadge}>
                <Text style={styles.imageBadgeText}>Vaccinations</Text>
              </View>
            </View>
            <View style={styles.featuredContent}>
              <Text style={styles.featuredTitle}>Understanding Childhood Immunizations</Text>
              <Text style={styles.featuredDescription}>
                A comprehensive guide for parents on the recommended vaccine schedule, benefits, and...
              </Text>
              <TouchableOpacity style={styles.readMoreBtn}>
                <Text style={styles.readMoreText}>Read More</Text>
                <ArrowRight color={colors.primary} size={16} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Recent Articles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Articles</Text>
          <View style={styles.articlesList}>
            {recentArticles.map(article => (
              <TouchableOpacity key={article.id} style={styles.articleCard}>
                <Image source={{ uri: article.image }} style={styles.articleImage} />
                <View style={styles.articleInfo}>
                  <Text style={styles.articleCategory}>{article.category}</Text>
                  <Text style={styles.articleTitle} numberOfLines={2}>{article.title}</Text>
                  <Text style={styles.articleReadTime}>{article.readTime}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
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
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: layout.padding,
    marginTop: 20,
    marginBottom: 16,
  },
  headerTitle: {
    ...typography.h1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: layout.padding,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textDark,
  },
  filterScroll: {
    marginBottom: 24,
  },
  filterContainer: {
    paddingHorizontal: layout.padding,
    gap: 8, // Space between chips
  },
  chip: {
    backgroundColor: '#E6F4F4',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8, // Fallback for gap
  },
  activeChip: {
    backgroundColor: colors.primary,
  },
  chipText: {
    color: colors.textDark,
    fontSize: 14,
    fontWeight: '500',
  },
  activeChipText: {
    color: colors.white,
  },
  section: {
    paddingHorizontal: layout.padding,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 16,
  },
  featuredCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  featuredImageContainer: {
    position: 'relative',
    height: 180,
    width: '100%',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  imageBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  imageBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  featuredContent: {
    padding: 16,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 8,
  },
  featuredDescription: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: 16,
  },
  readMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6F4F4',
    paddingVertical: 12,
    borderRadius: 12,
  },
  readMoreText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  articlesList: {
    gap: 12,
  },
  articleCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  articleImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  articleInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  articleCategory: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  articleTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 6,
    lineHeight: 20,
  },
  articleReadTime: {
    fontSize: 12,
    color: colors.textMuted,
  }
});
