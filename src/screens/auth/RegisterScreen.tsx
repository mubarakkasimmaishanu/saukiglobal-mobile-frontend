// src/screens/auth/RegisterScreen.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../context/AuthContext';
import tw from '../../utils/styles';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import PinInput from '../../components/common/PinInput';
import Dropdown from '../../components/common/Dropdown';

const registerSchema = z.object({
  name: z.string().min(3, 'Full name must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(11, 'Phone number must be at least 11 digits').max(15, 'Phone number too long'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  transaction_pin: z.string().length(4, 'Transaction PIN must be exactly 4 digits'),
  referral_code: z.string().optional(),
  kyc_type: z.enum(['none', 'nin', 'bvn']).default('none'),
  kyc_value: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
}).refine((data) => {
  if (data.kyc_type !== 'none' && (!data.kyc_value || data.kyc_value.length !== 11)) {
    return false;
  }
  return true;
}, {
  message: 'NIN or BVN must be exactly 11 digits',
  path: ['kyc_value'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema) as any,
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      transaction_pin: '',
      referral_code: '',
      kyc_type: 'none',
      kyc_value: '',
    },
  });

  const selectedKycType = watch('kyc_type');

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      const payload: any = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        transaction_pin: data.transaction_pin,
        referral_code: data.referral_code || undefined,
      };

      if (data.kyc_type !== 'none' && data.kyc_value) {
        payload.kyc_type = data.kyc_type;
        if (data.kyc_type === 'nin') {
          payload.nin = data.kyc_value;
        } else {
          payload.bvn = data.kyc_value;
        }
      }

      const res = await register(payload);
      if (!res.status) {
        Alert.alert('Registration Failed', res.message || 'Verification or processing error');
      }
    } catch (e: any) {
      Alert.alert('Registration Error', e.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const kycOptions = [
    { label: 'No Verification (Do Later)', value: 'none' },
    { label: 'National Identification Number (NIN)', value: 'nin' },
    { label: 'Bank Verification Number (BVN)', value: 'bvn' },
  ];

  return (
    <ScrollView contentContainerStyle={tw('flex-grow bg-background p-6')}>
      <View style={tw('mb-6')}>
        <Text style={tw('text-2xl font-bold text-textHigh mb-1')}>Create Account</Text>
        <Text style={tw('text-sm text-textMuted')}>Join SaukiGlobal for instant, stress-free VTU transactions</Text>
      </View>

      <View style={tw('mb-6')}>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Full Name"
              placeholder="e.g. John Doe"
              autoCapitalize="words"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.name?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Email Address"
              placeholder="e.g. john@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Phone Number"
              placeholder="e.g. 08012345678"
              keyboardType="phone-pad"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.phone?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Password"
              placeholder="Create secure password"
              secureTextEntry
              autoCapitalize="none"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.password?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Confirm Password"
              placeholder="Re-enter password"
              secureTextEntry
              autoCapitalize="none"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.confirmPassword?.message}
            />
          )}
        />

        {/* Custom 4-digit PIN */}
        <Controller
          control={control}
          name="transaction_pin"
          render={({ field: { onChange, value } }) => (
            <PinInput
              label="Set 4-Digit Transaction PIN"
              value={value}
              onChangeText={onChange}
              error={errors.transaction_pin?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="referral_code"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Referral Code (Optional)"
              placeholder="e.g. SAUKI10"
              autoCapitalize="characters"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.referral_code?.message}
            />
          )}
        />

        {/* KYC Virtual Account Provisioning Option */}
        <Controller
          control={control}
          name="kyc_type"
          render={({ field: { onChange, value } }) => (
            <Dropdown
              label="Instant Virtual Account Provisioning"
              value={value}
              placeholder="Choose Verification Method"
              options={kycOptions}
              onSelect={(opt) => onChange(opt.value)}
              error={errors.kyc_type?.message}
            />
          )}
        />

        {selectedKycType !== 'none' && (
          <Controller
            control={control}
            name="kyc_value"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={selectedKycType === 'nin' ? 'National ID Number (NIN)' : 'Bank Verification Number (BVN)'}
                placeholder="Enter 11-digit number"
                keyboardType="numeric"
                maxLength={11}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.kyc_value?.message}
              />
            )}
          />
        )}
      </View>

      <View style={tw('gap-4 mb-6')}>
        <Button
          title="Sign Up"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
        />

        <View style={tw('flex-row justify-center items-center py-2')}>
          <Text style={tw('text-sm text-textMuted mr-1')}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={tw('text-sm text-primary font-bold')}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default RegisterScreen;
