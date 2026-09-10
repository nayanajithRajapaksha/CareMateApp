import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Pencil, User as UserIcon, Shield, Bell, Globe, FileKey, HelpCircle, ChevronRight, ExternalLink } from 'lucide-react-native';
import { colors, typography, layout } from '../theme';

const menuItems = [
  {
    id: 'security',
    icon: Shield,
    title: 'Account Security',
    subtitle: 'Password, 2FA, Devices',
    rightElement: <ChevronRight color={colors.textMuted} size={20} />
  },
  {
    id: 'notifications',
    icon: Bell,
    title: 'Notification Preferences',
    subtitle: 'Email, Push, SMS',
    rightElement: <ChevronRight color={colors.textMuted} size={20} />
  },
  {
    id: 'language',
    icon: Globe,
    title: 'Language',
    subtitle: 'English / Sinhala / Tamil',
    rightElement: (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ color: colors.primary, marginRight: 4, fontWeight: '500' }}>English</Text>
        <ChevronRight color={colors.textMuted} size={20} />
      </View>
    )
  },
  {
    id: 'privacy',
    icon: FileKey,
    title: 'Privacy Policy',
    subtitle: 'Terms, Data usage',
    rightElement: <ExternalLink color={colors.textMuted} size={20} />
  },
  {
    id: 'support',
    icon: HelpCircle,
    title: 'Help & Support',
    subtitle: 'FAQs, Contact us',
    rightElement: <ChevronRight color={colors.textMuted} size={20} />
  }
];

export const ProfileScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: 'https://i.pravatar.cc/150?img=47' }} // Same as home mock user
              style={styles.avatar} 
            />
            <TouchableOpacity style={styles.editBadge}>
              <Pencil color={colors.white} size={14} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>Nadeesha Perera</Text>
          <Text style={styles.userInfo}>nadeesha@caremate.com</Text>
          <Text style={styles.userInfo}>071-1982345</Text>
          
          <TouchableOpacity style={styles.editProfileBtn}>
            <UserIcon color={colors.primary} size={16} style={{ marginRight: 6 }} />
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Menu List */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isLast = index === menuItems.length - 1;
            
            return (
              <TouchableOpacity 
                key={item.id} 
                style={[styles.menuItem, !isLast && styles.menuItemBorder]}
              >
                <View style={styles.menuIconContainer}>
                  <Icon color={colors.primary} size={20} />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                <View style={styles.menuRightElement}>
                  {item.rightElement}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Footer Text */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>App Version 2.4.1 (Build 492)</Text>
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
    padding: layout.padding,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F4FAFA', // Match background to create cutout effect
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 4,
  },
  userInfo: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 2,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4F4',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 16,
  },
  editProfileText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  menuContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6F4F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
  },
  menuRightElement: {
    marginLeft: 8,
  },
  footerContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: colors.textMuted,
  }
});
