import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { apiClient } from '../services/apiClient';

interface NotificationIconProps {
  color?: string;
  size?: number;
}

export const NotificationIcon: React.FC<NotificationIconProps> = ({ color = '#053130', size = 24 }) => {
  const navigation = useNavigation<any>();
  const [unreadCount, setUnreadCount] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      const fetchNotifications = async () => {
        try {
          const response = await apiClient('/users/notifications');
          const count = (response.notifications || []).filter((n: any) => !n.is_read).length;
          setUnreadCount(count);
        } catch (error) {
          console.error('Failed to fetch notifications for icon', error);
        }
      };
      
      fetchNotifications();
    }, [])
  );

  return (
    <TouchableOpacity style={styles.container} onPress={() => navigation.navigate('Notification')}>
      <Bell color={color} size={size} />
      {unreadCount > 0 && (
        <View style={styles.dot} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 5,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    position: 'absolute',
    top: 6,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  }
});
