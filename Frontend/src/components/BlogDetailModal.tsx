import React from 'react';
import { 
  Modal, View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView 
} from 'react-native';
import { X, Clock, User, BookOpen } from 'lucide-react-native';
import { colors, typography, layout } from '../theme';
import { type Blog } from '../services/blogService';

interface BlogDetailModalProps {
  blog: Blog | null;
  visible: boolean;
  onClose: () => void;
}

export const BlogDetailModal: React.FC<BlogDetailModalProps> = ({ blog, visible, onClose }) => {
  if (!blog) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeContainer}>
        {/* Header Bar */}
        <View style={styles.topHeader}>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{blog.category}</Text>
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <X color={colors.textDark} size={22} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Cover Image */}
          {blog.cover_image ? (
            <Image source={{ uri: blog.cover_image }} style={styles.coverImage} resizeMode="cover" />
          ) : null}

          <View style={styles.bodyContent}>
            {/* Title */}
            <Text style={styles.title}>{blog.title}</Text>

            {/* Author & Read Time metadata */}
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <User color={colors.primary} size={16} />
                <Text style={styles.metaText}>{blog.author_name || 'CareMate Health'}</Text>
              </View>

              <View style={styles.metaItem}>
                <Clock color={colors.textMuted} size={16} />
                <Text style={styles.metaText}>{blog.read_time || '5 min read'}</Text>
              </View>
            </View>

            {/* Subtitle / Lead Summary */}
            {blog.subtitle ? (
              <View style={styles.subtitleBox}>
                <Text style={styles.subtitleText}>{blog.subtitle}</Text>
              </View>
            ) : null}

            {/* Render Ordered Content Blocks */}
            <View style={styles.blocksContainer}>
              {Array.isArray(blog.content_blocks) && blog.content_blocks.length > 0 ? (
                blog.content_blocks.map((block, index) => (
                  <View key={block.id || `block-${index}`} style={styles.blockItem}>
                    {/* Subtitle Block */}
                    {block.type === 'subtitle' && (
                      <Text style={styles.blockSubtitle}>{block.text}</Text>
                    )}

                    {/* Text Block */}
                    {block.type === 'text' && (
                      <Text style={styles.blockParagraph}>{block.text}</Text>
                    )}

                    {/* Image Block */}
                    {block.type === 'image' && block.url ? (
                      <View style={styles.blockImageWrapper}>
                        <Image 
                          source={{ uri: block.url }} 
                          style={styles.blockImage} 
                          resizeMode="cover" 
                        />
                        {block.caption ? (
                          <Text style={styles.blockImageCaption}>{block.caption}</Text>
                        ) : null}
                      </View>
                    ) : null}
                  </View>
                ))
              ) : (
                <Text style={styles.blockParagraph}>
                  No details provided for this article.
                </Text>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justify: 'space-between',
    paddingHorizontal: layout.padding,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  badgeContainer: {
    backgroundColor: '#E6F4F4',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  coverImage: {
    width: '100%',
    height: 220,
  },
  bodyContent: {
    padding: layout.padding,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textDark,
    lineHeight: 32,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  subtitleBox: {
    backgroundColor: '#F4FAFA',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    padding: 14,
    borderRadius: 8,
    marginBottom: 24,
  },
  subtitleText: {
    fontSize: 15,
    fontStyle: 'italic',
    color: colors.textDark,
    lineHeight: 22,
  },
  blocksContainer: {
    gap: 18,
  },
  blockItem: {
    marginBottom: 4,
  },
  blockSubtitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 8,
    marginBottom: 6,
  },
  blockParagraph: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 25,
  },
  blockImageWrapper: {
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  blockImage: {
    width: '100%',
    height: 200,
  },
  blockImageCaption: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontStyle: 'italic',
  }
});
