// src/components/common/Card.tsx
import React from 'react';
import { View, TouchableOpacity, ViewStyle } from 'react-native';
import tw from '../../utils/styles';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, style, onPress }) => {
  const containerStyle = [
    tw('bg-surface p-5 rounded-2xl border border-primary'),
    { borderWidth: 1, borderColor: '#10b98115' }, // Very subtle premium border
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={containerStyle}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{children}</View>;
};

export default Card;
