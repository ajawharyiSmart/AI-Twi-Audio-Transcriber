import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, SIZES, TYPOGRAPHY } from '../config';

import HomeScreen from '../screens/HomeScreen';
import RecordingScreen from '../screens/RecordingScreen';
import UploadScreen from '../screens/UploadScreen';
import ProcessingScreen from '../screens/ProcessingScreen';
import ResultsScreen from '../screens/ResultsScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';

// ─── Stack types ──────────────────────────────────────────────────────────────
const HomeStack = createNativeStackNavigator();
const HistoryStack = createNativeStackNavigator();
const UploadStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Home stack: Home → Results ───────────────────────────────────────────────
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="Recording" component={RecordingScreen} />
      <HomeStack.Screen name="Results" component={ResultsScreen} />
      <HomeStack.Screen name="Processing" component={ProcessingScreen} />
    </HomeStack.Navigator>
  );
}

// ─── History stack: History list → Results ────────────────────────────────────
function HistoryStackNavigator() {
  return (
    <HistoryStack.Navigator screenOptions={{ headerShown: false }}>
      <HistoryStack.Screen name="HistoryList" component={HistoryScreen} />
      <HistoryStack.Screen name="Results" component={ResultsScreen} />
    </HistoryStack.Navigator>
  );
}

// ─── Upload stack: Upload → Processing → Results ──────────────────────────────
function UploadStackNavigator() {
  return (
    <UploadStack.Navigator screenOptions={{ headerShown: false }}>
      <UploadStack.Screen name="UploadMain" component={UploadScreen} />
      <UploadStack.Screen name="Recording" component={RecordingScreen} />
      <UploadStack.Screen name="Processing" component={ProcessingScreen} />
      <UploadStack.Screen name="Results" component={ResultsScreen} />
    </UploadStack.Navigator>
  );
}

// ─── Profile stack: Profile → Settings ───────────────────────────────────────
function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    </ProfileStack.Navigator>
  );
}

// ─── Alerts placeholder ───────────────────────────────────────────────────────
function AlertsScreen() {
  return (
    <View style={alertStyles.container}>
      <Ionicons name="notifications-circle-outline" size={56} color={COLORS.outline} style={{ opacity: 0.4 }} />
      <Text style={alertStyles.title}>No Alerts</Text>
      <Text style={alertStyles.subtitle}>You're all caught up. Notifications about your transcriptions will appear here.</Text>
    </View>
  );
}
const alertStyles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background, paddingHorizontal: SIZES.xl, gap: SIZES.sm },
  title: { ...TYPOGRAPHY.headlineSm, color: COLORS.onSurface },
  subtitle: { ...TYPOGRAPHY.bodySm, color: COLORS.onSurfaceVariant, textAlign: 'center' },
});

// ─── Tab icon helper ──────────────────────────────────────────────────────────
type TabIconName = keyof typeof Ionicons.glyphMap;

function tabIcon(routeName: string, focused: boolean): TabIconName {
  switch (routeName) {
    case 'HomeStack':    return focused ? 'home'             : 'home-outline';
    case 'HistoryTab':   return focused ? 'time'             : 'time-outline';
    case 'UploadTab':    return focused ? 'add-circle'       : 'add-circle-outline';
    case 'AlertsTab':    return focused ? 'notifications'    : 'notifications-outline';
    case 'ProfileTab':   return focused ? 'person'           : 'person-outline';
    default:             return 'ellipse-outline';
  }
}

// ─── Main navigator ───────────────────────────────────────────────────────────
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.onSurfaceVariant,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={tabIcon(route.name, focused)} size={size} color={color} />
          ),
        })}
      >
        <Tab.Screen
          name="HomeStack"
          component={HomeStackNavigator}
          options={{ tabBarLabel: 'Home' }}
        />
        <Tab.Screen
          name="HistoryTab"
          component={HistoryStackNavigator}
          options={{ tabBarLabel: 'History' }}
        />
        <Tab.Screen
          name="UploadTab"
          component={UploadStackNavigator}
          options={{
            tabBarLabel: 'Upload',
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? 'add-circle' : 'add-circle-outline'}
                size={28}
                color={focused ? COLORS.primary : COLORS.onSurfaceVariant}
              />
            ),
          }}
        />
        <Tab.Screen
          name="AlertsTab"
          component={AlertsScreen}
          options={{ tabBarLabel: 'Alerts' }}
        />
        <Tab.Screen
          name="ProfileTab"
          component={ProfileStackNavigator}
          options={{ tabBarLabel: 'Profile' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.outlineVariant,
    borderTopWidth: 1,
    height: 68,
    paddingBottom: 8,
    paddingTop: 6,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
