// App.tsx

import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Sentry from '@sentry/react-native';

// Initialise Sentry as early as possible so any failure during render or
// during the provider boot sequence below is captured. Disabled in dev so
// it doesn't pollute the project quota with hot-reload errors. The DSN
// is read from the public env so it can be set per EAS profile without
// touching code.
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? '',
  enabled: !__DEV__,
  tracesSampleRate: 0.2,
});
import { CakeIcon, GiftIcon, HomeIcon, SettingsIcon, UsersIcon, XIcon } from './src/components/ui/icons';
import {
  useFonts,
  CormorantGaramond_400Regular,
  CormorantGaramond_400Regular_Italic,
  CormorantGaramond_500Medium,
  CormorantGaramond_600SemiBold,
  CormorantGaramond_700Bold,
} from '@expo-google-fonts/cormorant-garamond';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import { GiftsProvider } from './src/store/GiftsContext';
import { EventsProvider } from './src/store/EventsContext';
import { PurchaseProvider } from './src/store/PurchaseContext';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { RootStackParamList, TabParamList } from './src/types';
import { COLORS, TYPOGRAPHY } from './src/utils/theme';

import HomeScreen from './src/screens/HomeScreen';
import GiftsScreen from './src/screens/GiftsScreen';
import EventsScreen from './src/screens/EventsScreen';
import GiversScreen from './src/screens/GiversScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AddGiftScreen from './src/screens/AddGiftScreen';
import GiftDetailScreen from './src/screens/GiftDetailScreen';
import GiverDetailScreen from './src/screens/GiverDetailScreen';
import AddEventScreen from './src/screens/AddEventScreen';
import EventDetailScreen from './src/screens/EventDetailScreen';
import PaywallScreen from './src/screens/PaywallScreen';
import OnboardingScreen, { hasSeenOnboarding } from './src/screens/OnboardingScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TAB_ICONS: Record<string, React.ComponentType<{ color?: string; size?: number }>> = {
  Home: HomeIcon,
  Gifts: GiftIcon,
  Events: CakeIcon,
  Givers: UsersIcon,
  Settings: SettingsIcon,
};

// Renders the close (X) button shown in the header-left slot of modal
// screens. Wrapped in a fixed-size box so the icon is vertically centered
// against the header title (a bare 22px icon in the slot ends up looking
// top-aligned on iOS).
function ModalCloseButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel="Fermer"
      style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}
    >
      <XIcon color={COLORS.primary} size={22} />
    </TouchableOpacity>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textTertiary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 0.5,
          height: 84,
          paddingBottom: 22,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 11,
          marginTop: 4,
          letterSpacing: 0.2,
        },
        tabBarIcon: ({ focused, color }) => {
          const Icon = TAB_ICONS[route.name];
          if (!Icon) return null;
          return <Icon color={color} size={focused ? 22 : 20} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Accueil' }} />
      <Tab.Screen name="Gifts" component={GiftsScreen} options={{ tabBarLabel: 'Cadeaux' }} />
      <Tab.Screen name="Events" component={EventsScreen} options={{ tabBarLabel: 'Événements' }} />
      <Tab.Screen name="Givers" component={GiversScreen} options={{ tabBarLabel: 'Donneurs' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'Réglages' }} />
    </Tab.Navigator>
  );
}

export default Sentry.wrap(App);

function App() {
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  const [fontsLoaded] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_400Regular_Italic,
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    hasSeenOnboarding()
      .then(setOnboardingDone)
      .catch(() => setOnboardingDone(false));
  }, []);

  // Loading state while loading fonts or checking AsyncStorage
  if (!fontsLoaded || onboardingDone === null) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  // Show onboarding if first launch
  if (!onboardingDone) {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" backgroundColor={COLORS.background} />
        <OnboardingScreen onDone={() => setOnboardingDone(true)} />
      </SafeAreaProvider>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <GiftsProvider>
            <EventsProvider>
              <PurchaseProvider>
                <NavigationContainer>
              <StatusBar style="dark" backgroundColor={COLORS.background} />
              <Stack.Navigator
                screenOptions={{
                  headerStyle: { backgroundColor: COLORS.background },
                  headerTintColor: COLORS.primary,
                  headerTitleStyle: { ...TYPOGRAPHY.title },
                  headerShadowVisible: false,
                  contentStyle: { backgroundColor: COLORS.background },
                }}
              >
                <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false, title: 'Accueil' }} />
                <Stack.Screen
                  name="AddGift"
                  component={AddGiftScreen}
                  options={({ navigation, route }) => ({
                    title: route.params?.giftId
                      ? 'Modifier'
                      : route.params?.initialStatus === 'idea'
                        ? 'Nouvelle idée'
                        : 'Nouveau cadeau',
                    presentation: 'modal',
                    headerLeft: () => <ModalCloseButton onPress={() => navigation.goBack()} />,
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
                  options={({ navigation, route }) => ({
                    title: route.params?.eventId ? 'Modifier' : 'Nouvel événement',
                    presentation: 'modal',
                    headerLeft: () => <ModalCloseButton onPress={() => navigation.goBack()} />,
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

                </Stack.Navigator>
                </NavigationContainer>
              </PurchaseProvider>
            </EventsProvider>
          </GiftsProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
