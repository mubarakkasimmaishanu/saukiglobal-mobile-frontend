// src/components/common/PinInput.tsx
import React, { useRef } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import tw from '../../utils/styles';

interface PinInputProps {
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  label?: string;
}

export const PinInput: React.FC<PinInputProps> = ({
  value = '',
  onChangeText,
  error,
  label = 'Enter 4-Digit Transaction PIN',
}) => {
  const inputRef = useRef<TextInput>(null);

  const handlePress = () => {
    inputRef.current?.focus();
  };

  const handleTextChange = (text: string) => {
    // Only allow digits and limit to 4 characters
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 4);
    onChangeText(cleaned);
  };

  const codeArray = value.split('');
  const cells = [0, 1, 2, 3];

  return (
    <View style={tw('w-full items-center mb-6')}>
      {label && (
        <Text style={tw('text-sm font-medium text-textHigh mb-3 text-center')}>
          {label}
        </Text>
      )}

      {/* Hidden input field for keyboard entry */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleTextChange}
        keyboardType="number-pad"
        maxLength={4}
        secureTextEntry
        style={{
          position: 'absolute',
          width: 0,
          height: 0,
          opacity: 0,
        }}
      />

      <Pressable onPress={handlePress} style={tw('flex-row justify-center gap-4 w-full py-1')}>
        {cells.map((index) => {
          const char = codeArray[index];
          const isFocused = value.length === index;

          return (
            <View
              key={index}
              style={[
                tw('w-14 h-14 bg-surface items-center justify-center rounded-xl border border-transparent'),
                isFocused ? tw('border-primary') : {},
              ]}
            >
              {char ? (
                <Text style={tw('text-2xl text-primary font-bold')}>●</Text>
              ) : (
                <View style={tw('w-2 h-2 rounded-full bg-zinc-700')} />
              )}
            </View>
          );
        })}
      </Pressable>

      {error && (
        <Text style={tw('text-xs text-error mt-2 text-center')}>
          {error}
        </Text>
      )}
    </View>
  );
};

export default PinInput;
