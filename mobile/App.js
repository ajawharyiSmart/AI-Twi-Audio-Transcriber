import 'react-native-gesture-handler';
import React, { Component } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import AppNavigator from './src/navigation/AppNavigator';

SplashScreen.preventAutoHideAsync().catch(() => {});

class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('HAKI render crash:', error, info?.componentStack);
  }

  render() {
    if (this.state.error) {
      const message = this.state.error?.message || String(this.state.error);
      return (
        <View style={styles.errorRoot}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <ScrollView style={styles.errorScroll}>
            <Text style={styles.errorBody}>{message}</Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  React.useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <StatusBar style="dark" backgroundColor="#faf8ff" />
          <AppNavigator />
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  errorRoot: {
    flex: 1,
    backgroundColor: '#faf8ff',
    padding: 24,
    justifyContent: 'center',
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#131b2e',
    marginBottom: 12,
  },
  errorScroll: {
    maxHeight: 240,
  },
  errorBody: {
    fontSize: 14,
    color: '#434655',
    lineHeight: 20,
  },
});
