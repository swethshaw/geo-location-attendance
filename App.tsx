import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { scale, verticalScale, moderateScale, fontScale } from './src/utils/responsive';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { RegisterScreen } from './src/screens/auth/RegisterScreen';
import { AdminTabs } from './src/screens/admin/AdminTabs';
import { SupervisorTabs } from './src/screens/supervisor/SupervisorTabs';
import { ClientTabs } from './src/screens/client/ClientTabs';
import { Colors } from './src/theme';

const Stack = createNativeStackNavigator() as any;
const ViewComp = View as any;
const TextComp = Text as any;
const NavContainerComp = NavigationContainer as any;
const SafeAreaProviderComp = SafeAreaProvider as any;
const SafeAreaViewComp = SafeAreaView as any;
const LinearGradientComp = LinearGradient as any;

function AppNavigator() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <ViewComp style={styles.splash}>
        <ViewComp style={styles.logoContainer}>
          <LinearGradientComp 
            colors={Colors.gradientPrimary}
            style={styles.logoPlaceholder}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <TextComp style={styles.brandText}>
            GEO ATTENDANCE
          </TextComp>
        </ViewComp>
        
        <ViewComp style={styles.loaderTrack}>
          <ViewComp style={styles.loaderBar} />
        </ViewComp>
      </ViewComp>
    );
  }

  return (
    <ViewComp style={{ flex: 1 }}>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          animation: 'fade_from_bottom', // Smoother transition than default
        }}
      >
        {!isAuthenticated ? (
          <Stack.Group screenOptions={{ animation: 'slide_from_right' }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </Stack.Group>
        ) : (
          <Stack.Screen 
            name="Main" 
            component={
              user?.role === 'admin' ? AdminTabs :
              user?.role === 'supervisor' ? SupervisorTabs : 
              ClientTabs
            } 
          />
        )}
      </Stack.Navigator>
    </ViewComp>
  );
}

export default function App() {
  return (
    <SafeAreaProviderComp>
      <SafeAreaViewComp style={{ flex: 1, backgroundColor: Colors.bg || '#121212' }}>
        <AuthProvider>
          <NavContainerComp>
            <StatusBar style="light" />
            <AppNavigator />
          </NavContainerComp>
        </AuthProvider>
      </SafeAreaViewComp>
    </SafeAreaProviderComp>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: Colors.bg || '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: verticalScale(40),
  },
  logoPlaceholder: {
    width: scale(80),
    height: scale(80),
    borderRadius: moderateScale(24),
    marginBottom: verticalScale(20),
    // Glow effect
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: verticalScale(10) },
    shadowOpacity: 0.4,
    shadowRadius: moderateScale(20),
    elevation: 15,
  },
  brandText: {
    color: '#FFFFFF',
    fontSize: fontScale(28),
    fontWeight: '800',
    letterSpacing: scale(4),
  },
  loaderTrack: {
    position: 'absolute',
    bottom: verticalScale(80),
    width: scale(150),
    height: verticalScale(4),
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: moderateScale(2),
    overflow: 'hidden',
  },
  loaderBar: {
    width: '30%', // Simulated loading progress
    height: '100%',
    backgroundColor: Colors.accent, // Using accent color for contrast against primary background elements
  }
});