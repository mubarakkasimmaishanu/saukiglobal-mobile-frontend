// src/screens/services/CableScreen.tsx
import React, { useState, useEffect } from 'react';
import { ScrollView, Alert, View, Text, Image, TouchableOpacity } from 'react-native';
import { getCableProviders, getCablePlans, executeServiceTransaction } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import tw from '../../utils/styles';
import Input from '../../components/common/Input';
import Dropdown, { DropdownOption } from '../../components/common/Dropdown';
import PinInput from '../../components/common/PinInput';
import Button from '../../components/common/Button';

const CABLE_LOGOS: Record<string, any> = {
  dstv: require('../../../assets/dstv.png'),
  gotv: require('../../../assets/gotv.png'),
  startimes: require('../../../assets/startimes.png'),
};

const getCableLogoKey = (name: string): string => {
  const normalized = name.toLowerCase();
  if (normalized.includes('dstv')) return 'dstv';
  if (normalized.includes('gotv')) return 'gotv';
  if (normalized.includes('startimes') || normalized.includes('star times')) return 'startimes';
  return '';
};

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
          const opts = res.data.map((p: any) => ({
            label: p.name.toUpperCase(),
            value: p.name,
          }));
          setProviders(opts);
          if (opts.length > 0) {
            setSelectedProvider(String(opts[0].value));
          }
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
    <ScrollView style={tw('flex-grow bg-background')} contentContainerStyle={tw('p-5 justify-start')}>
      <View style={tw('bg-surface p-5 rounded-2xl border border-zinc-800/50 w-full mb-6')}>
        
        {/* Choose Provider */}
        <Text style={tw('text-xs font-bold text-textMuted uppercase mb-3')}>Choose Provider</Text>
        {loadingProviders ? (
          <View style={tw('py-4 items-center mb-4')}>
            <Text style={tw('text-textMuted text-sm')}>Loading providers...</Text>
          </View>
        ) : (
          <View style={tw('flex-row justify-between mb-5 gap-2')}>
            {providers.map((prov) => {
              const logoKey = getCableLogoKey(prov.label);
              const isSelected = selectedProvider === prov.value;
              const logoSource = CABLE_LOGOS[logoKey];

              return (
                <TouchableOpacity
                  key={prov.value}
                  activeOpacity={0.7}
                  onPress={() => setSelectedProvider(String(prov.value))}
                  style={[
                    tw('flex-1 p-3 items-center justify-center rounded-xl border-2 bg-background'),
                    isSelected ? tw('border-primary') : tw('border-zinc-800/40'),
                  ]}
                >
                  {logoSource ? (
                    <Image
                      source={logoSource}
                      style={{ width: 36, height: 36, resizeMode: 'contain', marginBottom: 6 }}
                    />
                  ) : (
                    <View style={tw('w-9 h-9 bg-zinc-800 rounded-full items-center justify-center mb-1.5')}>
                      <Text style={tw('text-textHigh font-bold text-xs')}>{prov.label.slice(0, 3)}</Text>
                    </View>
                  )}
                  <Text style={tw('text-xs font-bold text-textHigh text-center uppercase')}>{prov.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Smart Card / IUC Number Input */}
        <Input
          label="IUC/SMARTCARD NUMBER"
          placeholder="Enter smartcard number"
          keyboardType="numeric"
          value={smartCard}
          onChangeText={setSmartCard}
          editable={!submitting}
          labelStyle={tw('text-xs font-bold text-textMuted uppercase mb-2')}
          inputStyle={tw('bg-background px-4 py-4 rounded-xl border border-zinc-800/40 text-base')}
        />

        {/* Package Selector Dropdown */}
        <Dropdown
          label="SELECT PACKAGE"
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
          containerStyle={tw('mb-4')}
        />

        {/* Amount Details Box */}
        {selectedPlanDetails && (
          <View style={tw('bg-background p-4 rounded-xl border border-zinc-800/40 mb-6')}>
            <Text style={tw('text-xs font-bold text-textMuted uppercase mb-1')}>Amount to Debit</Text>
            <Text style={tw('text-lg font-bold text-primary')}>
              ₦{selectedPlanDetails.price?.toLocaleString()}
            </Text>
          </View>
        )}

        {/* Transaction PIN */}
        <PinInput
          label="TRANSACTION PIN"
          value={pin}
          onChangeText={setPin}
        />

        {/* Action Button */}
        <Button
          title="Subscribe Cable"
          onPress={handlePurchase}
          loading={submitting}
          disabled={submitting}
        />
      </View>
    </ScrollView>
  );
};

export default CableScreen;
