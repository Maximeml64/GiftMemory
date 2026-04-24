// App.tsx

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { GiftsProvider } from './src/store/GiftsContext';
import { RootStackParamList, TabParamList } from './src/types';
import { Colors, Typography } from './src/utils/theme';

import HomeScreen from './src/screens/HomeScreen';
import GiversScreen from './src/screens/GiversScreen';
import AddGiftScreen from './src/screens/AddGiftScreen';
import GiftDetailScreen from './src/screens/GiftDetailScreen';
import GiverDetailScreen from './src/screens/GiverDetailScreen';

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
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          ...Typography.captionMedium,
          marginTop: 2,
        },
        tabBarIcon: ({ focused }) => {
          const icons: Record<string, string> = {
            Home: '🎁',
            Givers: '👥',
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
      <Tab.Screen name="Givers" component={GiversScreen} options={{ tabBarLabel: 'Donneurs' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <GiftsProvider>
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
            <Stack.Screen
              name="Main"
              component={TabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AddGift"
              component={AddGiftScreen}
              options={({ route }) => ({
                title: route.params?.giftId ? 'Modifier le cadeau' : 'Nouveau cadeau',
                presentation: 'modal',
                headerLeft: () => null,
              })}
            />
            <Stack.Screen
              name="GiftDetail"
              component={GiftDetailScreen}
              options={{ title: '' }}
            />
            <Stack.Screen
              name="GiverDetail"
              component={GiverDetailScreen}
              options={({ route }) => ({ title: route.params.giverName })}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </GiftsProvider>
    </SafeAreaProvider>
  );
}
