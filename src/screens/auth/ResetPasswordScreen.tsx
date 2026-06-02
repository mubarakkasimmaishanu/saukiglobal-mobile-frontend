// src/screens/auth/ResetPasswordScreen.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { resetPassword } from '../../api/auth';
import tw from '../../utils/styles';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export const ResetPasswordScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { email, code } = route.params || {};
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: FormData) => {
    if (!email || !code) {
      Alert.alert('Error', 'Missing session variables. Please restart flow.');
      return;
    }
    
    setLoading(true);
    try {
      const res = await resetPassword(email, code, data.password);
      if (res.status) {
        Alert.alert('Success', 'Password has been reset successfully.', [
          {
            text: 'Login Now',
            onPress: () => navigation.navigate('Login'),
          },
        ]);
      } else {
        Alert.alert('Failed', res.message || 'Could not reset password');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'An error occurred during password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={tw('flex-grow bg-background justify-center p-6')}>
      <View style={tw('mb-8')}>
        <Text style={tw('text-2xl font-bold text-textHigh mb-2')}>New Password</Text>
        <Text style={tw('text-sm text-textMuted')}>Create a new secure password for your account.</Text>
      </View>

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="New Password"
            placeholder="Enter new password"
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
            label="Confirm New Password"
            placeholder="Confirm new password"
            secureTextEntry
            autoCapitalize="none"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={errors.confirmPassword?.message}
          />
        )}
      />

      <Button
        title="Reset Password"
        onPress={handleSubmit(onSubmit)}
        loading={loading}
        style={tw('mt-4')}
      />
    </ScrollView>
  );
};

export default ResetPasswordScreen;
