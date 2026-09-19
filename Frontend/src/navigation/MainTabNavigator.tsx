import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Baby, Calendar, BookOpen, User } from 'lucide-react-native';
import { colors } from '../theme';
import { useLanguage } from '../i18n/LanguageContext';

import { ParentDashboardScreen } from '../screens/ParentDashboardScreen';
import { ChildrenScreen } from '../screens/ChildrenScreen';
import { ScheduleScreen } from '../screens/ScheduleScreen';
import { LearnScreen } from '../screens/LearnScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SupervisorDashboardScreen } from '../screens/SupervisorDashboardScreen';
import { useAuth } from '../context/AuthContext';

const Tab = createBottomTabNavigator();

export const MainTabNavigator = () => {
  const { t } = useLanguage();
  const { role } = useAuth();

  const isSupervisor = role === 'admin' || role === 'moh' || role === 'supervisor';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: 'rgba(0,0,0,0.05)',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        }
      }}
    >
      {isSupervisor ? (
        <Tab.Screen 
          name="VaccinesTab" 
          component={SupervisorDashboardScreen} 
          options={{
            tabBarLabel: 'Vaccines',
            tabBarIcon: ({ color, size }) => (
              <BookOpen color={color} size={24} />
            ),
          }}
        />
      ) : (
        <>
          <Tab.Screen 
            name="HomeTab" 
            component={ParentDashboardScreen} 
            options={{
              tabBarLabel: t('tabHome'),
              tabBarIcon: ({ color, size }) => (
                <Home color={color} size={24} />
              ),
            }}
          />
          <Tab.Screen 
            name="ChildrenTab" 
            component={ChildrenScreen} 
            options={{
              tabBarLabel: t('tabChildren'),
              tabBarIcon: ({ color, size }) => (
                <Baby color={color} size={24} />
              ),
            }}
          />
          <Tab.Screen 
            name="ScheduleTab" 
            component={ScheduleScreen} 
            options={{
              tabBarLabel: t('tabSchedule'),
              tabBarIcon: ({ color, size }) => (
                <Calendar color={color} size={24} />
              ),
            }}
          />
          <Tab.Screen 
            name="LearnTab" 
            component={LearnScreen} 
            options={{
              tabBarLabel: t('tabLearn'),
              tabBarIcon: ({ color, size }) => (
                <BookOpen color={color} size={24} />
              ),
            }}
          />
        </>
      )}
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen} 
        options={{
          tabBarLabel: t('tabProfile'),
          tabBarIcon: ({ color, size }) => (
            <User color={color} size={24} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};


