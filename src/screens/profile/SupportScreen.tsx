// src/screens/profile/SupportScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { getServiceConfigurations } from '../../api/services';
import tw from '../../utils/styles';
import Card from '../../components/common/Card';
import Skeleton from '../../components/common/Skeleton';

export const SupportScreen: React.FC = () => {
  const [configs, setConfigs] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const res = await getServiceConfigurations();
        if (res.status && res.data) {
          setConfigs(res.data);
        }
      } catch (e) {
        console.error('Failed to load support config', e);
      } finally {
        setLoading(false);
      }
    };
    fetchConfigs();
  }, []);

  const supportEmail = configs?.support_email || 'info@saukiglobal.com';
  const supportPhone = configs?.support_phone || '+2348123456789';
  const supportWhatsapp = configs?.support_whatsapp || 'https://wa.me/2348123456789';
  const supportTelegram = configs?.support_telegram || 'https://t.me/SaukiGlobal';

  const triggerLink = (url: string, schemeName: string) => {
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Cannot Open link', `No app installed to handle ${schemeName} operations.`);
        }
      })
      .catch((err) => console.error('An error occurred opening url', err));
  };

  const faqs = [
    { q: 'How do I fund my wallet?', a: 'Go to the Wallet screen and copy your unique Wema or PalmPay virtual account. Transfer money there and your wallet credits automatically.' },
    { q: 'My transaction is pending, what should I do?', a: 'Some operator transactions experience network delays. The system automatically reconciles them. You can pull-to-refresh to sync status.' },
    { q: 'Can I withdraw my profit commission?', a: 'Yes! You can transfer your referral and profit commissions into your main wallet balance or withdraw directly depending on requirements.' },
    { q: 'What is transaction PIN?', a: 'This is a secure 4-digit code created at registration. You must input it to validate and authorize any purchase or balance deduction.' },
  ];

  return (
    <ScrollView style={tw('flex-1 bg-background')} contentContainerStyle={tw('p-5')}>
      {/* Introduction */}
      <View style={tw('mb-6')}>
        <Text style={tw('text-lg font-bold text-textHigh mb-1')}>Need Assistance?</Text>
        <Text style={tw('text-sm text-textMuted')}>Get in touch with our 24/7 dedicated client helpdesk.</Text>
      </View>

      {/* Support Action Cards */}
      <View style={tw('flex-row flex-wrap gap-4 mb-6 justify-between')}>
        {/* Email support */}
        <TouchableOpacity
          onPress={() => triggerLink(`mailto:${supportEmail}`, 'email')}
          style={tw('bg-surface p-4 rounded-xl w-[47%] border border-zinc-800/20')}
        >
          <Text style={tw('text-2xl mb-2')}>📧</Text>
          <Text style={tw('text-sm font-semibold text-textHigh mb-1')}>Send Email</Text>
          <Text style={tw('text-xs text-textMuted')} numberOfLines={1}>{supportEmail}</Text>
        </TouchableOpacity>

        {/* WhatsApp Support */}
        <TouchableOpacity
          onPress={() => triggerLink(supportWhatsapp, 'WhatsApp')}
          style={tw('bg-surface p-4 rounded-xl w-[47%] border border-zinc-800/20')}
        >
          <Text style={tw('text-2xl mb-2')}>💬</Text>
          <Text style={tw('text-sm font-semibold text-textHigh mb-1')}>WhatsApp</Text>
          <Text style={tw('text-xs text-textMuted')}>Chat instantly</Text>
        </TouchableOpacity>

        {/* Phone call support */}
        <TouchableOpacity
          onPress={() => triggerLink(`tel:${supportPhone}`, 'phone dialer')}
          style={tw('bg-surface p-4 rounded-xl w-[47%] border border-zinc-800/20')}
        >
          <Text style={tw('text-2xl mb-2')}>📞</Text>
          <Text style={tw('text-sm font-semibold text-textHigh mb-1')}>Call Us</Text>
          <Text style={tw('text-xs text-textMuted')} numberOfLines={1}>{supportPhone}</Text>
        </TouchableOpacity>

        {/* Telegram channel */}
        <TouchableOpacity
          onPress={() => triggerLink(supportTelegram, 'Telegram')}
          style={tw('bg-surface p-4 rounded-xl w-[47%] border border-zinc-800/20')}
        >
          <Text style={tw('text-2xl mb-2')}>✈️</Text>
          <Text style={tw('text-sm font-semibold text-textHigh mb-1')}>Telegram</Text>
          <Text style={tw('text-xs text-textMuted')}>Join Channel</Text>
        </TouchableOpacity>
      </View>

      {/* Frequently Asked Questions */}
      <View style={tw('mb-6')}>
        <Text style={tw('text-base font-bold text-textHigh mb-4')}>Frequently Asked Questions</Text>

        <View style={tw('gap-4')}>
          {faqs.map((faq, idx) => (
            <Card key={idx} style={tw('bg-surface p-4 border border-zinc-800/20')}>
              <Text style={tw('text-sm font-semibold text-primary mb-1.5')}>Q: {faq.q}</Text>
              <Text style={tw('text-xs text-textMuted leading-5')}>A: {faq.a}</Text>
            </Card>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default SupportScreen;
