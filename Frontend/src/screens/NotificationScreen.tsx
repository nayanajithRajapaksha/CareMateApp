import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, layout } from '../theme';
import { apiClient } from '../services/apiClient';
import { useLanguage } from '../i18n/LanguageContext';

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export const NotificationScreen: React.FC = () => {
  const { t } = useLanguage();
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.get('/users/notifications');
      setNotifications(response.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number, isRead: boolean) => {
    if (isRead) return; // Already read
    
    // Optimistic UI update
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );

    try {
      await apiClient.put(`/users/notifications/${id}/read`);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Revert if failed
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: false } : n)
      );
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity 
      style={[styles.notificationCard, !item.is_read && styles.unreadCard]}
      onPress={() => markAsRead(item.id, item.is_read)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Bell color={item.is_read ? colors.textMuted : colors.primary} size={24} />
      </View>
      <View style={styles.contentContainer}>
        <Text style={[styles.title, !item.is_read && styles.unreadText]}>{item.title}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.timeText}>{formatDate(item.created_at)}</Text>
      </View>
      {!item.is_read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color={colors.textDark} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('notificationsTitle')}</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Bell color={colors.border} size={48} />
              <Text style={styles.emptyText}>{t('noNotifications')}</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.padding,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  listContent: {
    padding: layout.padding,
    paddingBottom: 40,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  unreadCard: {
    backgroundColor: '#F0F9FA', // Very light primary tint
    borderColor: 'rgba(11, 163, 96, 0.2)',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 4,
  },
  unreadText: {
    color: colors.primary,
  },
  message: {
    fontSize: 14,
    color: colors.textDark,
    lineHeight: 20,
    marginBottom: 8,
  },
  timeText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textMuted,
  }
});
