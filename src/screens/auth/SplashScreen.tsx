// src/screens/auth/SplashScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import tw from '../../utils/styles';
import { COLORS } from '../../constants/theme';

export const SplashScreen: React.FC = () => {
  return (
    <View style={tw('flex-1 bg-background items-center justify-center p-6')}>
      <View style={tw('items-center mb-10')}>
        {/* Brand Header */}
        <Text style={tw('text-4xl font-bold text-primary mb-2')}>
          SaukiGlobal
        </Text>
        
        {/* Slogan */}
        <Text style={tw('text-sm text-textMuted text-center font-medium tracking-wide')}>
          "Sauki in everything transaction"
        </Text>
      </View>

      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
};

export default SplashScreen;
