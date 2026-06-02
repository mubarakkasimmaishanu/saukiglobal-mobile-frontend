// src/screens/services/RatelScreen.tsx
import React, { useState } from 'react';
import { ScrollView, Alert } from 'react-native';
import { executeServiceTransaction } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import tw from '../../utils/styles';
import Input from '../../components/common/Input';
import PinInput from '../../components/common/PinInput';
import Button from '../../components/common/Button';

export const RatelScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { refreshProfile } = useAuth();
  
  // States
  const [number, setNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handlePurchase = async () => {
    if (!number) {
      Alert.alert('Validation Error', 'Ratel number is required');
      return;
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid amount');
      return;
    }
    if (pin.length !== 4) {
      Alert.alert('Validation Error', 'Transaction PIN must be exactly 4 digits');
      return;
    }

    setSubmitting(true);
    try {
      const res = await executeServiceTransaction('ratel', {
        number: number,
        amount: amt,
        pin: pin,
      });

      if (res.status) {
        await refreshProfile();
        Alert.alert('Transaction Successful', res.message || 'Ratel credit recharge processed successfully.', [
          { text: 'Done', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Transaction Failed', res.message || 'Failed to process Ratel airtime.');
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
        label="Ratel Number"
        placeholder="Enter Ratel number"
        keyboardType="numeric"
        value={number}
        onChangeText={setNumber}
        editable={!submitting}
      />

      <Input
        label="Amount (₦)"
        placeholder="e.g. 500"
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
        title="Purchase Ratel Credit"
        onPress={handlePurchase}
        loading={submitting}
        disabled={submitting}
      />
    </ScrollView>
  );
};

export default RatelScreen;
