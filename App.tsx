// App.tsx

import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { GiftsProvider } from './src/store/GiftsContext';
import { EventsProvider } from './src/store/EventsContext';
import { PurchaseProvider } from './src/store/PurchaseContext';
import { RootStackParamList, TabParamList } from './src/types';
import { Colors, Typography } from './src/utils/theme';

import HomeScreen from './src/screens/HomeScreen';
import EventsScreen from './src/screens/EventsScreen';
import GiversScreen from './src/screens/GiversScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AddGiftScreen from './src/screens/AddGiftScreen';
import GiftDetailScreen from './src/screens/GiftDetailScreen';
import GiverDetailScreen from './src/screens/GiverDetailScreen';
import AddEventScreen from './src/screens/AddEventScreen';
import EventDetailScreen from './src/screens/EventDetailScreen';
import PaywallScreen from './src/screens/PaywallScreen';
import CguScreen from './src/screens/CguScreen';
import PrivacyScreen from './src/screens/PrivacyScreen';
import OnboardingScreen, { hasSeenOnboarding } from './src/screens/OnboardingScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 20,
          paddingTop: 8,
        },
        tabBarLabelStyle: { ...Typography.captionMedium, marginTop: 2 },
        tabBarIcon: ({ focused }) => {
          const icons: Record<string, string> = {
            Home: '🎁',
            Events: '🎂',
            Givers: '👥',
            Settings: '⚙️',
          };
          return (
            <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>
              {icons[route.name] ?? '●'}
            </Text>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Cadeaux' }} />
      <Tab.Screen name="Events" component={EventsScreen} options={{ tabBarLabel: 'Événements' }} />
      <Tab.Screen name="Givers" component={GiversScreen} options={{ tabBarLabel: 'Donneurs' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'Réglages' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    hasSeenOnboarding().then(setOnboardingDone);
  }, []);

  // Loading state while checking AsyncStorage
  if (onboardingDone === null) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  // Show onboarding if first launch
  if (!onboardingDone) {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" backgroundColor={Colors.background} />
        <OnboardingScreen onDone={() => setOnboardingDone(true)} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <GiftsProvider>
        <EventsProvider>
          <PurchaseProvider>
            <NavigationContainer>
              <StatusBar style="dark" backgroundColor={Colors.background} />
              <Stack.Navigator
                screenOptions={{
                  headerStyle: { backgroundColor: Colors.background },
                  headerTintColor: Colors.primary,
                  headerTitleStyle: { ...Typography.titleMedium, color: Colors.text },
                  headerShadowVisible: false,
                  contentStyle: { backgroundColor: Colors.background },
                }}
              >
                <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false, title: 'Accueil' }} />
                <Stack.Screen
                  name="AddGift"
                  component={AddGiftScreen}
                  options={({ route }) => ({
                    title: route.params?.giftId ? 'Modifier' : 'Nouveau cadeau',
                    presentation: 'modal',
                    headerLeft: () => null,
                  })}
                />
                <Stack.Screen
                  name="GiftDetail"
                  component={GiftDetailScreen}
                  options={({ route }) => ({
                    title: '',
                    ...(route.params?.backTitle ? { headerBackTitle: route.params.backTitle } : {}),
                  })}
                />
                <Stack.Screen
                  name="GiverDetail"
                  component={GiverDetailScreen}
                  options={({ route }) => ({
                    title: route.params.giverName,
                    ...(route.params?.backTitle ? { headerBackTitle: route.params.backTitle } : {}),
                  })}
                />
                <Stack.Screen
                  name="AddEvent"
                  component={AddEventScreen}
                  options={({ route }) => ({
                    title: route.params?.eventId ? 'Modifier' : 'Nouvel événement',
                    presentation: 'modal',
                    headerLeft: () => null,
                  })}
                />
                <Stack.Screen
                  name="EventDetail"
                  component={EventDetailScreen}
                  options={({ route }) => ({
                    title: '',
                    ...(route.params?.backTitle ? { headerBackTitle: route.params.backTitle } : {}),
                  })}
                />
                <Stack.Screen
                  name="Paywall"
                  component={PaywallScreen}
                  options={{ presentation: 'modal', headerShown: false }}
                />
                <Stack.Screen name="Cgu" component={CguScreen} options={{ title: "Conditions d'utilisation" }} />
                <Stack.Screen name="Privacy" component={PrivacyScreen} options={{ title: 'Confidentialité' }} />
              </Stack.Navigator>
            </NavigationContainer>
          </PurchaseProvider>
        </EventsProvider>
      </GiftsProvider>
    </SafeAreaProvider>
  );
}