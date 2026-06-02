// src/components/common/Input.tsx
import React from 'react';
import { View, Text, TextInput, TextInputProps, ViewStyle, TextStyle } from 'react-native';
import tw from '../../utils/styles';
import { COLORS } from '../../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  inputStyle,
  labelStyle,
  ...props
}) => {
  return (
    <View style={[tw('w-full mb-4'), containerStyle]}>
      {label && (
        <Text style={[tw('text-sm font-medium text-textHigh mb-2'), labelStyle]}>
          {label}
        </Text>
      )}
      
      <TextInput
        style={[
          tw('w-full bg-surface px-4 py-4 rounded-xl text-textHigh border border-transparent text-base'),
          error ? tw('border-error') : {},
          inputStyle
        ]}
        placeholderTextColor={COLORS.textMuted}
        {...props}
      />
      
      {error && (
        <Text style={tw('text-xs text-error mt-1 ml-1')}>
          {error}
        </Text>
      )}
    </View>
  );
};

export default Input;
