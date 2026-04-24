import React from 'react';
import { StyleSheet, Platform, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { 
  MapPin, 
  History, 
  UserCircle 
} from 'lucide-react-native';

import { AttendanceScreen } from './AttendanceScreen';
import { HistoryScreen } from './HistoryScreen';
import { ProfileScreen } from '../common/ProfileScreen';
import { Colors, Font } from '../../theme';
import { verticalScale, fontScale } from '../../utils/responsive';

const Tab = createBottomTabNavigator();

export function ClientTabs() {
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
          fontSize: fontScale(10), 
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
        name="Attendance" 
        component={AttendanceScreen} 
        options={{ 
          tabBarLabel: 'Check In', 
          tabBarIcon: ({ focused, color }) => (
            <MapPin color={color} size={22} strokeWidth={focused ? 2.5 : 2} />
          ) 
        }} 
      />
      
      <Tab.Screen 
        name="History" 
        component={HistoryScreen} 
        options={{ 
          tabBarLabel: 'History', 
          tabBarIcon: ({ focused, color }) => (
            <History color={color} size={22} strokeWidth={focused ? 2.5 : 2} />
          ) 
        }} 
      />
      
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          tabBarLabel: 'Profile', 
          tabBarIcon: ({ focused, color }) => (
            <UserCircle color={color} size={22} strokeWidth={focused ? 2.5 : 2} />
          ) 
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