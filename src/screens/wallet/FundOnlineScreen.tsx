// src/screens/wallet/FundOnlineScreen.tsx
import React, { useState } from 'react';
import { View, Text, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { verifyTransaction } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import tw from '../../utils/styles';
import { COLORS } from '../../constants/theme';

export const FundOnlineScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { checkoutUrl, reference, gateway } = route.params || {};
  const { refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  const handleClose = () => {
    Alert.alert(
      'Close Checkout',
      'Are you sure you want to close this payment screen? We will check if your transaction was successful.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes, Close', onPress: () => runVerification() }
      ]
    );
  };

  const runVerification = async () => {
    setVerifying(true);
    try {
      const res = await verifyTransaction(reference);
      if (res.status) {
        await refreshProfile();
        Alert.alert('Payment Successful', 'Your wallet has been funded successfully.', [
          { text: 'Great', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Verification Check', 'No successful payment found yet. If you were debited, please contact support with reference: ' + reference, [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (e: any) {
      Alert.alert('Verification Error', e.message || 'Unable to verify payment status automatically.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } finally {
      setVerifying(false);
    }
  };

  const handleNavigationStateChange = (navState: any) => {
    const { url } = navState;
    
    // Automatically intercept success redirection URL schemes
    if (
      url.includes('success') || 
      url.includes('callback') || 
      url.includes('completed') || 
      url.includes('transaction-status') ||
      url.includes('saukiglobal.com')
    ) {
      // Small pause to let webhook deliver payment
      setTimeout(() => runVerification(), 1000);
    }
  };

  if (verifying) {
    return (
      <View style={tw('flex-1 bg-background items-center justify-center p-6')}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={tw('text-base text-textHigh font-semibold mt-4 text-center')}>
          Verifying Payment Status...
        </Text>
        <Text style={tw('text-xs text-textMuted mt-2 text-center')}>
          Please hold on, we are syncing with your bank.
        </Text>
      </View>
    );
  }

  return (
    <View style={tw('flex-1 bg-background')}>
      {/* Header bar */}
      <View style={tw('flex-row items-center justify-between bg-surface px-4 py-3 border-b border-zinc-800')}>
        <Text style={tw('text-xs text-textMuted')}>Ref: {reference}</Text>
        <TouchableOpacity onPress={handleClose} style={tw('bg-primaryDark/30 px-3 py-1.5 rounded-lg')}>
          <Text style={tw('text-xs text-primary font-bold')}>Done / Close</Text>
        </TouchableOpacity>
      </View>

      <View style={tw('flex-1 relative')}>
        <WebView
          source={{ uri: checkoutUrl }}
          onNavigationStateChange={handleNavigationStateChange}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          style={tw('flex-1 bg-white')}
        />
        
        {loading && (
          <View style={[
            tw('position-absolute w-full h-full items-center justify-center bg-background opacity-90'),
            { top: 0, left: 0 }
          ]}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={tw('text-xs text-textMuted mt-2')}>Loading Checkout portal...</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default FundOnlineScreen;
