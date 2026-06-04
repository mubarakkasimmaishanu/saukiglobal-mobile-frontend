// src/screens/services/ElectricityScreen.tsx
import React, { useState, useEffect } from 'react';
import { ScrollView, Alert, View, Text, Image, TouchableOpacity } from 'react-native';
import { getElectricityProviders, executeServiceTransaction } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import tw from '../../utils/styles';
import Input from '../../components/common/Input';
import Dropdown, { DropdownOption } from '../../components/common/Dropdown';
import PinInput from '../../components/common/PinInput';
import Button from '../../components/common/Button';

const ELECTRICITY_LOGOS: Record<string, any> = {
  aedc: require('../../../assets/aedc.png'),
  ekedc: require('../../../assets/ekedc.png'),
  ibedc: require('../../../assets/ibedc.png'),
  ikeja: require('../../../assets/ikeja.png'),
  jos: require('../../../assets/jos.png'),
  kaduna: require('../../../assets/kaduna.png'),
  kedco: require('../../../assets/kedco.png'),
  phedc: require('../../../assets/phedc.png'),
};

const getElectricityLogoKey = (name: string): string => {
  const normalized = name.toLowerCase();
  if (normalized.includes('aedc')) return 'aedc';
  if (normalized.includes('ekedc') || normalized.includes('eko')) return 'ekedc';
  if (normalized.includes('ibedc') || normalized.includes('ibadan')) return 'ibedc';
  if (normalized.includes('ikeja') || normalized.includes('ikedc')) return 'ikeja';
  if (normalized.includes('jos') || normalized.includes('jedc')) return 'jos';
  if (normalized.includes('kaduna') || normalized.includes('kaedco')) return 'kaduna';
  if (normalized.includes('kedco') || normalized.includes('kano')) return 'kedco';
  if (normalized.includes('phedc') || normalized.includes('port harcourt')) return 'phedc';
  return '';
};

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
          const opts = res.data.map((p: any) => ({
            label: p.name,
            value: p.abbreviation || p.id,
          }));
          setProviders(opts);
          if (opts.length > 0) {
            setSelectedProvider(String(opts[0].value));
          }
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
    <ScrollView style={tw('flex-grow bg-background')} contentContainerStyle={tw('p-5 justify-start')}>
      <View style={tw('bg-surface p-5 rounded-2xl border border-zinc-800/50 w-full mb-6')}>
        
        {/* Choose Provider */}
        <Text style={tw('text-xs font-bold text-textMuted uppercase mb-3')}>Choose Provider</Text>
        {loadingProviders ? (
          <View style={tw('py-4 items-center mb-4')}>
            <Text style={tw('text-textMuted text-sm')}>Loading providers...</Text>
          </View>
        ) : (
          <View style={tw('flex-row flex-wrap justify-start gap-2 mb-4')}>
            {providers.map((p) => {
              const logoKey = getElectricityLogoKey(p.label);
              const isSelected = selectedProvider === p.value;
              const logoSource = ELECTRICITY_LOGOS[logoKey];

              return (
                <TouchableOpacity
                  key={p.value}
                  activeOpacity={0.7}
                  onPress={() => setSelectedProvider(String(p.value))}
                  style={[
                    tw('p-2 items-center justify-center rounded-xl border-2 bg-background mb-2'),
                    { width: '23%' },
                    isSelected ? tw('border-primary') : tw('border-zinc-800/40'),
                  ]}
                >
                  {logoSource ? (
                    <Image
                      source={logoSource}
                      style={{ width: 28, height: 28, resizeMode: 'contain', marginBottom: 4 }}
                    />
                  ) : (
                    <View style={tw('w-7 h-7 bg-zinc-800 rounded-full items-center justify-center mb-1')}>
                      <Text style={tw('text-textHigh font-bold text-xs')}>{p.label.slice(0, 3)}</Text>
                    </View>
                  )}
                  <Text style={tw('text-xs font-bold text-textHigh text-center uppercase')} numberOfLines={1}>
                    {p.label.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Meter Number Input */}
        <Input
          label="METER NUMBER"
          placeholder="Enter your meter number"
          keyboardType="numeric"
          value={meterNo}
          onChangeText={setMeterNo}
          editable={!submitting}
          labelStyle={tw('text-xs font-bold text-textMuted uppercase mb-2')}
          inputStyle={tw('bg-background px-4 py-4 rounded-xl border border-zinc-800/40 text-base')}
        />

        {/* Amount Input */}
        <Input
          label="AMOUNT (₦)"
          placeholder="Min: ₦500"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          editable={!submitting}
          labelStyle={tw('text-xs font-bold text-textMuted uppercase mb-2')}
          inputStyle={tw('bg-background px-4 py-4 rounded-xl border border-zinc-800/40 text-base')}
        />

        {/* Transaction PIN */}
        <PinInput
          label="TRANSACTION PIN"
          value={pin}
          onChangeText={setPin}
        />

        {/* Action Button */}
        <Button
          title="Purchase Token"
          onPress={handlePayment}
          loading={submitting}
          disabled={submitting}
        />
      </View>
    </ScrollView>
  );
};

export default ElectricityScreen;
