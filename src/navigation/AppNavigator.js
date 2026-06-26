import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { colors } from '../utils/colors';

import LoginScreen from '../screens/LoginScreen';
import AccountsScreen from '../screens/AccountsScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ClientsScreen from '../screens/ClientsScreen';
import ClientDetailScreen from '../screens/ClientDetailScreen';
import InboundsScreen from '../screens/InboundsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SettingsPanelScreen from '../screens/SettingsPanelScreen';
import SettingsSubScreen from '../screens/SettingsSubScreen';
import SettingsApiScreen from '../screens/SettingsApiScreen';
import SettingsOperationsScreen from '../screens/SettingsOperationsScreen';
import SettingsAboutScreen from '../screens/SettingsAboutScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: '700' },
  headerShadowVisible: false,
};

const TAB_ICONS = {
  Dashboard: { focused: 'home', unfocused: 'home-outline' },
  Clients: { focused: 'person', unfocused: 'person-outline' },
  Inbounds: { focused: 'book', unfocused: 'book-outline' },
  Settings: { focused: 'settings', unfocused: 'settings-outline' },
};

function ClientsStackScreen() {
  const { t } = useLanguage();
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="ClientsList" component={ClientsScreen} options={{ title: t('nav.clients') }} />
      <Stack.Screen name="ClientDetail" component={ClientDetailScreen} options={{ title: t('nav.clientDetail') }} />
    </Stack.Navigator>
  );
}

function SettingsStackScreen() {
  const { t } = useLanguage();
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="SettingsHome" component={SettingsScreen} options={{ title: t('nav.settings') }} />
      <Stack.Screen name="SettingsPanel" component={SettingsPanelScreen} options={{ title: t('nav.settingsPanel') }} />
      <Stack.Screen name="SettingsSub" component={SettingsSubScreen} options={{ title: t('nav.settingsSub') }} />
      <Stack.Screen name="SettingsApi" component={SettingsApiScreen} options={{ title: t('nav.settingsApi') }} />
      <Stack.Screen name="SettingsOperations" component={SettingsOperationsScreen} options={{ title: t('nav.settingsOperations') }} />
      <Stack.Screen name="SettingsAbout" component={SettingsAboutScreen} options={{ title: t('nav.settingsAbout') }} />
    </Stack.Navigator>
  );
}

function TabNavigator() {
  const { t } = useLanguage();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700', fontSize: 16 },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        tabBarIcon: ({ focused, size }) => {
          const icons = TAB_ICONS[route.name];
          if (!icons) return null;
          return (
            <Ionicons
              name={focused ? icons.focused : icons.unfocused}
              size={22}
              color={focused ? colors.primary : colors.textMuted}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: t('nav.dashboard') }} />
      <Tab.Screen name="Clients" component={ClientsStackScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Inbounds" component={InboundsScreen} options={{ title: t('nav.inbounds') }} />
      <Tab.Screen name="Settings" component={SettingsStackScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  const { t } = useLanguage();
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Accounts" component={AccountsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: t('login.loginBtn'), headerBackTitle: t('common.back') }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <TabNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
});
