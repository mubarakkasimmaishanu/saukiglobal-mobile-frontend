// src/api/auth.ts
import apiClient from './apiClient';

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  transaction_pin: string; // 4-digit PIN
  referral_code?: string;
  kyc_type?: 'none' | 'nin' | 'bvn';
  nin?: string;
  bvn?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const registerUser = async (payload: RegisterPayload) => {
  const response = await apiClient.post('/auth.php?action=register', payload);
  return response.data;
};

export const loginUser = async (payload: LoginPayload) => {
  const response = await apiClient.post('/auth.php?action=login', payload);
  return response.data;
};

export const logoutUser = async () => {
  const response = await apiClient.get('/auth.php?action=logout');
  return response.data;
};

export const requestPasswordReset = async (email: string) => {
  const response = await apiClient.post('/auth.php?action=forgot_password', { email });
  return response.data;
};

export const verifyResetCode = async (email: string, code: string) => {
  const response = await apiClient.post('/auth.php?action=verify_reset_code', { email, code });
  return response.data;
};

export const resetPassword = async (email: string, code: string, password: string) => {
  const response = await apiClient.post('/auth.php?action=reset_password', { email, code, password });
  return response.data;
};
