// src/screens/services/AirtimeScreen.tsx
import React, { useState, useEffect } from 'react';
import { ScrollView, Alert, View, Text, Image, TouchableOpacity } from 'react-native';
import { getAirtimeNetworks, executeServiceTransaction } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import tw from '../../utils/styles';
import Input from '../../components/common/Input';
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

export const AirtimeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { refreshProfile } = useAuth();
  
  // States
  const [networks, setNetworks] = useState<any[]>([]);
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
          if (opts.length > 0) {
            setSelectedNetwork(opts[0].value);
          }
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

        {/* Amount Input */}
        <Input
          label="AMOUNT (₦)"
          placeholder="Min: ₦50"
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
          title="Purchase Airtime"
          onPress={handlePurchase}
          loading={submitting}
          disabled={submitting}
        />
      </View>
    </ScrollView>
  );
};

export default AirtimeScreen;
