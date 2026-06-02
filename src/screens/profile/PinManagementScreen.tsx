// src/screens/profile/PinManagementScreen.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { setTransactionPin, changeTransactionPin, toggleTransactionPin, forgotTransactionPin } from '../../api/services';
import tw from '../../utils/styles';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import PinInput from '../../components/common/PinInput';

export const PinManagementScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'change' | 'set' | 'toggle' | 'recover'>('change');
  const [loading, setLoading] = useState(false);

  // Form States
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');

  const handleSetPin = async () => {
    if (!password || newPin.length !== 4) {
      Alert.alert('Validation Error', 'Password and exactly 4-digit PIN are required.');
      return;
    }

    setLoading(true);
    try {
      const res = await setTransactionPin({ password, newPin });
      if (res.status) {
        Alert.alert('Success', 'Transaction PIN set successfully.');
        setPassword('');
        setNewPin('');
      } else {
        Alert.alert('Failed', res.message || 'Could not set PIN');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'An error occurred while setting transaction PIN');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePin = async () => {
    if (currentPin.length !== 4 || newPin.length !== 4) {
      Alert.alert('Validation Error', 'Both current and new PIN must be exactly 4 digits.');
      return;
    }

    setLoading(true);
    try {
      const res = await changeTransactionPin({ currentPin, newPin });
      if (res.status) {
        Alert.alert('Success', 'Transaction PIN changed successfully.');
        setCurrentPin('');
        setNewPin('');
      } else {
        Alert.alert('Failed', res.message || 'Could not change PIN');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'An error occurred while changing transaction PIN');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePin = async () => {
    if (pin.length !== 4) {
      Alert.alert('Validation Error', 'Exactly 4-digit PIN is required to toggle.');
      return;
    }

    setLoading(true);
    try {
      const res = await toggleTransactionPin({ pin });
      if (res.status) {
        Alert.alert('Success', res.message || 'PIN requirement toggled successfully.');
        setPin('');
      } else {
        Alert.alert('Failed', res.message || 'Could not toggle PIN');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'An error occurred while toggling PIN requirement');
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverPin = async () => {
    setLoading(true);
    try {
      const res = await forgotTransactionPin();
      if (res.status) {
        Alert.alert('PIN Reset Request', res.message || 'A new PIN has been generated and sent to your registered email.');
      } else {
        Alert.alert('Failed', res.message || 'Could not reset PIN');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'An error occurred during PIN recovery');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'change', label: 'Change PIN' },
    { key: 'set', label: 'Set PIN' },
    { key: 'toggle', label: 'Toggle PIN' },
    { key: 'recover', label: 'Recover PIN' },
  ];

  return (
    <ScrollView style={tw('flex-1 bg-background')} contentContainerStyle={tw('p-5')}>
      {/* Horizontal Tabs selection */}
      <View style={tw('flex-row flex-wrap mb-6 gap-2')}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t.key}
            onPress={() => {
              setActiveTab(t.key as any);
              setPassword('');
              setPin('');
              setCurrentPin('');
              setNewPin('');
            }}
            style={[
              tw('px-4 py-2.5 rounded-xl border border-zinc-800 bg-surface'),
              activeTab === t.key ? tw('bg-primaryDark border-primary') : {},
            ]}
          >
            <Text
              style={[
                tw('text-xs font-semibold text-textMuted'),
                activeTab === t.key ? tw('text-primary') : {},
              ]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Forms based on selected Tab */}
      <Card style={tw('bg-surface border border-zinc-800/20')}>
        {activeTab === 'change' && (
          <View>
            <Text style={tw('text-sm text-textMuted mb-5')}>
              Change your existing 4-digit transaction PIN to a new one.
            </Text>
            
            <PinInput
              label="Enter Current 4-Digit PIN"
              value={currentPin}
              onChangeText={setCurrentPin}
            />
            
            <PinInput
              label="Enter New 4-Digit PIN"
              value={newPin}
              onChangeText={setNewPin}
            />

            <Button
              title="Change PIN"
              onPress={handleChangePin}
              loading={loading}
              style={tw('mt-4')}
            />
          </View>
        )}

        {activeTab === 'set' && (
          <View>
            <Text style={tw('text-sm text-textMuted mb-5')}>
              If this is your first time, set up a new transaction PIN using your password.
            </Text>

            <Input
              label="Account Login Password"
              placeholder="Enter your account password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <PinInput
              label="Set 4-Digit PIN"
              value={newPin}
              onChangeText={setNewPin}
            />

            <Button
              title="Set PIN"
              onPress={handleSetPin}
              loading={loading}
              style={tw('mt-4')}
            />
          </View>
        )}

        {activeTab === 'toggle' && (
          <View>
            <Text style={tw('text-sm text-textMuted mb-5')}>
              Enable or disable PIN authorization for VTU transactions. Disabling PIN is not recommended for security.
            </Text>

            <PinInput
              label="Enter Transaction PIN to Confirm"
              value={pin}
              onChangeText={setPin}
            />

            <Button
              title="Toggle PIN Authorization"
              onPress={handleTogglePin}
              loading={loading}
              style={tw('mt-4')}
            />
          </View>
        )}

        {activeTab === 'recover' && (
          <View style={tw('items-center py-4')}>
            <Text style={tw('text-sm text-textMuted text-center mb-6 px-2')}>
              Forgotten your PIN? Click below to reset. A random 4-digit PIN will be generated and emailed directly to your registered address.
            </Text>

            <Button
              title="Reset and Email PIN"
              onPress={handleRecoverPin}
              loading={loading}
            />
          </View>
        )}
      </Card>
    </ScrollView>
  );
};

export default PinManagementScreen;
