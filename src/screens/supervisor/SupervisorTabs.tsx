import React from 'react';
import { Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { SupervisorDashboardScreen } from './SupervisorDashboardScreen';
import { TeamScreen } from './TeamScreen';
import { SupervisorInviteScreen } from './SupervisorInviteScreen';
import { AttendanceScreen } from '../client/AttendanceScreen';
import { HistoryScreen as AttendanceHistoryScreen } from '../client/HistoryScreen';
import { ProfileScreen } from '../client/ProfileScreen';
import { UserDetailScreen } from '../common/UserDetailScreen';
import { Colors, Font, Radius, Spacing } from '../../theme';
import { scale, verticalScale, moderateScale, fontScale } from '../../utils/responsive';

const Tab = createBottomTabNavigator() as any;
const BlurViewComp = BlurView as any;

export function SupervisorTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }: any) => ({
        headerShown: true,
        headerStyle: { 
          backgroundColor: Colors.bg, 
          height: verticalScale(60),
        },
        headerTitleStyle: { 
          color: Colors.textPrimary,
          fontSize: fontScale(18),
          ...Font.bold,
        },
        headerShadowVisible: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <BlurViewComp
            tint="dark"
            intensity={80}
            style={StyleSheet.absoluteFill}
          />
        ),
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: { 
          fontSize: fontScale(10), 
          ...Font.medium,
          marginBottom: verticalScale(4)
        },
        tabBarIcon: ({ color, size }: any) => {
          let icon = '📋';
          if (route.name === 'Attendance') icon = '📍';
          if (route.name === 'Clients') icon = '👥';
          if (route.name === 'Invite') icon = '✉️';
          if (route.name === 'History') icon = '🕒';
          if (route.name === 'Profile') icon = '👤';
          return <Text style={{ fontSize: moderateScale(20) }}>{icon}</Text>;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={SupervisorDashboardScreen} />
      <Tab.Screen name="Attendance" component={AttendanceScreen} />
      <Tab.Screen name="Clients" component={TeamScreen} />
      <Tab.Screen name="Invite" component={SupervisorInviteScreen} />
      <Tab.Screen name="History" component={AttendanceHistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen 
        name="UserDetail" 
        component={UserDetailScreen} 
        options={{ 
          tabBarButton: () => null,
          headerShown: true, 
          headerTitle: 'User Details',
          headerStyle: { backgroundColor: Colors.bg },
          headerTintColor: Colors.textPrimary,
          headerShadowVisible: false,
        }} 
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: verticalScale(15),
    left: scale(15),
    right: scale(15),
    height: verticalScale(65),
    borderRadius: Radius.xl,
    backgroundColor: 'rgba(26, 26, 46, 0.7)',
    borderTopWidth: 0,
    paddingBottom: verticalScale(8),
    paddingTop: verticalScale(8),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
});
