// src/components/common/Dropdown.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, TextInput, ViewStyle, Platform } from 'react-native';
import tw from '../../utils/styles';
import { COLORS } from '../../constants/theme';

export interface DropdownOption {
  label: string;
  value: string | number;
  [key: string]: any;
}

interface DropdownProps {
  label?: string;
  value?: string | number;
  placeholder?: string;
  options: DropdownOption[];
  onSelect: (option: DropdownOption) => void;
  error?: string;
  containerStyle?: ViewStyle;
  searchable?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  value,
  placeholder = 'Select an option',
  options = [],
  onSelect,
  error,
  containerStyle,
  searchable = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = searchable
    ? options.filter((opt) => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : options;

  const handleSelect = (option: DropdownOption) => {
    onSelect(option);
    setModalVisible(false);
    setSearchQuery('');
  };

  return (
    <View style={[tw('w-full mb-4'), containerStyle]}>
      {label && (
        <Text style={tw('text-sm font-medium text-textHigh mb-2')}>
          {label}
        </Text>
      )}

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setModalVisible(true)}
        style={[
          tw('w-full bg-surface px-4 py-4 rounded-xl flex-row items-center justify-between border border-transparent'),
          error ? tw('border-error') : {},
        ]}
      >
        <Text
          style={[
            tw('text-base'),
            selectedOption ? tw('text-textHigh') : tw('text-textMuted'),
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        
        {/* Simple lightweight downward arrow indicator */}
        <Text style={tw('text-primary font-bold text-sm')}>▼</Text>
      </TouchableOpacity>

      {error && (
        <Text style={tw('text-xs text-error mt-1 ml-1')}>
          {error}
        </Text>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={tw('flex-1 justify-end bg-black opacity-90 position-absolute w-full h-full')} />
        
        <View style={tw('flex-1 justify-end')}>
          <View style={[
            tw('bg-surface rounded-t-3xl p-6 h-3/5 border-t border-primary'),
            { borderTopWidth: 1 }
          ]}>
            {/* Header */}
            <View style={tw('flex-row items-center justify-between mb-4')}>
              <Text style={tw('text-lg font-bold text-textHigh')}>
                {label || 'Select Option'}
              </Text>
              <TouchableOpacity onPress={() => { setModalVisible(false); setSearchQuery(''); }}>
                <Text style={tw('text-primary font-bold text-base px-2 py-1')}>Close</Text>
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            {searchable && (
              <TextInput
                style={tw('w-full bg-background px-4 py-3 rounded-xl text-textHigh border border-transparent mb-4 text-sm')}
                placeholder="Search..."
                placeholderTextColor={COLORS.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            )}

            {/* Options List */}
            {filteredOptions.length === 0 ? (
              <View style={tw('flex-1 items-center justify-center')}>
                <Text style={tw('text-textMuted text-base')}>No options available</Text>
              </View>
            ) : (
              <FlatList
                data={filteredOptions}
                keyExtractor={(item) => String(item.value)}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelect(item)}
                    style={tw('py-4 border-b border-zinc-800 flex-row items-center justify-between')}
                  >
                    <Text
                      style={[
                        tw('text-base text-textHigh'),
                        item.value === value ? tw('text-primary font-semibold') : {},
                      ]}
                    >
                      {item.label}
                    </Text>
                    {item.value === value && (
                      <Text style={tw('text-primary font-bold')}>✓</Text>
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Dropdown;
