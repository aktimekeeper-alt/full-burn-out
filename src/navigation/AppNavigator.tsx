import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import FeedScreen from '../screens/FeedScreen';
import ProfileScreen from '../screens/ProfileScreen';
import GarageScreen from '../screens/GarageScreen';
import MapScreen from '../screens/MapScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatScreen from '../screens/ChatScreen';
import CalculatorScreen from '../screens/CalculatorScreen';

export type RootStackParamList = {
  AuthStack: undefined;
  MainTabs: undefined;
  GarageScreen: { vehicleId: string };
  ChatScreen: { chatId: string; chatName: string };
};

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

export type MainTabParamList = {
  Feed: undefined;
  Map: undefined;
  Calculator: undefined;
  ChatList: undefined;
  Profile: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
  );
}

type TabIconName = keyof typeof TAB_ICONS;
const TAB_ICONS = {
  Feed:       { active: 'flame',              inactive: 'flame-outline' },
  Map:        { active: 'map',                inactive: 'map-outline' },
  Calculator: { active: 'calculator',         inactive: 'calculator-outline' },
  ChatList:   { active: 'chatbubbles',        inactive: 'chatbubbles-outline' },
  Profile:    { active: 'person-circle',      inactive: 'person-circle-outline' },
} as const;

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0D0D0D', borderTopColor: '#2A2A2A', height: 62, paddingBottom: 8 },
        tabBarActiveTintColor: '#FF4500',
        tabBarInactiveTintColor: '#555',
        tabBarIcon: ({ focused, size }) => {
          const icons = TAB_ICONS[route.name as TabIconName];
          if (!icons) return null;
          return <Ionicons name={focused ? icons.active : icons.inactive} size={size} color={focused ? '#FF4500' : '#555'} />;
        },
      })}
    >
      <Tab.Screen name="Feed" component={FeedScreen} options={{ title: 'Feed' }} />
      <Tab.Screen name="Map" component={MapScreen} options={{ title: 'Map' }} />
      <Tab.Screen name="Calculator" component={CalculatorScreen} options={{ title: 'Calc' }} />
      <Tab.Screen name="ChatList" component={ChatListScreen} options={{ title: 'Chats' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Me' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0D0D0D', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#FF4500" size="large" />
      </View>
    );
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {!currentUser ? (
        <RootStack.Screen name="AuthStack" component={AuthNavigator} />
      ) : (
        <>
          <RootStack.Screen name="MainTabs" component={MainTabs} />
          <RootStack.Screen
            name="GarageScreen"
            component={GarageScreen}
            options={{ headerShown: true, headerStyle: { backgroundColor: '#0D0D0D' }, headerTintColor: '#FF4500', title: 'Garage' }}
          />
          <RootStack.Screen
            name="ChatScreen"
            component={ChatScreen}
            options={({ route }) => ({
              headerShown: true,
              headerStyle: { backgroundColor: '#0D0D0D' },
              headerTintColor: '#FF4500',
              title: (route.params as any).chatName,
            })}
          />
        </>
      )}
    </RootStack.Navigator>
  );
}
