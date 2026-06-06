// src/screens/services/ServicesScreen.tsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import tw from '../../utils/styles';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

export const ServicesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const services = [
    { title: 'Airtime Topup', desc: 'MTN, Airtel, Glo, 9mobile', icon: 'phone-portrait-outline', screen: 'BuyAirtime', available: true },
    { title: 'Data Bundles', desc: 'Fast SME & Corporate Gifting', icon: 'wifi-outline', screen: 'BuyData', available: true },
    { title: 'Electricity Bills', desc: 'Prepaid & Postpaid Tokens', icon: 'flash-outline', screen: 'PayElectricity', available: true },
    { title: 'Cable TV', desc: 'DSTV, GOTV, Startimes', icon: 'tv-outline', screen: 'PayCable', available: true },
    { title: 'Exam Pin Cards', desc: 'WAEC, NECO check pins', icon: 'school-outline', screen: 'ExamScratch', available: false },
    { title: 'Kirani Airtime', desc: 'Kirani Network Top-up', icon: 'globe-outline', screen: 'KiraniAirtime', available: false },
    { title: 'Ratel Airtime', desc: 'Ratel Network Call Credit', icon: 'call-outline', screen: 'RatelAirtime', available: false },
    { title: 'Smile Voice', desc: 'Smile ISP Voice Package', icon: 'mic-outline', screen: 'SmileVoice', available: false },
    { title: 'Smile Data Bundle', desc: 'Smile ISP High-speed Data', icon: 'cellular-outline', screen: 'SmileData', available: false },
    { title: 'Alpha Call', desc: 'Alpha Platform Credits', icon: 'radio-outline', screen: 'AlphaCall', available: false },
    { title: 'eSIM Profile', desc: 'Digital eSIM QR Codes', icon: 'barcode-outline', screen: 'BuyEsim', available: false },
    { title: 'International Topup', desc: 'Global Airtime & Data', icon: 'airplane-outline', screen: 'IntlTopup', available: false },
  ];

  const handlePress = (srv: any) => {
    if (srv.available) {
      navigation.navigate(srv.screen);
    } else {
      Alert.alert(
        'Service Unavailable',
        'This service is temporarily unavailable. We are currently focusing on Airtime, Data, TV, and Electricity purchases.'
      );
    }
  };

  return (
    <ScrollView style={tw('flex-1 bg-background')} contentContainerStyle={tw('p-5')}>
      <View style={tw('mb-4')}>
        <Text style={tw('text-lg font-bold text-textHigh mb-1')}>All Transactions</Text>
        <Text style={tw('text-sm text-textMuted')}>Choose from our catalog of 12+ premium services</Text>
      </View>

      <View style={tw('flex-col gap-4')}>
        {services.map((srv, i) => (
          <TouchableOpacity
            key={i}
            activeOpacity={srv.available ? 0.7 : 1}
            onPress={() => handlePress(srv)}
            style={[
              tw('bg-surface p-4 rounded-xl border border-zinc-800/20 flex-row items-center'),
              !srv.available ? tw('opacity-50') : {},
            ]}
          >
            <View style={tw('w-12 h-12 bg-primaryDark/30 items-center justify-center rounded-xl mr-4')}>
              <Ionicons name={srv.icon as any} size={22} color={srv.available ? COLORS.primary : COLORS.textMuted} />
            </View>
            
            <View style={tw('flex-1')}>
              <Text style={tw('text-base font-semibold text-textHigh mb-0.5')}>{srv.title}</Text>
              <Text style={tw('text-xs text-textMuted')}>{srv.desc}</Text>
            </View>

            {srv.available ? (
              <Text style={tw('text-primary font-bold text-base px-1')}>›</Text>
            ) : (
              <Ionicons name="lock-closed" size={14} color={COLORS.warning} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

export default ServicesScreen;
