import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { useAuth } from '../context/AuthContext';
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

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Feed: '🔥',
    Map: '📍',
    Calculator: '🧮',
    ChatList: '💬',
    Profile: '👤',
  };
  return <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{icons[name] || '•'}</Text>;
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0D0D0D',
          borderTopColor: '#2A2A2A',
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#FF4500',
        tabBarInactiveTintColor: '#666',
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
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
