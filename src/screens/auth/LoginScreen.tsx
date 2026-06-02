// src/screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../context/AuthContext';
import tw from '../../utils/styles';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const res = await login(data.email, data.password);
      if (!res.status) {
        Alert.alert('Login Failed', res.message || 'Invalid email or password');
      }
    } catch (e: any) {
      Alert.alert('Login Error', e.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={tw('flex-grow bg-background justify-center p-6')}>
      <View style={tw('mb-8')}>
        <Text style={tw('text-3xl font-bold text-textHigh mb-2')}>Welcome Back</Text>
        <Text style={tw('text-base text-textMuted')}>Sign in to continue your transaction transactions</Text>
      </View>

      <View style={tw('mb-6')}>
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

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Password"
              placeholder="Enter password"
              secureTextEntry
              autoCapitalize="none"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.password?.message}
            />
          )}
        />

        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPassword')}
          style={tw('self-end py-1')}
        >
          <Text style={tw('text-sm text-primary font-medium')}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <View style={tw('gap-4')}>
        <Button
          title="Sign In"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
        />

        <View style={tw('flex-row justify-center items-center py-2')}>
          <Text style={tw('text-sm text-textMuted mr-1')}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={tw('text-sm text-primary font-bold')}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default LoginScreen;
