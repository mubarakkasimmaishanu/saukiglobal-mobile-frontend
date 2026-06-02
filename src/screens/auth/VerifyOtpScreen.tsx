// src/screens/auth/VerifyOtpScreen.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { verifyResetCode } from '../../api/auth';
import tw from '../../utils/styles';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const schema = z.object({
  code: z.string().min(4, 'Verification code must be at least 4 digits'),
});

type FormData = z.infer<typeof schema>;

export const VerifyOtpScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { email } = route.params || {};
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { code: '' },
  });

  const onSubmit = async (data: FormData) => {
    if (!email) {
      Alert.alert('Error', 'Missing email address');
      return;
    }
    
    setLoading(true);
    try {
      const res = await verifyResetCode(email, data.code);
      if (res.status) {
        Alert.alert('Code Verified', 'Your verification code is valid.', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('ResetPassword', { email, code: data.code }),
          },
        ]);
      } else {
        Alert.alert('Verification Failed', res.message || 'Invalid verification code');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'An error occurred during verification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={tw('flex-grow bg-background justify-center p-6')}>
      <View style={tw('mb-8')}>
        <Text style={tw('text-2xl font-bold text-textHigh mb-2')}>Verify Code</Text>
        <Text style={tw('text-sm text-textMuted')}>
          Enter the verification code sent to <Text style={tw('text-primary font-semibold')}>{email}</Text>.
        </Text>
      </View>

      <Controller
        control={control}
        name="code"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Verification Code"
            placeholder="Enter verification code"
            keyboardType="numeric"
            autoCapitalize="none"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={errors.code?.message}
          />
        )}
      />

      <Button
        title="Verify Code"
        onPress={handleSubmit(onSubmit)}
        loading={loading}
        style={tw('mt-4')}
      />
    </ScrollView>
  );
};

export default VerifyOtpScreen;
