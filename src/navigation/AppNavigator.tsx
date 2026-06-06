// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/theme';
import tw from '../utils/styles';
import { Text, View } from 'react-native';

// Import Screens (Placeholder screen imports will be resolved as we create them)
import SplashScreen from '../screens/auth/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import VerifyOtpScreen from '../screens/auth/VerifyOtpScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';

import HomeScreen from '../screens/home/HomeScreen';
import ServicesScreen from '../screens/services/ServicesScreen';
import WalletScreen from '../screens/wallet/WalletScreen';
import FundOnlineScreen from '../screens/wallet/FundOnlineScreen';
import TransactionsScreen from '../screens/transactions/TransactionsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

import AirtimeScreen from '../screens/services/AirtimeScreen';
import DataScreen from '../screens/services/DataScreen';
import ElectricityScreen from '../screens/services/ElectricityScreen';
import CableScreen from '../screens/services/CableScreen';
import ExamScreen from '../screens/services/ExamScreen';
import KiraniScreen from '../screens/services/KiraniScreen';
import RatelScreen from '../screens/services/RatelScreen';
import SmileVoiceScreen from '../screens/services/SmileVoiceScreen';
import SmileDataScreen from '../screens/services/SmileDataScreen';
import AlphaCallScreen from '../screens/services/AlphaCallScreen';
import EsimScreen from '../screens/services/EsimScreen';
import IntlScreen from '../screens/services/IntlScreen';

import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';
import PinManagementScreen from '../screens/profile/PinManagementScreen';
import SupportScreen from '../screens/profile/SupportScreen';

// Type definitions for stacks
export type RootStackParamList = {
  Splash: undefined;
  AuthStack: undefined;
  MainTabs: undefined;
  
  // VTU Details Stacks
  BuyAirtime: undefined;
  BuyData: undefined;
  PayElectricity: undefined;
  PayCable: undefined;
  ExamScratch: undefined;
  KiraniAirtime: undefined;
  RatelAirtime: undefined;
  SmileVoice: undefined;
  SmileData: undefined;
  AlphaCall: undefined;
  BuyEsim: undefined;
  IntlTopup: undefined;
  
  // Funding Stack
  FundOnline: { checkoutUrl: string; reference: string; gateway: string };

  // Settings Sub-stacks
  ChangePassword: undefined;
  PinManagement: undefined;
  Support: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  VerifyOtp: { email: string };
  ResetPassword: { email: string; code: string };
};

export type MainTabParamList = {
  HomeTab: undefined;
  ServicesTab: undefined;
  WalletTab: undefined;
  TransactionsTab: undefined;
  ProfileTab: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

import { Ionicons } from '@expo/vector-icons';

// TabBar Icon Custom Component using vector icons for premium appearance
interface TabIconProps {
  label: string;
  focused: boolean;
}
const TabIcon: React.FC<TabIconProps> = ({ label, focused }) => {
  const icons: Record<string, string> = {
    HomeTab: focused ? 'home' : 'home-outline',
    ServicesTab: focused ? 'apps' : 'apps-outline',
    WalletTab: focused ? 'wallet' : 'wallet-outline',
    TransactionsTab: focused ? 'receipt' : 'receipt-outline',
    ProfileTab: focused ? 'person' : 'person-outline',
  };
  return (
    <View style={tw('items-center justify-center pt-1')}>
      <Ionicons
        name={(icons[label] || 'ellipse-outline') as any}
        size={22}
        color={focused ? COLORS.primary : COLORS.textMuted}
      />
    </View>
  );
};

// Auth Navigation Stack
const AuthStackNavigator = () => (
  <AuthStack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: COLORS.surface },
      headerTintColor: COLORS.textHigh,
      headerTitleStyle: { fontWeight: 'bold', fontSize: 16, color: COLORS.textHigh },
      contentStyle: { backgroundColor: COLORS.background },
      animation: 'slide_from_right',
    }}
  >
    <AuthStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
    <AuthStack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create Account' }} />
    <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Reset Password' }} />
    <AuthStack.Screen name="VerifyOtp" component={VerifyOtpScreen} options={{ title: 'Verify OTP' }} />
    <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: 'Set New Password' }} />
  </AuthStack.Navigator>
);

// Bottom Navigation Tabs
const BottomTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.textMuted,
      tabBarStyle: {
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: '#10b98120',
        paddingBottom: 8,
        height: 60,
      },
      headerStyle: {
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: '#10b98120',
      },
      headerTintColor: COLORS.textHigh,
      headerTitleStyle: { fontWeight: 'bold', fontSize: 18, color: COLORS.textHigh },
    })}
  >
    <Tab.Screen name="HomeTab" component={HomeScreen} options={{ headerShown: false }} />
    <Tab.Screen name="ServicesTab" component={ServicesScreen} options={{ title: 'Our Services' }} />
    <Tab.Screen name="WalletTab" component={WalletScreen} options={{ title: 'My Wallet' }} />
    <Tab.Screen name="TransactionsTab" component={TransactionsScreen} options={{ title: 'Transactions' }} />
    <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Settings' }} />
  </Tab.Navigator>
);

// Main Root Application Navigator
export const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.surface },
          headerTintColor: COLORS.textHigh,
          headerTitleStyle: { fontWeight: 'bold', fontSize: 16, color: COLORS.textHigh },
          contentStyle: { backgroundColor: COLORS.background },
          animation: 'slide_from_right',
        }}
      >
        {isLoading ? (
          <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        ) : !isAuthenticated ? (
          <Stack.Screen name="AuthStack" component={AuthStackNavigator} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={BottomTabNavigator} options={{ headerShown: false }} />
            
            {/* VTU Screen Registrations */}
            <Stack.Screen name="BuyAirtime" component={AirtimeScreen} options={{ title: 'Recharge Airtime' }} />
            <Stack.Screen name="BuyData" component={DataScreen} options={{ title: 'Subscribe Internet Data' }} />
            <Stack.Screen name="PayElectricity" component={ElectricityScreen} options={{ title: 'Electricity Bills' }} />
            <Stack.Screen name="PayCable" component={CableScreen} options={{ title: 'Cable Subscription' }} />
            <Stack.Screen name="ExamScratch" component={ExamScreen} options={{ title: 'Exam Pin Cards' }} />
            <Stack.Screen name="KiraniAirtime" component={KiraniScreen} options={{ title: 'Kirani Topup' }} />
            <Stack.Screen name="RatelAirtime" component={RatelScreen} options={{ title: 'Ratel Airtime' }} />
            <Stack.Screen name="SmileVoice" component={SmileVoiceScreen} options={{ title: 'Smile Voice Bundle' }} />
            <Stack.Screen name="SmileData" component={SmileDataScreen} options={{ title: 'Smile Data Bundle' }} />
            <Stack.Screen name="AlphaCall" component={AlphaCallScreen} options={{ title: 'Alpha Call' }} />
            <Stack.Screen name="BuyEsim" component={EsimScreen} options={{ title: 'eSIM Profile' }} />
            <Stack.Screen name="IntlTopup" component={IntlScreen} options={{ title: 'International Topup' }} />
            
            {/* Funding Webview Panel */}
            <Stack.Screen name="FundOnline" component={FundOnlineScreen} options={{ title: 'Secure Checkout' }} />

            {/* Profile Panels */}
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Change Password' }} />
            <Stack.Screen name="PinManagement" component={PinManagementScreen} options={{ title: 'PIN Management' }} />
            <Stack.Screen name="Support" component={SupportScreen} options={{ title: 'Contact Support' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
