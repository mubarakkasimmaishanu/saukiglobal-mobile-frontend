// src/screens/services/EsimScreen.tsx
import React, { useState } from 'react';
import { ScrollView, Alert, View, Text } from 'react-native';
import { executeServiceTransaction } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import tw from '../../utils/styles';
import Input from '../../components/common/Input';
import Dropdown, { DropdownOption } from '../../components/common/Dropdown';
import PinInput from '../../components/common/PinInput';
import Button from '../../components/common/Button';

export const EsimScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, refreshProfile } = useAuth();
  
  // States
  const [selectedCountry, setSelectedCountry] = useState<string | number | undefined>(undefined);
  const [selectedPlan, setSelectedPlan] = useState<string | number | undefined>(undefined);
  const [email, setEmail] = useState(user?.email || '');
  const [pin, setPin] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedPlanDetails, setSelectedPlanDetails] = useState<any>(null);

  const countries = [
    { label: 'Nigeria', value: 'NG' },
    { label: 'United States', value: 'US' },
    { label: 'United Kingdom', value: 'UK' },
    { label: 'Ghana', value: 'GH' },
    { label: 'United Arab Emirates (UAE)', value: 'AE' },
  ];

  const plans = [
    { label: 'eSIM Global 1GB - 7 Days (₦1,500)', value: 'esim_1gb_7d', price: 1500 },
    { label: 'eSIM Global 3GB - 15 Days (₦4,000)', value: 'esim_3gb_15d', price: 4000 },
    { label: 'eSIM Global 5GB - 30 Days (₦6,000)', value: 'esim_5gb_30d', price: 6000 },
    { label: 'eSIM Global Unlimited - 30 Days (₦20,000)', value: 'esim_unlimited_30d', price: 20000 },
  ];

  const handlePurchase = async () => {
    if (!selectedCountry) {
      Alert.alert('Validation Error', 'Please select a destination country');
      return;
    }
    if (!selectedPlan) {
      Alert.alert('Validation Error', 'Please select an eSIM data plan');
      return;
    }
    if (!email || !email.includes('@')) {
      Alert.alert('Validation Error', 'Please enter a valid email address for eSIM delivery');
      return;
    }
    if (pin.length !== 4) {
      Alert.alert('Validation Error', 'Transaction PIN must be exactly 4 digits');
      return;
    }

    setSubmitting(true);
    try {
      const res = await executeServiceTransaction('esim', {
        country: selectedCountry,
        plan: selectedPlan,
        email: email,
        pin: pin,
      });

      if (res.status) {
        await refreshProfile();
        Alert.alert(
          'eSIM Order Placed',
          res.message || 'eSIM profile generated successfully. The QR code and installation details have been sent to your email address.',
          [{ text: 'Done', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Order Failed', res.message || 'Failed to order eSIM profile.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'An error occurred during eSIM purchase.');
    } finally {
      setSubmitting(false);
      setPin('');
    }
  };

  return (
    <ScrollView style={tw('flex-grow bg-background')} contentContainerStyle={tw('p-5 justify-center')}>
      <Dropdown
        label="Select Country"
        value={selectedCountry}
        placeholder="Choose country"
        options={countries}
        onSelect={(opt) => setSelectedCountry(opt.value)}
      />

      <Dropdown
        label="Select Plan"
        value={selectedPlan}
        placeholder="Choose data bundle"
        options={plans}
        onSelect={(opt) => {
          setSelectedPlan(opt.value);
          setSelectedPlanDetails(opt);
        }}
      />

      <Input
        label="Email for eSIM Delivery"
        placeholder="e.g. john@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        editable={!submitting}
      />

      {selectedPlanDetails && (
        <View style={tw('bg-surface p-4 rounded-xl border border-zinc-800/15 mb-6')}>
          <Text style={tw('text-xs text-textMuted mb-0.5')}>Amount to Debit</Text>
          <Text style={tw('text-lg font-bold text-primary')}>
            ₦{selectedPlanDetails.price?.toLocaleString()}
          </Text>
        </View>
      )}

      <PinInput
        label="Enter 4-Digit PIN to Confirm"
        value={pin}
        onChangeText={setPin}
      />

      <Button
        title="Purchase eSIM Profile"
        onPress={handlePurchase}
        loading={submitting}
        disabled={submitting}
      />
    </ScrollView>
  );
};

export default EsimScreen;
