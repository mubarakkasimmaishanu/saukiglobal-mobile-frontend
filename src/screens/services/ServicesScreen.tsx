// src/screens/services/ServicesScreen.tsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import tw from '../../utils/styles';

export const ServicesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const services = [
    { title: 'Airtime Topup', desc: 'MTN, Airtel, Glo, 9mobile', icon: '📱', screen: 'BuyAirtime' },
    { title: 'Data Bundles', desc: 'Fast SME & Corporate Gifting', icon: '📡', screen: 'BuyData' },
    { title: 'Electricity Bills', desc: 'Prepaid & Postpaid Tokens', icon: '⚡', screen: 'PayElectricity' },
    { title: 'Cable TV', desc: 'DSTV, GOTV, Startimes', icon: '📺', screen: 'PayCable' },
    { title: 'Exam Pin Cards', desc: 'WAEC, NECO check pins', icon: '📝', screen: 'ExamScratch' },
    { title: 'Kirani Airtime', desc: 'Kirani Network Top-up', icon: '🌐', screen: 'KiraniAirtime' },
    { title: 'Ratel Airtime', desc: 'Ratel Network Call Credit', icon: '📞', screen: 'RatelAirtime' },
    { title: 'Smile Voice', desc: 'Smile ISP Voice Package', icon: '🗣️', screen: 'SmileVoice' },
    { title: 'Smile Data Bundle', desc: 'Smile ISP High-speed Data', icon: '📶', screen: 'SmileData' },
    { title: 'Alpha Call', desc: 'Alpha Platform Credits', icon: '🎯', screen: 'AlphaCall' },
    { title: 'eSIM Profile', desc: 'Digital eSIM QR Codes', icon: '📲', screen: 'BuyEsim' },
    { title: 'International Topup', desc: 'Global Airtime & Data', icon: '✈️', screen: 'IntlTopup' },
  ];

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
            activeOpacity={0.7}
            onPress={() => navigation.navigate(srv.screen)}
            style={tw('bg-surface p-4 rounded-xl border border-zinc-800/20 flex-row items-center')}
          >
            <View style={tw('w-12 h-12 bg-primaryDark/30 items-center justify-center rounded-xl mr-4')}>
              <Text style={tw('text-2xl')}>{srv.icon}</Text>
            </View>
            
            <View style={tw('flex-1')}>
              <Text style={tw('text-base font-semibold text-textHigh mb-0.5')}>{srv.title}</Text>
              <Text style={tw('text-xs text-textMuted')}>{srv.desc}</Text>
            </View>

            <Text style={tw('text-primary font-bold text-base px-1')}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

export default ServicesScreen;
