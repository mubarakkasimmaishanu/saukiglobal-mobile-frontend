// src/components/common/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import tw from '../../utils/styles';
import { COLORS } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const isButtonDisabled = disabled || loading;

  // Compute styles using tw utility
  let buttonStyle = tw('w-full py-4 items-center justify-center rounded-xl flex-row');
  let labelStyle = tw('text-base font-semibold');

  if (variant === 'primary') {
    buttonStyle = { ...buttonStyle, ...tw('bg-primary') };
    labelStyle = { ...labelStyle, ...tw('text-black') };
  } else if (variant === 'secondary') {
    buttonStyle = { ...buttonStyle, ...tw('bg-primaryDark') };
    labelStyle = { ...labelStyle, ...tw('text-white') };
  } else if (variant === 'outline') {
    buttonStyle = { ...buttonStyle, ...tw('bg-transparent border border-primary') };
    labelStyle = { ...labelStyle, ...tw('text-primary') };
  } else if (variant === 'danger') {
    buttonStyle = { ...buttonStyle, ...tw('bg-error') };
    labelStyle = { ...labelStyle, ...tw('text-white') };
  }

  if (isButtonDisabled) {
    buttonStyle = { ...buttonStyle, opacity: 0.5 };
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={isButtonDisabled}
      style={[buttonStyle, style]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#000000' : COLORS.primary} />
      ) : (
        <Text style={[labelStyle, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;
