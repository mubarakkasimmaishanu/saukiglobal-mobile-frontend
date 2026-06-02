// src/screens/auth/ForgotPasswordScreen.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { requestPasswordReset } from '../../api/auth';
import tw from '../../utils/styles';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type FormData = z.infer<typeof schema>;

export const ForgotPasswordScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await requestPasswordReset(data.email);
      if (res.status) {
        Alert.alert('Reset Code Sent', res.message || 'Verification code sent to your email.', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('VerifyOtp', { email: data.email }),
          },
        ]);
      } else {
        Alert.alert('Request Failed', res.message || 'Could not send reset code');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={tw('flex-grow bg-background justify-center p-6')}>
      <View style={tw('mb-8')}>
        <Text style={tw('text-2xl font-bold text-textHigh mb-2')}>Forgot Password</Text>
        <Text style={tw('text-sm text-textMuted')}>
          Enter your registered email address and we will send you a verification code to reset your password.
        </Text>
      </View>

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Email Address"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={errors.email?.message}
          />
        )}
      />

      <Button
        title="Send Verification Code"
        onPress={handleSubmit(onSubmit)}
        loading={loading}
        style={tw('mt-4')}
      />
    </ScrollView>
  );
};

export default ForgotPasswordScreen;
