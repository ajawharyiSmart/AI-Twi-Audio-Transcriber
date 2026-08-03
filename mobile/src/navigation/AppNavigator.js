import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../config';

import HomeScreen from '../screens/HomeScreen';
import ResultsScreen from '../screens/ResultsScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import RecordingScreen from '../screens/RecordingScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const HistoryStack = createNativeStackNavigator();
const SettingsStack = createNativeStackNavigator();

/**
 * Home stack navigator containing Home and Results screens.
 * Home → Results (when transcription completes)
 */
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="Recording" component={RecordingScreen} />
      <HomeStack.Screen
        name="Results"
        component={ResultsScreen}
        options={{
          headerShown: true,
          headerTitle: 'Transcription Result',
          headerBackTitle: 'Back',
          headerTintColor: COLORS.primary,
          headerStyle: {
            backgroundColor: COLORS.white,
          },
          headerShadowVisible: false,
        }}
      />
    </HomeStack.Navigator>
  );
}

/**
 * History stack navigator - wraps History screen so it can
 * navigate to the Results screen within the Home tab.
 */
function HistoryStackNavigator() {
  return (
    <HistoryStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <HistoryStack.Screen name="HistoryList" component={HistoryScreen} />
      <HistoryStack.Screen
        name="ResultsTab"
        component={ResultsScreen}
        options={{
          headerShown: true,
          headerTitle: 'Transcription Result',
          headerBackTitle: 'History',
          headerTintColor: COLORS.primary,
          headerStyle: {
            backgroundColor: COLORS.white,
          },
          headerShadowVisible: false,
        }}
      />
    </HistoryStack.Navigator>
  );
}

/**
 * Settings stack navigator.
 */
function SettingsStackNavigator() {
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <SettingsStack.Screen name="SettingsList" component={SettingsScreen} />
    </SettingsStack.Navigator>
  );
}

/**
 * Main bottom tab navigator with 3 tabs:
 * 1. Transcribe - Main recording & upload screen
 * 2. History - Past transcriptions
 * 3. Settings - App configuration
 */
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textTertiary,
          tabBarStyle: {
            backgroundColor: COLORS.white,
            borderTopColor: COLORS.borderLight,
            borderTopWidth: 1,
            paddingBottom: 4,
            paddingTop: 4,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'TranscribeTab') {
              iconName = focused ? 'mic-circle' : 'mic-circle-outline';
            } else if (route.name === 'HistoryTab') {
              iconName = focused ? 'time' : 'time-outline';
            } else if (route.name === 'SettingsTab') {
              iconName = focused ? 'settings' : 'settings-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen
          name="TranscribeTab"
          component={HomeStackNavigator}
          options={{
            tabBarLabel: 'Transcribe',
          }}
        />
        <Tab.Screen
          name="HistoryTab"
          component={HistoryStackNavigator}
          options={{
            tabBarLabel: 'History',
          }}
        />
        <Tab.Screen
          name="SettingsTab"
          component={SettingsStackNavigator}
          options={{
            tabBarLabel: 'Settings',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}