// src/screens/services/AirtimeScreen.tsx
import React, { useState, useEffect } from 'react';
import { ScrollView, Alert } from 'react-native';
import { getAirtimeNetworks, executeServiceTransaction } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import tw from '../../utils/styles';
import Input from '../../components/common/Input';
import Dropdown, { DropdownOption } from '../../components/common/Dropdown';
import PinInput from '../../components/common/PinInput';
import Button from '../../components/common/Button';

export const AirtimeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { refreshProfile } = useAuth();
  
  // States
  const [networks, setNetworks] = useState<DropdownOption[]>([]);
  const [loadingNetworks, setLoadingNetworks] = useState(true);
  const [selectedNetwork, setSelectedNetwork] = useState<string | number | undefined>(undefined);
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        const res = await getAirtimeNetworks();
        if (res.status && Array.isArray(res.data)) {
          const opts = res.data.map((net: any) => ({
            label: net.network,
            value: net.id,
          }));
          setNetworks(opts);
        }
      } catch (e) {
        console.error('Failed to load airtime networks', e);
      } finally {
        setLoadingNetworks(false);
      }
    };
    fetchNetworks();
  }, []);

  const handlePurchase = async () => {
    if (!selectedNetwork) {
      Alert.alert('Validation Error', 'Please select a mobile network');
      return;
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < 50 || amt > 50000) {
      Alert.alert('Validation Error', 'Amount must be between ₦50 and ₦50,000');
      return;
    }
    if (!/^\d{11}$/.test(phone)) {
      Alert.alert('Validation Error', 'Phone number must be exactly 11 digits');
      return;
    }
    if (pin.length !== 4) {
      Alert.alert('Validation Error', 'Transaction PIN must be exactly 4 digits');
      return;
    }

    setSubmitting(true);
    try {
      const res = await executeServiceTransaction('airtime', {
        network: selectedNetwork,
        amount: amt,
        phone: phone,
        networktype: 'VTU',
        pin: pin,
      });

      if (res.status) {
        await refreshProfile();
        Alert.alert('Transaction Successful', res.message || 'Airtime top-up processed successfully.', [
          { text: 'Done', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Transaction Failed', res.message || 'Failed to purchase airtime.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'An error occurred during transaction processing.');
    } finally {
      setSubmitting(false);
      setPin(''); // Reset PIN field
    }
  };

  return (
    <ScrollView style={tw('flex-grow bg-background')} contentContainerStyle={tw('p-5 justify-center')}>
      <Dropdown
        label="Select Network"
        value={selectedNetwork}
        placeholder={loadingNetworks ? 'Loading networks...' : 'Choose network'}
        options={networks}
        onSelect={(opt) => setSelectedNetwork(opt.value)}
      />

      <Input
        label="Phone Number"
        placeholder="e.g. 08012345678"
        keyboardType="phone-pad"
        maxLength={11}
        value={phone}
        onChangeText={setPhone}
        editable={!submitting}
      />

      <Input
        label="Amount (₦)"
        placeholder="e.g. 200"
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
        title="Purchase Airtime"
        onPress={handlePurchase}
        loading={submitting}
        disabled={submitting}
      />
    </ScrollView>
  );
};

export default AirtimeScreen;
