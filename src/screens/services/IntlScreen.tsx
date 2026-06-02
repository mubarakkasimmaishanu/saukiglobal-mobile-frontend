// src/screens/services/IntlScreen.tsx
import React, { useState } from 'react';
import { ScrollView, Alert, View, Text, TouchableOpacity } from 'react-native';
import { executeServiceTransaction } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import tw from '../../utils/styles';
import Input from '../../components/common/Input';
import Dropdown, { DropdownOption } from '../../components/common/Dropdown';
import PinInput from '../../components/common/PinInput';
import Button from '../../components/common/Button';

export const IntlScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { refreshProfile } = useAuth();
  
  // States
  const [selectedCountry, setSelectedCountry] = useState<string | number | undefined>(undefined);
  const [selectedNetwork, setSelectedNetwork] = useState<string | number | undefined>(undefined);
  const [topupType, setTopupType] = useState<'airtime' | 'data'>('airtime');
  const [selectedPlan, setSelectedPlan] = useState<string | number | undefined>(undefined);
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedPlanDetails, setSelectedPlanDetails] = useState<any>(null);

  const countries = [
    { label: 'Benin Republic', value: 'BJ' },
    { label: 'Ghana', value: 'GH' },
    { label: 'Kenya', value: 'KE' },
    { label: 'Cameroon', value: 'CM' },
    { label: 'Niger', value: 'NE' },
  ];

  const networks = [
    { label: 'MTN Global', value: 'mtn_global' },
    { label: 'Orange Mobile', value: 'orange_global' },
    { label: 'Vodafone', value: 'vodafone_global' },
    { label: 'Airtel Africa', value: 'airtel_global' },
  ];

  const dataPlans = [
    { label: 'Intl Data 1GB - 7 Days (₦2,500)', value: 'intl_1gb_7d', price: 2500 },
    { label: 'Intl Data 3GB - 15 Days (₦6,000)', value: 'intl_3gb_15d', price: 6000 },
    { label: 'Intl Data 5GB - 30 Days (₦9,500)', value: 'intl_5gb_30d', price: 9500 },
  ];

  const handlePurchase = async () => {
    if (!selectedCountry) {
      Alert.alert('Validation Error', 'Please select a destination country');
      return;
    }
    if (!selectedNetwork) {
      Alert.alert('Validation Error', 'Please select an operator network');
      return;
    }
    if (topupType === 'data' && !selectedPlan) {
      Alert.alert('Validation Error', 'Please select an international data plan');
      return;
    }
    const amt = parseFloat(amount);
    if (topupType === 'airtime' && (isNaN(amt) || amt <= 0)) {
      Alert.alert('Validation Error', 'Please enter a valid airtime amount');
      return;
    }
    if (!phone) {
      Alert.alert('Validation Error', 'International phone number is required');
      return;
    }
    if (pin.length !== 4) {
      Alert.alert('Validation Error', 'Transaction PIN must be exactly 4 digits');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        country: selectedCountry,
        network: selectedNetwork,
        type: topupType,
        phone: phone,
        pin: pin,
      };

      if (topupType === 'data') {
        payload.plan = selectedPlan;
        const planObj = dataPlans.find(p => p.value === selectedPlan);
        payload.amount = planObj ? planObj.price : 0;
      } else {
        payload.amount = amt;
      }

      const res = await executeServiceTransaction('intl', payload);

      if (res.status) {
        await refreshProfile();
        Alert.alert('Transaction Successful', res.message || 'International top-up processed successfully.', [
          { text: 'Done', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Transaction Failed', res.message || 'Failed to process international topup.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'An error occurred during international transaction.');
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
        label="Select Network"
        value={selectedNetwork}
        placeholder="Choose operator network"
        options={networks}
        onSelect={(opt) => setSelectedNetwork(opt.value)}
      />

      {/* Selector: Airtime vs Data */}
      <View style={tw('mb-4')}>
        <Text style={tw('text-sm font-medium text-textHigh mb-2')}>Select Topup Type</Text>
        <View style={tw('flex-row bg-surface p-1 rounded-xl')}>
          <TouchableOpacity
            onPress={() => setTopupType('airtime')}
            style={[
              tw('flex-1 py-3.5 items-center justify-center rounded-lg'),
              topupType === 'airtime' ? tw('bg-primaryDark') : {},
            ]}
          >
            <Text style={[tw('text-xs font-bold text-textMuted'), topupType === 'airtime' ? tw('text-primary') : {}]}>
              AIRTIME recharges
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTopupType('data')}
            style={[
              tw('flex-1 py-3.5 items-center justify-center rounded-lg'),
              topupType === 'data' ? tw('bg-primaryDark') : {},
            ]}
          >
            <Text style={[tw('text-xs font-bold text-textMuted'), topupType === 'data' ? tw('text-primary') : {}]}>
              DATA bundles
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Input
        label="Phone Number (With Country Code)"
        placeholder="e.g. +233241234567"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        editable={!submitting}
      />

      {topupType === 'data' ? (
        <Dropdown
          label="Select Data Plan"
          value={selectedPlan}
          placeholder="Choose plan"
          options={dataPlans}
          onSelect={(opt) => {
            setSelectedPlan(opt.value);
            setSelectedPlanDetails(opt);
          }}
        />
      ) : (
        <Input
          label="Amount (₦)"
          placeholder="Enter credit amount in NGN"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          editable={!submitting}
        />
      )}

      {topupType === 'data' && selectedPlanDetails && (
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
        title="Purchase International Top-up"
        onPress={handlePurchase}
        loading={submitting}
        disabled={submitting}
      />
    </ScrollView>
  );
};

export default IntlScreen;
