// src/screens/services/DataScreen.tsx
import React, { useState, useEffect } from 'react';
import { ScrollView, Alert, View, Text } from 'react-native';
import { getAirtimeNetworks, getDataPlans, executeServiceTransaction } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import tw from '../../utils/styles';
import Input from '../../components/common/Input';
import Dropdown, { DropdownOption } from '../../components/common/Dropdown';
import PinInput from '../../components/common/PinInput';
import Button from '../../components/common/Button';

export const DataScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { refreshProfile } = useAuth();
  
  // Lists
  const [networks, setNetworks] = useState<DropdownOption[]>([]);
  const [loadingNetworks, setLoadingNetworks] = useState(true);
  const [plans, setPlans] = useState<DropdownOption[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  // Selections
  const [selectedNetwork, setSelectedNetwork] = useState<string | number | undefined>(undefined);
  const [selectedPlan, setSelectedPlan] = useState<string | number | undefined>(undefined);
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  
  // Meta
  const [submitting, setSubmitting] = useState(false);
  const [selectedPlanDetails, setSelectedPlanDetails] = useState<any>(null);

  // Load networks
  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        const res = await getAirtimeNetworks();
        if (res.status && Array.isArray(res.data)) {
          setNetworks(res.data.map((net: any) => ({
            label: net.network,
            value: net.id,
          })));
        }
      } catch (e) {
        console.error('Failed to load networks', e);
      } finally {
        setLoadingNetworks(false);
      }
    };
    fetchNetworks();
  }, []);

  // Dynamic load plans on network selection
  useEffect(() => {
    if (!selectedNetwork) {
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
        const res = await getDataPlans(Number(selectedNetwork));
        if (res.status && Array.isArray(res.data)) {
          // Store plans as options
          const opts = res.data.map((plan: any) => ({
            label: `${plan.name} - ₦${plan.price}`,
            value: plan.id,
            price: plan.price,
            rawData: plan,
          }));
          setPlans(opts);
        }
      } catch (e) {
        console.error('Failed to load data plans', e);
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchPlans();
  }, [selectedNetwork]);

  const handlePurchase = async () => {
    if (!selectedNetwork) {
      Alert.alert('Validation Error', 'Please select a mobile network');
      return;
    }
    if (!selectedPlan) {
      Alert.alert('Validation Error', 'Please select a data plan');
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
      const res = await executeServiceTransaction('data', {
        network: selectedNetwork,
        plan: selectedPlan,
        phone: phone,
        pin: pin,
      });

      if (res.status) {
        await refreshProfile();
        Alert.alert('Transaction Successful', res.message || 'Data plan purchased successfully.', [
          { text: 'Done', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Transaction Failed', res.message || 'Failed to purchase data bundle.');
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
        label="Select Network"
        value={selectedNetwork}
        placeholder={loadingNetworks ? 'Loading networks...' : 'Choose network'}
        options={networks}
        onSelect={(opt) => setSelectedNetwork(opt.value)}
      />

      <Dropdown
        label="Select Data Plan"
        value={selectedPlan}
        placeholder={
          !selectedNetwork
            ? 'Select network first'
            : loadingPlans
            ? 'Loading plans...'
            : 'Choose plan'
        }
        options={plans}
        onSelect={(opt) => {
          setSelectedPlan(opt.value);
          setSelectedPlanDetails(opt);
        }}
        searchable
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
        title="Purchase Data Bundle"
        onPress={handlePurchase}
        loading={submitting}
        disabled={submitting}
      />
    </ScrollView>
  );
};

export default DataScreen;
