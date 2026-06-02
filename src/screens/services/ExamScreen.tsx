// src/screens/services/ExamScreen.tsx
import React, { useState, useEffect } from 'react';
import { ScrollView, Alert, View, Text } from 'react-native';
import { getExamProviders, executeServiceTransaction } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import tw from '../../utils/styles';
import Dropdown, { DropdownOption } from '../../components/common/Dropdown';
import PinInput from '../../components/common/PinInput';
import Button from '../../components/common/Button';

export const ExamScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { refreshProfile } = useAuth();
  
  // Lists
  const [providers, setProviders] = useState<DropdownOption[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(true);

  // Selections
  const [selectedProvider, setSelectedProvider] = useState<string | number | undefined>(undefined);
  const [quantity, setQuantity] = useState<number>(1);
  const [pin, setPin] = useState('');
  
  // Meta
  const [submitting, setSubmitting] = useState(false);
  const [selectedProviderDetails, setSelectedProviderDetails] = useState<any>(null);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await getExamProviders();
        if (res.status && Array.isArray(res.data)) {
          setProviders(res.data.map((p: any) => ({
            label: `${p.name.toUpperCase()} - ₦${p.price}`,
            value: p.id,
            price: p.price,
            rawData: p,
          })));
        }
      } catch (e) {
        console.error('Failed to load exam providers', e);
      } finally {
        setLoadingProviders(false);
      }
    };
    fetchProviders();
  }, []);

  const quantities = [
    { label: '1 Pin Card', value: 1 },
    { label: '2 Pin Cards', value: 2 },
    { label: '3 Pin Cards', value: 3 },
    { label: '4 Pin Cards', value: 4 },
    { label: '5 Pin Cards', value: 5 },
  ];

  const handlePurchase = async () => {
    if (!selectedProvider) {
      Alert.alert('Validation Error', 'Please select an exam provider');
      return;
    }
    if (pin.length !== 4) {
      Alert.alert('Validation Error', 'Transaction PIN must be exactly 4 digits');
      return;
    }

    setSubmitting(true);
    try {
      const res = await executeServiceTransaction('exam', {
        provider: selectedProvider,
        quantity: quantity,
        pin: pin,
      });

      if (res.status) {
        await refreshProfile();
        
        let successMsg = res.message || 'Exam PIN cards purchased successfully.';
        // If pins/serials are returned inside response, display them!
        if (res.data && Array.isArray(res.data.cards)) {
          const cards = res.data.cards.map((c: any, i: number) => `Card ${i+1}:\nPIN: ${c.pin}\nSerial: ${c.serial_no || 'N/A'}`).join('\n\n');
          successMsg = `${successMsg}\n\n${cards}`;
        }
        
        Alert.alert('Transaction Successful', successMsg, [
          { text: 'Done', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Transaction Failed', res.message || 'Failed to purchase exam pins.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'An error occurred during payment processing.');
    } finally {
      setSubmitting(false);
      setPin('');
    }
  };

  const totalPrice = selectedProviderDetails ? selectedProviderDetails.price * quantity : 0;

  return (
    <ScrollView style={tw('flex-grow bg-background')} contentContainerStyle={tw('p-5 justify-center')}>
      <Dropdown
        label="Select Exam Provider"
        value={selectedProvider}
        placeholder={loadingProviders ? 'Loading providers...' : 'Choose provider'}
        options={providers}
        onSelect={(opt) => {
          setSelectedProvider(opt.value);
          setSelectedProviderDetails(opt);
        }}
      />

      <Dropdown
        label="Select Quantity"
        value={quantity}
        placeholder="Choose quantity"
        options={quantities}
        onSelect={(opt) => setQuantity(Number(opt.value))}
      />

      {selectedProviderDetails && (
        <View style={tw('bg-surface p-4 rounded-xl border border-zinc-800/15 mb-6')}>
          <Text style={tw('text-xs text-textMuted mb-0.5')}>Total Debit Amount</Text>
          <Text style={tw('text-lg font-bold text-primary')}>
            ₦{totalPrice.toLocaleString()}
          </Text>
        </View>
      )}

      <PinInput
        label="Enter 4-Digit PIN to Confirm"
        value={pin}
        onChangeText={setPin}
      />

      <Button
        title="Purchase Pins"
        onPress={handlePurchase}
        loading={submitting}
        disabled={submitting}
      />
    </ScrollView>
  );
};

export default ExamScreen;
