// src/screens/services/ElectricityScreen.tsx
import React, { useState, useEffect } from 'react';
import { ScrollView, Alert } from 'react-native';
import { getElectricityProviders, executeServiceTransaction } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import tw from '../../utils/styles';
import Input from '../../components/common/Input';
import Dropdown, { DropdownOption } from '../../components/common/Dropdown';
import PinInput from '../../components/common/PinInput';
import Button from '../../components/common/Button';

export const ElectricityScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { refreshProfile } = useAuth();
  
  // Lists
  const [providers, setProviders] = useState<DropdownOption[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(true);

  // Selections
  const [selectedProvider, setSelectedProvider] = useState<string | undefined>(undefined);
  const [meterNo, setMeterNo] = useState('');
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  
  // Meta
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await getElectricityProviders();
        if (res.status && Array.isArray(res.data)) {
          setProviders(res.data.map((p: any) => ({
            label: p.name,
            value: p.abbreviation || p.id,
          })));
        }
      } catch (e) {
        console.error('Failed to load electricity providers', e);
      } finally {
        setLoadingProviders(false);
      }
    };
    fetchProviders();
  }, []);

  const handlePayment = async () => {
    if (!selectedProvider) {
      Alert.alert('Validation Error', 'Please select an electricity provider');
      return;
    }
    if (!meterNo) {
      Alert.alert('Validation Error', 'Meter number is required');
      return;
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < 500) {
      Alert.alert('Validation Error', 'Minimum token amount is ₦500');
      return;
    }
    if (pin.length !== 4) {
      Alert.alert('Validation Error', 'Transaction PIN must be exactly 4 digits');
      return;
    }

    setSubmitting(true);
    try {
      const res = await executeServiceTransaction('bills', {
        type: 'electricity',
        provider: selectedProvider,
        customer_id: meterNo,
        amount: amt,
        pin: pin,
      });

      if (res.status) {
        await refreshProfile();
        Alert.alert('Transaction Successful', res.message || 'Electricity bill paid successfully.', [
          { text: 'Done', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Transaction Failed', res.message || 'Failed to generate token.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'An error occurred during payment processing.');
    } finally {
      setSubmitting(false);
      setPin('');
    }
  };

  return (
    <ScrollView style={tw('flex-grow bg-background')} contentContainerStyle={tw('p-5 justify-center')}>
      <Dropdown
        label="Select Electricity Provider"
        value={selectedProvider}
        placeholder={loadingProviders ? 'Loading providers...' : 'Choose provider'}
        options={providers}
        onSelect={(opt) => setSelectedProvider(String(opt.value))}
      />

      <Input
        label="Meter Number"
        placeholder="Enter your meter number"
        keyboardType="numeric"
        value={meterNo}
        onChangeText={setMeterNo}
        editable={!submitting}
      />

      <Input
        label="Amount (₦)"
        placeholder="e.g. 2000"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        editable={!submitting}
      />

      <PinInput
        label="Enter 4-Digit PIN to Confirm"
        value={pin}
        onChangeText={setPin}
      />

      <Button
        title="Purchase Token"
        onPress={handlePayment}
        loading={submitting}
        disabled={submitting}
      />
    </ScrollView>
  );
};

export default ElectricityScreen;
