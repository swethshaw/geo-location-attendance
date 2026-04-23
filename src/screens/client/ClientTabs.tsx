import React from 'react';
import { Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { AttendanceScreen } from './AttendanceScreen';
import { HistoryScreen } from './HistoryScreen';
import { ProfileScreen } from './ProfileScreen';
import { Colors, Font, Radius, Spacing } from '../../theme';
import { scale, verticalScale, moderateScale, fontScale } from '../../utils/responsive';

const Tab = createBottomTabNavigator() as any;
const BlurViewComp = BlurView as any;

function TabIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: moderateScale(22) }}>{emoji}</Text>;
}

export function ClientTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
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
          fontSize: fontScale(11), 
          ...Font.medium,
          marginBottom: verticalScale(4)
        },
      }}
    >
      <Tab.Screen name="Attendance" component={AttendanceScreen} options={{ tabBarLabel: 'Check In', tabBarIcon: () => <TabIcon emoji="📍" /> }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ tabBarLabel: 'History', tabBarIcon: () => <TabIcon emoji="📋" /> }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile', tabBarIcon: () => <TabIcon emoji="👤" /> }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: verticalScale(20),
    left: scale(20),
    right: scale(20),
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
