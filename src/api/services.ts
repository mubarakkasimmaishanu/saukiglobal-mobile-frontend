// src/api/services.ts
import apiClient from './apiClient';

// Core Response Interface
export interface ApiResponse<T = any> {
  status: boolean;
  message: string;
  data: T;
}

// Request & Response Interfaces
export interface DashboardStats {
  wallet: {
    balance: number;
    referral_commission: number;
  };
  transactions: {
    success: number;
    pending: number;
    failed: number;
  };
  notifications_count: number;
  kyc_status: 'verified' | 'unverified';
  tier: string;
}

export interface ServiceConfig {
  [key: string]: string | number | boolean;
}

export interface VirtualAccount {
  bank_name: string;
  account_number: string;
  account_name: string;
  bank_code: string;
  provider: string;
  status: string;
}

export interface AirtimeNetwork {
  id: number;
  network: string;
  networkStatus: string;
}

export interface DataPlan {
  id: number;
  name: string;
  price: number;
  userprice: number;
  agentprice: number;
  vendorprice: number;
  type: string;
  network_id: number;
}

export interface CableProvider {
  id: number;
  name: string;
  status: string;
}

export interface CablePlan {
  id: number;
  name: string;
  price: number;
}

export interface ElectricityProvider {
  id: number;
  name: string;
  abbreviation: string;
  status: string;
}

export interface ExamProvider {
  id: number;
  name: string;
  examid: string;
  price: number;
  status: string;
}

export interface TransactionItem {
  id: string;
  type: string;
  amount: number;
  status: 'Success' | 'Pending' | 'Failed';
  date: string;
  details: string;
}

// ----------------- API Methods -----------------

// Fetch Combined Dashboard Stats
export const getDashboardStats = async (): Promise<ApiResponse<DashboardStats>> => {
  const res = await apiClient.post('/services.php?action=getDashboardStats');
  return res.data;
};

// Fetch Service Configurations
export const getServiceConfigurations = async (): Promise<ApiResponse<ServiceConfig>> => {
  const res = await apiClient.post('/services.php?action=getServiceConfigurations');
  return res.data;
};

// Fetch User Profile details
export const getUserProfile = async (): Promise<ApiResponse> => {
  const res = await apiClient.post('/services.php?action=getUser');
  return res.data;
};

// Fetch Virtual Bank accounts list
export const getVirtualAccounts = async (): Promise<ApiResponse<VirtualAccount[]>> => {
  const res = await apiClient.post('/services.php?action=getVirtualAccounts');
  return res.data;
};

// Create PayVessel Virtual Account
export const createVirtualAccount = async (bvn?: string, nin?: string): Promise<ApiResponse> => {
  const res = await apiClient.post('/services.php?action=createVirtualAccount', { bvn, nin });
  return res.data;
};

// Dropdown Loader: Airtime Networks
export const getAirtimeNetworks = async (): Promise<ApiResponse<AirtimeNetwork[]>> => {
  const res = await apiClient.post('/services.php?action=getAirtimeNetworks');
  return res.data;
};

// Dropdown Loader: Data Plans
export const getDataPlans = async (networkId: number): Promise<ApiResponse<DataPlan[]>> => {
  const res = await apiClient.post('/services.php?action=getDataPlans', { network_id: networkId });
  return res.data;
};

// Dropdown Loader: Cable Providers
export const getCableProviders = async (): Promise<ApiResponse<CableProvider[]>> => {
  const res = await apiClient.post('/services.php?action=getCableProviders');
  return res.data;
};

// Dropdown Loader: Cable Plans
export const getCablePlans = async (providerId: string): Promise<ApiResponse<CablePlan[]>> => {
  const res = await apiClient.post('/services.php?action=getCablePlans', { provider_id: providerId });
  return res.data;
};

// Dropdown Loader: Electricity Providers
export const getElectricityProviders = async (): Promise<ApiResponse<ElectricityProvider[]>> => {
  const res = await apiClient.post('/services.php?action=getElectricityProviders');
  return res.data;
};

// Dropdown Loader: Exam Card Providers
export const getExamProviders = async (): Promise<ApiResponse<ExamProvider[]>> => {
  const res = await apiClient.post('/services.php?action=getExamProviders');
  return res.data;
};

// Paginated Transactions Ledger
export interface GetTransactionsPayload {
  limit?: number;
  offset?: number;
  type?: string;
  status?: string;
}

export const getTransactions = async (payload: GetTransactionsPayload): Promise<ApiResponse<TransactionItem[]>> => {
  const res = await apiClient.post('/services.php?action=getTransactions', payload);
  return res.data;
};

// Verify/Poll transaction status
export const verifyTransaction = async (reference: string): Promise<ApiResponse> => {
  const res = await apiClient.get(`/verify.php?reference=${reference}`);
  return res.data;
};

// Initialize Funding online payment
export interface FundPayload {
  amount: number;
  gateway: 'paystack' | 'korapay' | 'monnify';
}

export interface FundResponse {
  checkout_url: string;
  reference: string;
  gateway: string;
}

export const initializePayment = async (payload: FundPayload): Promise<ApiResponse<FundResponse>> => {
  const res = await apiClient.post('/fund.php', payload);
  return res.data;
};

// Execute VTU & Financial purchase dispatchers
export interface DispatchPayload {
  pin: string; // Enforced
  [key: string]: any;
}

export const executeServiceTransaction = async (type: string, payload: DispatchPayload): Promise<ApiResponse> => {
  const res = await apiClient.post(`/services.php?type=${type}`, payload);
  return res.data;
};

// Account Settings actions
export const changePassword = async (payload: any): Promise<ApiResponse> => {
  const res = await apiClient.post('/services.php?action=change_password', payload);
  return res.data;
};

export const updateProfile = async (payload: any): Promise<ApiResponse> => {
  const res = await apiClient.post('/services.php?action=update_profile', payload);
  return res.data;
};

// Wallet transfer & Tier upgrade actions
export const walletTransfer = async (payload: { amount: number; recipient: string; pin: string }): Promise<ApiResponse> => {
  const res = await apiClient.post('/services.php?action=transfer', payload);
  return res.data;
};

export const upgradeTier = async (): Promise<ApiResponse> => {
  const res = await apiClient.post('/services.php?action=upgrade_tier');
  return res.data;
};

// PIN Security actions
export const setTransactionPin = async (payload: { password: string; newPin: string }): Promise<ApiResponse> => {
  const res = await apiClient.post('/services.php?action=set_pin', payload);
  return res.data;
};

export const changeTransactionPin = async (payload: { currentPin: string; newPin: string }): Promise<ApiResponse> => {
  const res = await apiClient.post('/services.php?action=change_pin', payload);
  return res.data;
};

export const toggleTransactionPin = async (payload: { pin: string }): Promise<ApiResponse> => {
  const res = await apiClient.post('/services.php?action=toggle_pin', payload);
  return res.data;
};

export const forgotTransactionPin = async (): Promise<ApiResponse> => {
  const res = await apiClient.post('/services.php?action=forgot_pin');
  return res.data;
};
