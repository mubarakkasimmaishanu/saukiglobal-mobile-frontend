// src/screens/services/SmileDataScreen.tsx
import React, { useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import { executeServiceTransaction } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import tw from '../../utils/styles';
import Input from '../../components/common/Input';
import Dropdown, { DropdownOption } from '../../components/common/Dropdown';
import PinInput from '../../components/common/PinInput';
import Button from '../../components/common/Button';

export const SmileDataScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { refreshProfile } = useAuth();
  
  // States
  const [smileNumber, setSmileNumber] = useState('');
  const [selectedBundle, setSelectedBundle] = useState<string | number | undefined>(undefined);
  const [pin, setPin] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const bundles = [
    { label: 'SmileData 1.5GB - 30 Days (₦1,000)', value: 'data_1_5gb', price: 1000 },
    { label: 'SmileData 5GB - 30 Days (₦3,000)', value: 'data_5gb', price: 3000 },
    { label: 'SmileData 10GB - 30 Days (₦5,000)', value: 'data_10gb', price: 5000 },
    { label: 'SmileData 20GB - 30 Days (₦9,000)', value: 'data_20gb', price: 9000 },
  ];

  const handlePurchase = async () => {
    if (!smileNumber) {
      Alert.alert('Validation Error', 'Smile account/phone number is required');
      return;
    }
    if (!selectedBundle) {
      Alert.alert('Validation Error', 'Please select a Smile data plan');
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
        bundle: selectedBundle,
        category: 'bundle',
        pin: pin,
      });

      if (res.status) {
        await refreshProfile();
        Alert.alert('Transaction Successful', res.message || 'Smile data plan activated successfully.', [
          { text: 'Done', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Transaction Failed', res.message || 'Failed to activate Smile data bundle.');
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
        label="Select Smile Data Bundle"
        value={selectedBundle}
        placeholder="Choose plan"
        options={bundles}
        onSelect={(opt) => setSelectedBundle(opt.value)}
      />

      <PinInput
        label="Enter 4-Digit PIN to Confirm"
        value={pin}
        onChangeText={setPin}
      />

      <Button
        title="Purchase Smile Data"
        onPress={handlePurchase}
        loading={submitting}
        disabled={submitting}
      />
    </ScrollView>
  );
};

export default SmileDataScreen;
