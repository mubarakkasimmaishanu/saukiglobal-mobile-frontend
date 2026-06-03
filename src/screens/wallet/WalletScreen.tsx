// src/screens/wallet/WalletScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Alert, Clipboard, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { getVirtualAccounts, initializePayment, getDashboardStats, createVirtualAccount } from '../../api/services';
import tw from '../../utils/styles';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Dropdown from '../../components/common/Dropdown';

export const WalletScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, refreshProfile } = useAuth();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [amount, setAmount] = useState('');
  const [gateway, setGateway] = useState<'paystack' | 'korapay' | 'monnify'>('paystack');
  const [funding, setFunding] = useState(false);

  // KYC States for Virtual Account Provisioning
  const [kycType, setKycType] = useState<'bvn' | 'nin'>('bvn');
  const [kycValue, setKycValue] = useState('');
  const [generating, setGenerating] = useState(false);

  const fetchAccounts = async () => {
    try {
      setLoadingAccounts(true);
      const res = await getVirtualAccounts();
      if (res.status && Array.isArray(res.data)) {
        setAccounts(res.data);
      }
    } catch (e) {
      console.error('Failed to load virtual accounts', e);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleGenerateVirtualAccounts = async () => {
    if (kycValue.length !== 11 || !/^\d{11}$/.test(kycValue)) {
      Alert.alert('Validation Error', `${kycType.toUpperCase()} must be exactly 11 digits`);
      return;
    }

    setGenerating(true);
    try {
      const bvn = kycType === 'bvn' ? kycValue : undefined;
      const nin = kycType === 'nin' ? kycValue : undefined;
      
      const res = await createVirtualAccount(bvn, nin);
      if (res.status) {
        Alert.alert('Success', res.message || 'Virtual accounts generated successfully!');
        setKycValue('');
        await fetchAccounts(); // Refresh bank accounts list
      } else {
        Alert.alert('Generation Failed', res.message || 'Could not generate virtual accounts.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'An error occurred during account provisioning.');
    } finally {
      setGenerating(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchAccounts(), refreshProfile()]);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const copyToClipboard = (text: string, title: string) => {
    Clipboard.setString(text);
    Alert.alert('Copied!', `${title} copied to clipboard.`);
  };

  const handleOnlineFunding = async () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < 100) {
      Alert.alert('Invalid Amount', 'Minimum online funding amount is ₦100');
      return;
    }

    setFunding(true);
    try {
      const res = await initializePayment({ amount: amt, gateway });
      if (res.status && res.data) {
        const { checkout_url, reference } = res.data;
        // Reset amount field
        setAmount('');
        // Navigate to secure checkout screen
        navigation.navigate('FundOnline', {
          checkoutUrl: checkout_url,
          reference: reference,
          gateway: gateway,
        });
      } else {
        Alert.alert('Payment Failed', res.message || 'Could not initialize payment gateway');
      }
    } catch (e: any) {
      Alert.alert('Payment Error', e.message || 'An error occurred during payment initialization');
    } finally {
      setFunding(false);
    }
  };

  const gateways = [
    { label: 'Paystack Gateway', value: 'paystack' },
    { label: 'Korapay Gateway (PayVessel)', value: 'korapay' },
    { label: 'Monnify Gateway', value: 'monnify' },
  ];

  return (
    <ScrollView
      style={tw('flex-1 bg-background')}
      contentContainerStyle={tw('p-5')}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#10b981" />
      }
    >
      {/* Wallet Balance Card */}
      <Card style={tw('mb-6 bg-surface')}>
        <Text style={tw('text-textMuted text-xs font-medium mb-1')}>Current Wallet Balance</Text>
        <Text style={tw('text-3xl font-bold text-textHigh mb-1')}>
          ₦{(user?.balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </Text>
        <Text style={tw('text-xs text-primary font-medium')}>
          Motto: "Sauki in everything transaction"
        </Text>
      </Card>

      {/* Manual Bank Funding Section */}
      <View style={tw('mb-6')}>
        <Text style={tw('text-base font-bold text-textHigh mb-3')}>Bank Transfer (Instant Funding)</Text>
        <Text style={tw('text-xs text-textMuted mb-4')}>
          Transfer to any of the bank accounts listed below. Your wallet will be credited automatically within minutes (₦50 stamp duty fee applies).
        </Text>

        {loadingAccounts ? (
          <View style={tw('py-6 bg-surface rounded-2xl items-center')}>
            <ActivityIndicator color="#10b981" />
            <Text style={tw('text-xs text-textMuted mt-2')}>Generating your virtual accounts...</Text>
          </View>
        ) : accounts.length === 0 ? (
          <View style={tw('bg-surface p-6 rounded-2xl border border-zinc-800/20')}>
            <Text style={tw('text-base font-bold text-textHigh text-center mb-1')}>
              Verify KYC to Provision Virtual Accounts
            </Text>
            <Text style={tw('text-xs text-textMuted text-center mb-6')}>
              Choose a verification method and enter your 11-digit BVN or NIN number to generate your instant funding bank accounts.
            </Text>

            <Dropdown
              label="Verification Type"
              value={kycType}
              options={[
                { label: 'Bank Verification Number (BVN)', value: 'bvn' },
                { label: 'National Identification Number (NIN)', value: 'nin' },
              ]}
              onSelect={(opt) => setKycType(opt.value as 'bvn' | 'nin')}
            />

            <Input
              label={kycType === 'bvn' ? '11-Digit BVN Number' : '11-Digit NIN Number'}
              placeholder={`Enter 11-digit ${kycType.toUpperCase()}`}
              keyboardType="numeric"
              maxLength={11}
              value={kycValue}
              onChangeText={setKycValue}
            />

            <Button
              title="Generate Virtual Accounts"
              onPress={handleGenerateVirtualAccounts}
              loading={generating}
              disabled={kycValue.length !== 11 || !/^\d{11}$/.test(kycValue)}
              style={tw('mt-2')}
            />
          </View>
        ) : (
          <View style={tw('flex-col gap-4')}>
            {accounts.map((acc, i) => (
              <Card key={i} style={tw('border border-zinc-800/30 bg-surface/50 p-4')}>
                <View style={tw('flex-row items-center justify-between mb-2')}>
                  <Text style={tw('text-sm font-bold text-textHigh')}>{acc.bank_name}</Text>
                  <Text style={tw('text-xs text-primary font-bold bg-primaryDark/20 px-2 py-0.5 rounded-full')}>
                    ACTIVE
                  </Text>
                </View>
                
                <View style={tw('mb-3')}>
                  <Text style={tw('text-textMuted text-xs mb-1')}>Account Number</Text>
                  <View style={tw('flex-row items-center justify-between')}>
                    <Text style={tw('text-xl font-semibold text-textHigh letter-spacing-1')}>{acc.account_number}</Text>
                    <TouchableOpacity
                      onPress={() => copyToClipboard(acc.account_number, 'Account number')}
                      style={tw('bg-primaryDark/30 px-3 py-1 rounded-lg')}
                    >
                      <Text style={tw('text-xs text-primary font-bold')}>Copy</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View>
                  <Text style={tw('text-textMuted text-xs mb-0.5')}>Account Name</Text>
                  <Text style={tw('text-sm font-medium text-textHigh')}>{acc.account_name}</Text>
                </View>
              </Card>
            ))}
          </View>
        )}
      </View>

      {/* Online Funding Gateway Section */}
      <View style={tw('mb-6')}>
        <Text style={tw('text-base font-bold text-textHigh mb-3')}>Online Funding (Instant Checkout)</Text>
        
        <Card style={tw('border border-zinc-800/20')}>
          <Input
            label="Amount (₦)"
            placeholder="Min: ₦100"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />

          <Dropdown
            label="Payment Gateway"
            value={gateway}
            placeholder="Select Gateway"
            options={gateways}
            onSelect={(opt) => setGateway(opt.value as any)}
          />

          <Button
            title="Fund Wallet Now"
            onPress={handleOnlineFunding}
            loading={funding}
            style={tw('mt-2')}
          />
        </Card>
      </View>
    </ScrollView>
  );
};

export default WalletScreen;
