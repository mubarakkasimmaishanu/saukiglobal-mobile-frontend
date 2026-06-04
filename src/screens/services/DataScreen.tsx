// src/screens/services/DataScreen.tsx
import React, { useState, useEffect } from 'react';
import { ScrollView, Alert, View, Text, Image, TouchableOpacity } from 'react-native';
import { getAirtimeNetworks, getDataPlans, executeServiceTransaction } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import tw from '../../utils/styles';
import Input from '../../components/common/Input';
import Dropdown, { DropdownOption } from '../../components/common/Dropdown';
import PinInput from '../../components/common/PinInput';
import Button from '../../components/common/Button';

const NETWORK_LOGOS: Record<string, any> = {
  mtn: require('../../../assets/mtn.png'),
  airtel: require('../../../assets/airtel.png'),
  glo: require('../../../assets/glo.png'),
  '9mobile': require('../../../assets/9mobile.png'),
};

const getNetworkLogoKey = (name: string): string => {
  const normalized = name.toLowerCase();
  if (normalized.includes('mtn')) return 'mtn';
  if (normalized.includes('airtel')) return 'airtel';
  if (normalized.includes('glo')) return 'glo';
  if (normalized.includes('9mobile') || normalized.includes('9 mobile')) return '9mobile';
  return '';
};

export const DataScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { refreshProfile } = useAuth();
  
  // Lists
  const [networks, setNetworks] = useState<any[]>([]);
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
          const opts = res.data.map((net: any) => ({
            label: net.network,
            value: net.id,
          }));
          setNetworks(opts);
          if (opts.length > 0) {
            setSelectedNetwork(opts[0].value);
          }
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
    <ScrollView style={tw('flex-grow bg-background')} contentContainerStyle={tw('p-5 justify-start')}>
      <View style={tw('bg-surface p-5 rounded-2xl border border-zinc-800/50 w-full mb-6')}>
        
        {/* Choose Network */}
        <Text style={tw('text-xs font-bold text-textMuted uppercase mb-3')}>Choose Network</Text>
        {loadingNetworks ? (
          <View style={tw('py-4 items-center mb-4')}>
            <Text style={tw('text-textMuted text-sm')}>Loading networks...</Text>
          </View>
        ) : (
          <View style={tw('flex-row justify-between mb-5 gap-2')}>
            {networks.map((net) => {
              const logoKey = getNetworkLogoKey(net.label);
              const isSelected = selectedNetwork === net.value;
              const logoSource = NETWORK_LOGOS[logoKey];

              return (
                <TouchableOpacity
                  key={net.value}
                  activeOpacity={0.7}
                  onPress={() => setSelectedNetwork(net.value)}
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
                      <Text style={tw('text-textHigh font-bold text-xs')}>{net.label.slice(0, 3)}</Text>
                    </View>
                  )}
                  <Text style={tw('text-xs font-bold text-textHigh text-center uppercase')}>{net.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Plan Selector Dropdown */}
        <Dropdown
          label="SELECT PLAN"
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
          containerStyle={tw('mb-4')}
        />

        {/* Phone Number Input */}
        <Input
          label="PHONE NUMBER"
          placeholder="08012345678"
          keyboardType="phone-pad"
          maxLength={11}
          value={phone}
          onChangeText={setPhone}
          editable={!submitting}
          labelStyle={tw('text-xs font-bold text-textMuted uppercase mb-2')}
          inputStyle={tw('bg-background px-4 py-4 rounded-xl border border-zinc-800/40 text-base')}
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
          title="Purchase Data Bundle"
          onPress={handlePurchase}
          loading={submitting}
          disabled={submitting}
        />
      </View>
    </ScrollView>
  );
};

export default DataScreen;
