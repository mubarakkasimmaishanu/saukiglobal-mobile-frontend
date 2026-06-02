// src/screens/services/CableScreen.tsx
import React, { useState, useEffect } from 'react';
import { ScrollView, Alert, View, Text } from 'react-native';
import { getCableProviders, getCablePlans, executeServiceTransaction } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import tw from '../../utils/styles';
import Input from '../../components/common/Input';
import Dropdown, { DropdownOption } from '../../components/common/Dropdown';
import PinInput from '../../components/common/PinInput';
import Button from '../../components/common/Button';

export const CableScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { refreshProfile } = useAuth();
  
  // Lists
  const [providers, setProviders] = useState<DropdownOption[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [plans, setPlans] = useState<DropdownOption[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  // Selections
  const [selectedProvider, setSelectedProvider] = useState<string | undefined>(undefined);
  const [selectedPlan, setSelectedPlan] = useState<string | number | undefined>(undefined);
  const [smartCard, setSmartCard] = useState('');
  const [pin, setPin] = useState('');
  
  // Meta
  const [submitting, setSubmitting] = useState(false);
  const [selectedPlanDetails, setSelectedPlanDetails] = useState<any>(null);

  // Load providers
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await getCableProviders();
        if (res.status && Array.isArray(res.data)) {
          setProviders(res.data.map((p: any) => ({
            label: p.name.toUpperCase(),
            value: p.name,
          })));
        }
      } catch (e) {
        console.error('Failed to load cable providers', e);
      } finally {
        setLoadingProviders(false);
      }
    };
    fetchProviders();
  }, []);

  // Dynamically load plans on provider select
  useEffect(() => {
    if (!selectedProvider) {
      setPlans([]);
      setSelectedPlan(undefined);
      setSelectedPlanDetails(null);
      return;
    }

    const fetchPlans = async () => {
      setLoadingPlans(true);
      setSelectedPlan(undefined);
      setSelectedPlanDetails(null);
      try {
        const res = await getCablePlans(selectedProvider);
        if (res.status && Array.isArray(res.data)) {
          setPlans(res.data.map((plan: any) => ({
            label: `${plan.name} - ₦${plan.price}`,
            value: plan.name, // The backend takes plan name or id, documentation payload shows e.g. "DSTV Compact"
            price: plan.price,
            rawData: plan,
          })));
        }
      } catch (e) {
        console.error('Failed to load cable plans', e);
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchPlans();
  }, [selectedProvider]);

  const handlePurchase = async () => {
    if (!selectedProvider) {
      Alert.alert('Validation Error', 'Please select a cable provider');
      return;
    }
    if (!selectedPlan) {
      Alert.alert('Validation Error', 'Please select a subscription plan');
      return;
    }
    if (!smartCard) {
      Alert.alert('Validation Error', 'Smartcard / IUC number is required');
      return;
    }
    if (pin.length !== 4) {
      Alert.alert('Validation Error', 'Transaction PIN must be exactly 4 digits');
      return;
    }

    setSubmitting(true);
    try {
      const res = await executeServiceTransaction('bills', {
        type: 'cable',
        provider: selectedProvider.toLowerCase(),
        customer_id: smartCard,
        amount: selectedPlanDetails?.price,
        plan: selectedPlan,
        pin: pin,
      });

      if (res.status) {
        await refreshProfile();
        Alert.alert('Transaction Successful', res.message || 'Cable subscription updated successfully.', [
          { text: 'Done', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Transaction Failed', res.message || 'Failed to update subscription.');
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
      <Dropdown
        label="Select Provider"
        value={selectedProvider}
        placeholder={loadingProviders ? 'Loading providers...' : 'Choose provider'}
        options={providers}
        onSelect={(opt) => setSelectedProvider(String(opt.value))}
      />

      <Dropdown
        label="Select Package"
        value={selectedPlan}
        placeholder={
          !selectedProvider
            ? 'Select provider first'
            : loadingPlans
            ? 'Loading packages...'
            : 'Choose package'
        }
        options={plans}
        onSelect={(opt) => {
          setSelectedPlan(opt.value);
          setSelectedPlanDetails(opt);
        }}
        searchable
      />

      <Input
        label="Smart Card / IUC Number"
        placeholder="Enter smartcard number"
        keyboardType="numeric"
        value={smartCard}
        onChangeText={setSmartCard}
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
        title="Subscribe Cable"
        onPress={handlePurchase}
        loading={submitting}
        disabled={submitting}
      />
    </ScrollView>
  );
};

export default CableScreen;
