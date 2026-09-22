import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TextInput, 
  TouchableOpacity, Image, ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, ArrowRight, BookOpen } from 'lucide-react-native';
import { colors, typography, layout } from '../theme';
import { blogService, type Blog } from '../services/blogService';
import { BlogDetailModal } from '../components/BlogDetailModal';
import { useLanguage } from '../i18n/LanguageContext';
import { useNavigation } from '@react-navigation/native';



// Fallback seed articles in case backend has no records yet
const fallbackArticles: Blog[] = [
  {
    id: 'f1',
    category: 'Nutrition',
    title: 'The Essential Breastfeeding Guide for New Mothers',
    subtitle: 'Learn optimal positioning, latching techniques, and nutrition advice for newborn care.',
    read_time: '5 min read',
    author_name: 'Dr. Perera (MOH)',
    author_role: 'moh',
    cover_image: 'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=600&q=80',
    status: 'published',
    content_blocks: [
      { id: 'b1', type: 'subtitle', text: 'Why Breastfeeding is Vital' },
      { id: 'b2', type: 'text', text: 'Breast milk provides the ideal balance of nutrients for your baby. It has antibodies that help your baby fight off viruses and bacteria.' },
      { id: 'b3', type: 'image', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80', caption: 'Balanced mother & child nutrition meal' }
    ]
  },
  {
    id: 'f2',
    category: 'General Health',
    title: 'Managing Common Fevers in Toddlers at Home',
    subtitle: 'Recognizing high fever warning signs and safe home care remedies.',
    read_time: '4 min read',
    author_name: 'CareMate Health Team',
    author_role: 'admin',
    cover_image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80',
import { useLanguage } from '../i18n/LanguageContext';



// Fallback seed articles in case backend has no records yet
const fallbackArticles: Blog[] = [
  {
    id: 'f1',
    category: 'Nutrition',
    title: 'The Essential Breastfeeding Guide for New Mothers',
    subtitle: 'Learn optimal positioning, latching techniques, and nutrition advice for newborn care.',
    read_time: '5 min read',
    author_name: 'Dr. Perera (MOH)',
    author_role: 'moh',
    cover_image: 'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=600&q=80',
    status: 'published',
    content_blocks: [
      { id: 'b1', type: 'subtitle', text: 'Why Breastfeeding is Vital' },
      { id: 'b2', type: 'text', text: 'Breast milk provides the ideal balance of nutrients for your baby. It has antibodies that help your baby fight off viruses and bacteria.' },
      { id: 'b3', type: 'image', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80', caption: 'Balanced mother & child nutrition meal' }
    ]
  },
  {
    id: 'f2',
    category: 'General Health',
    title: 'Managing Common Fevers in Toddlers at Home',
    subtitle: 'Recognizing high fever warning signs and safe home care remedies.',
    read_time: '4 min read',
    author_name: 'CareMate Health Team',
    author_role: 'admin',
    cover_image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80',
    status: 'published',
    content_blocks: [
      { id: 'b1', type: 'subtitle', text: 'When to Treat a Fever' },
      { id: 'b2', type: 'text', text: 'A fever is usually a sign that your child’s body is fighting off an infection. Keep your child hydrated and well-rested.' }
    ]
  },
  {
    id: 'special-vaccine-milestones',
    category: 'Vaccinations',
    title: 'Vaccination Milestones',
    subtitle: 'A comprehensive guide for your child\'s first 5 years of immunizations.',
    read_time: '5 min read',
    author_name: 'CareMate',
    author_role: 'admin',
    cover_image: 'https://images.unsplash.com/photo-1631815587646-b85a1bb02246?w=600&q=80',
    status: 'published',
    content_blocks: []
  }
];

export const LearnScreen: React.FC = () => {
  const { t } = useLanguage();
  const filterTopics = [
    t('topicAllTopics'),
    t('topicNutrition'),
    t('topicVaccinations'),
    t('topicMentalHealth'),
    t('topicChildDevelopment'),
    t('topicGeneralHealth')
  ];
  const [activeTopic, setActiveTopic] = useState(t('topicAllTopics'));
  const [searchQuery, setSearchQuery] = useState('');
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const fetched = await blogService.getBlogs(
        activeTopic !== t('topicAllTopics') ? activeTopic : undefined,
        searchQuery || undefined
      );

      if (fetched && fetched.length > 0) {
        setBlogs(fetched);
      } else {
        // Filter fallback articles if API returns empty
        const filtered = fallbackArticles.filter(b => {
          const matchTopic = activeTopic === t('topicAllTopics') || t(`topic${b.category.replace(/\s+/g, '')}`) === activeTopic;
          const matchSearch = !searchQuery || b.title.toLowerCase().includes(searchQuery.toLowerCase()) || (b.subtitle && b.subtitle.toLowerCase().includes(searchQuery.toLowerCase()));
          return matchTopic && matchSearch;
        });
        setBlogs(filtered);
      }
    } catch (err) {
      console.error('Failed to load blogs in LearnScreen:', err);
      setBlogs(fallbackArticles);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [activeTopic, searchQuery]);

  const handleOpenBlog = (blog: Blog) => {
    setSelectedBlog(blog);
    setIsModalVisible(true);
  };

  // Featured article is either first blog or null
  const featuredBlog = blogs.length > 0 ? blogs[0] : null;
  const listBlogs = blogs.length > 1 ? blogs.slice(1) : blogs;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('healthEducationTitle')}</Text>
          <Text style={styles.headerSubtitle}>{t('healthEducationSubtitle')}</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search color={colors.textMuted} size={20} style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder={t('searchPlaceholder')}
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
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

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>{t('loadingArticles')}</Text>
          </View>
        ) : (
          <>
            {/* Featured Section */}
            {featuredBlog && !searchQuery && activeTopic === t('topicAllTopics') && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('featuredTitle')}</Text>
                <TouchableOpacity 
                  style={styles.featuredCard} 
                  activeOpacity={0.9}
                  onPress={() => handleOpenBlog(featuredBlog)}
                >
                  <View style={styles.featuredImageContainer}>
                    <Image 
                      source={{ uri: featuredBlog.cover_image || 'https://images.unsplash.com/photo-1631815587646-b85a1bb02246?w=600&q=80' }} 
                      style={styles.featuredImage}
                    />
                    <View style={styles.imageBadge}>
                      <Text style={styles.imageBadgeText}>{featuredBlog.category}</Text>
                    </View>
                  </View>
                  <View style={styles.featuredContent}>
                    <Text style={styles.featuredTitle}>{featuredBlog.title}</Text>
                    {featuredBlog.subtitle && (
                      <Text style={styles.featuredDescription} numberOfLines={2}>
                        {featuredBlog.subtitle}
                      </Text>
                    )}
                    <View style={styles.readMoreBtn}>
                      <Text style={styles.readMoreText}>{t('readArticle')}</Text>
                      <ArrowRight color={colors.primary} size={16} style={{ marginLeft: 4 }} />
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* Articles List */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {activeTopic !== t('topicAllTopics') ? `${activeTopic} Articles` : 'All Articles'} ({blogs.length})
              </Text>

              {blogs.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <BookOpen color={colors.textMuted} size={40} />
                  <Text style={styles.emptyText}>{t('noHealthArticlesFound')}</Text>
                </View>
              ) : (
                <View style={styles.articlesList}>
                  {listBlogs.map(article => (
                    <TouchableOpacity 
                      key={article.id} 
                      style={styles.articleCard}
                      activeOpacity={0.8}
                      onPress={() => handleOpenBlog(article)}
                    >
                      <Image 
                        source={{ uri: article.cover_image || 'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=300&q=80' }} 
                        style={styles.articleImage} 
                      />
                      <View style={styles.articleInfo}>
                        <Text style={styles.articleCategory}>{article.category}</Text>
                        <Text style={styles.articleTitle} numberOfLines={2}>{article.title}</Text>
                        <Text style={styles.articleReadTime}>{article.read_time || '5 min read'}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </>
        )}

        {/* Blog Detail Reader Modal */}
        <BlogDetailModal
          blog={selectedBlog}
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
        />

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FAFA'},
  scrollContent: {
    paddingBottom: 40},
  header: {
    paddingHorizontal: layout.padding,
    marginTop: 20,
    marginBottom: 16},
  headerTitle: {
    ...typography.h1},
  headerSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4},
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
    marginBottom: 16},
  searchIcon: {
    marginRight: 12},
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textDark},
  filterScroll: {
    marginBottom: 24},
  filterContainer: {
    paddingHorizontal: layout.padding,
    gap: 8},
  chip: {
    backgroundColor: '#E6F4F4',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8},
  activeChip: {
    backgroundColor: colors.primary},
  chipText: {
    color: colors.textDark,
    fontSize: 14,
    fontWeight: '500'},
  activeChipText: {
    color: colors.white},
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center'},
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textMuted},
  section: {
    paddingHorizontal: layout.padding,
    marginBottom: 24},
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 16},
  featuredCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    overflow: 'hidden'},
  featuredImageContainer: {
    position: 'relative',
    height: 180,
    width: '100%'},
  featuredImage: {
    width: '100%',
    height: '100%'},
  imageBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12},
  imageBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold'},
  featuredContent: {
    padding: 16},
  featuredTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 8},
  featuredDescription: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: 16},
  readMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6F4F4',
    paddingVertical: 12,
    borderRadius: 12},
  readMoreText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14},
  articlesList: {
    gap: 12},
  articleCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    marginBottom: 10},
  articleImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16},
  articleInfo: {
    flex: 1,
    justifyContent: 'center'},
  articleCategory: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4},
  articleTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 6,
    lineHeight: 20},
  articleReadTime: {
    fontSize: 12,
    color: colors.textMuted},
  emptyContainer: {
    backgroundColor: colors.white,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'},
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center'}
});
