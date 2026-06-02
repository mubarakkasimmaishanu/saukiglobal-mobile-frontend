// src/screens/services/SmileVoiceScreen.tsx
import React, { useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import { executeServiceTransaction } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import tw from '../../utils/styles';
import Input from '../../components/common/Input';
import Dropdown, { DropdownOption } from '../../components/common/Dropdown';
import PinInput from '../../components/common/PinInput';
import Button from '../../components/common/Button';

export const SmileVoiceScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { refreshProfile } = useAuth();
  
  // States
  const [smileNumber, setSmileNumber] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<string | number | undefined>(undefined);
  const [pin, setPin] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const packages = [
    { label: 'SmileVoice 500 Mins (₦1,000)', value: 'voice_500_mins', price: 1000 },
    { label: 'SmileVoice Unlimited Call 30 Days (₦3,500)', value: 'voice_unlimited_30d', price: 3500 },
    { label: 'SmileVoice 1000 Mins (₦2,000)', value: 'voice_1000_mins', price: 2000 },
  ];

  const handlePurchase = async () => {
    if (!smileNumber) {
      Alert.alert('Validation Error', 'Smile account/phone number is required');
      return;
    }
    if (!selectedPackage) {
      Alert.alert('Validation Error', 'Please select a Smile voice package');
      return;
    }
    if (pin.length !== 4) {
      Alert.alert('Validation Error', 'Transaction PIN must be exactly 4 digits');
      return;
    }

    setSubmitting(true);
    try {
      const res = await executeServiceTransaction('smile', {
        smile_number: smileNumber,
        package: selectedPackage,
        category: 'voice',
        pin: pin,
      });

      if (res.status) {
        await refreshProfile();
        Alert.alert('Transaction Successful', res.message || 'Smile voice package activated successfully.', [
          { text: 'Done', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Transaction Failed', res.message || 'Failed to activate Smile voice bundle.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'An error occurred during transaction processing.');
    } finally {
      setSubmitting(false);
      setPin('');
    }
  };

  return (
    <ScrollView style={tw('flex-grow bg-background')} contentContainerStyle={tw('p-5 justify-center')}>
      <Input
        label="Smile Number / Account"
        placeholder="Enter Smile account or number"
        keyboardType="numeric"
        value={smileNumber}
        onChangeText={setSmileNumber}
        editable={!submitting}
      />

      <Dropdown
        label="Select Voice Package"
        value={selectedPackage}
        placeholder="Choose package"
        options={packages}
        onSelect={(opt) => setSelectedPackage(opt.value)}
      />

      <PinInput
        label="Enter 4-Digit PIN to Confirm"
        value={pin}
        onChangeText={setPin}
      />

      <Button
        title="Purchase Voice Package"
        onPress={handlePurchase}
        loading={submitting}
        disabled={submitting}
      />
    </ScrollView>
  );
};

export default SmileVoiceScreen;
