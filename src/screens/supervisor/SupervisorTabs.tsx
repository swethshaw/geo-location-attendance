import React from 'react';
import { StyleSheet, Platform, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { 
  LayoutDashboard, 
  MapPin, 
  Users, 
  MailPlus, 
  History as HistoryIcon,
  UserCircle 
} from 'lucide-react-native';

import { SupervisorDashboardScreen } from './SupervisorDashboardScreen';
import { TeamScreen } from './TeamScreen';
import { SupervisorInviteScreen } from './SupervisorInviteScreen';
import { AttendanceScreen } from '../client/AttendanceScreen';
import { HistoryScreen as AttendanceHistoryScreen } from '../client/HistoryScreen';
import { ProfileScreen } from '../common/ProfileScreen';
import { UserDetailScreen } from '../common/UserDetailScreen';
import { Colors, Font } from '../../theme';
import { verticalScale, fontScale } from '../../utils/responsive';

const Tab = createBottomTabNavigator();

export function SupervisorTabs() {
  return (
    <Tab.Navigator
      screenOptions={{

        headerShown: false, 
        tabBarStyle: styles.tabBar,

        tabBarBackground: () => (
          <View style={styles.blurContainer}>
            <BlurView
              tint="dark"
              intensity={85}
              style={StyleSheet.absoluteFill}
            />

            <View style={styles.glassHighlight} />
          </View>
        ),
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: { 
          fontSize: fontScale(9), 

          fontWeight: '600',
          marginBottom: verticalScale(4),
        },
        tabBarItemStyle: {
          paddingTop: verticalScale(8),
        },

        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={SupervisorDashboardScreen} 
        options={{ 
          tabBarLabel: 'Home', 
          tabBarIcon: ({ focused, color }) => (
            <LayoutDashboard color={color} size={20} strokeWidth={focused ? 2.5 : 2} />
          ) 
        }} 
      />
      
      <Tab.Screen 
        name="Attendance" 
        component={AttendanceScreen} 
        options={{ 
          tabBarLabel: 'Check In', 
          tabBarIcon: ({ focused, color }) => (
            <MapPin color={color} size={20} strokeWidth={focused ? 2.5 : 2} />
          ) 
        }} 
      />
      
      <Tab.Screen 
        name="Clients" 
        component={TeamScreen} 
        options={{ 
          tabBarLabel: 'Clients', 
          tabBarIcon: ({ focused, color }) => (
            <Users color={color} size={20} strokeWidth={focused ? 2.5 : 2} />
          ) 
        }} 
      />
      
      <Tab.Screen 
        name="Invite" 
        component={SupervisorInviteScreen} 
        options={{ 
          tabBarLabel: 'Invite', 
          tabBarIcon: ({ focused, color }) => (
            <MailPlus color={color} size={20} strokeWidth={focused ? 2.5 : 2} />
          ) 
        }} 
      />
      
      <Tab.Screen 
        name="History" 
        component={AttendanceHistoryScreen} 
        options={{ 
          tabBarLabel: 'Logs', 
          tabBarIcon: ({ focused, color }) => (
            <HistoryIcon color={color} size={20} strokeWidth={focused ? 2.5 : 2} />
          ) 
        }} 
      />
      
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          tabBarLabel: 'Profile', 
          tabBarIcon: ({ focused, color }) => (
            <UserCircle color={color} size={20} strokeWidth={focused ? 2.5 : 2} />
          ) 
        }} 
      />


      <Tab.Screen 
        name="UserDetail" 
        component={UserDetailScreen} 
        options={{ 
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' }, 

          headerShown: true, 
          headerTitle: 'User Details',
          headerStyle: { backgroundColor: Colors.bg },
          headerTintColor: Colors.textPrimary,
          headerShadowVisible: false,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: fontScale(16),
          }
        }} 
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: verticalScale(75),
    backgroundColor: 'transparent', 

    borderTopWidth: 0,
    elevation: 0, 
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 }, 

        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
    }),
  },
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 26, 46, 0.65)', 

  },
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)', 

  },
});