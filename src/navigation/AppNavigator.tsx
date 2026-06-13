import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
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

const AuthStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const FeedStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const ChatStack = createNativeStackNavigator();

function FeedStackNavigator() {
  return (
    <FeedStack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#0D0D0D' }, headerTintColor: '#FFFFFF' }}>
      <FeedStack.Screen name="Feed" component={FeedScreen} options={{ title: 'Burnout Feed' }} />
    </FeedStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#0D0D0D' }, headerTintColor: '#FFFFFF' }}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
      <ProfileStack.Screen name="GarageScreen" component={GarageScreen} options={{ title: 'Garage' }} />
    </ProfileStack.Navigator>
  );
}

function ChatStackNavigator() {
  return (
    <ChatStack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#0D0D0D' }, headerTintColor: '#FFFFFF' }}>
      <ChatStack.Screen name="ChatList" component={ChatListScreen} options={{ title: 'Messages' }} />
      <ChatStack.Screen name="ChatScreen" component={ChatScreen} options={{ title: 'Chat' }} />
    </ChatStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: { backgroundColor: '#0D0D0D', borderTopColor: '#333333' },
        tabBarActiveTintColor: '#FF4500',
        tabBarInactiveTintColor: '#888888',
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'FeedTab') iconName = focused ? 'flame' : 'flame-outline';
          else if (route.name === 'MapTab') iconName = focused ? 'map' : 'map-outline';
          else if (route.name === 'ChatTab') iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          else if (route.name === 'CalculatorTab') iconName = focused ? 'calculator' : 'calculator-outline';
          else if (route.name === 'ProfileTab') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="FeedTab" component={FeedStackNavigator} options={{ title: 'Feed' }} />
      <Tab.Screen name="MapTab" component={MapScreen} options={{ title: 'Map', headerShown: false }} />
      <Tab.Screen name="ChatTab" component={ChatStackNavigator} options={{ title: 'Chat' }} />
      <Tab.Screen name="CalculatorTab" component={CalculatorScreen} options={{ title: 'Calc', headerStyle: { backgroundColor: '#0D0D0D' }, headerTintColor: '#FFFFFF', headerShown: true, headerTitle: 'Car Loan Calculator' }} />
      <Tab.Screen name="ProfileTab" component={ProfileStackNavigator} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D0D0D' }}>
        <ActivityIndicator color="#FF4500" size="large" />
      </View>
    );
  }

  if (!currentUser) {
    return (
      <AuthStack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#0D0D0D' }, headerTintColor: '#FFFFFF' }}>
        <AuthStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <AuthStack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
      </AuthStack.Navigator>
    );
  }

  return <MainTabs />;
}
