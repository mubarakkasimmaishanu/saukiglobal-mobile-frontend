# React Native Mobile Integration Guide for SaukiGlobal

This guide provides the official technical specifications, design patterns, and code implementations for integrating the **SaukiGlobal** unified API (`v1`) into a high-performance, premium React Native (Expo) mobile application.

---

## 🎨 1. Brand Guidelines & UI Palette

To match the premium, "bank-grade" look of the backend, the React Native application should follow these styling principles:

### Brand Theme
*   **Brand Name:** `SaukiGlobal`
*   **Motto:** `"Sauki in everything transaction"`
*   **Typography:** Modern Sans-Serif (use **Inter** or **Manrope** via Expo Google Fonts).

### Color System (Dark Emerald)
For Tailwind CSS (using `nativewind`) or StyleSheet objects, use these exact hex values:

| Token | Color | Hex Value | Purpose |
| :--- | :--- | :--- | :--- |
| `BgDark` | Dark Emerald Black | `#020d08` | Main screen background |
| `Surface` | Deep Forest Emerald | `#051a10` | Cards, input fields, dropdown containers |
| `Primary` | Emerald Accent | `#10b981` | Action buttons, active tabs, success indicators |
| `PrimaryDark`| Deep Emerald | `#065f46` | Secondary actions, button borders, pressed states |
| `TextHigh` | Zinc White | `#f4f4f5` | Headings, primary text labels |
| `TextMuted` | Zinc Gray | `#71717a` | Captions, secondary labels, placeholders |
| `Error` | Crimson Red | `#ef4444` | Badges for failed actions, alert text |
| `Warning` | Amber Orange | `#f59e0b` | Processing states, pending indicators |

---

## 🔒 2. Architecture & Request Setup

### 2.1 Storage & Session Persistence
Sensitive items (like the Bearer Token and User Profile) must be stored securely.
*   **iOS/Android Key Store:** Use `expo-secure-store` for the API Key.
*   **General Cache:** Use `@react-native-async-storage/async-storage` for non-sensitive data (e.g. cached data plans).

```typescript
// services/storage.ts
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'saukiglobal_user_token';
const USER_KEY = 'saukiglobal_user_profile';

export const storage = {
  async saveToken(token: string) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },
  async getToken() {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },
  async deleteToken() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
  async saveUser(user: any) {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  async getUser() {
    const user = await AsyncStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },
  async clearAll() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  }
};
```

### 2.2 Unified Axios API Client
Create a centralized HTTP client. It automatically:
1.  Injects the `Bearer <token>` authorization header if available.
2.  Forces JSON formatting.
3.  Intercepts `401 Unauthorized` errors to automatically trigger a logout redirect.

```typescript
// services/api.ts
import axios from 'axios';
import { storage } from './storage';

const BASE_URL = 'https://saukiglobal.com/api/v1'; // Update to local/staging URL for testing

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout
});

// Request Interceptor: Attach token if available
apiClient.interceptors.request.use(
  async (config) => {
    const token = await storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Catch errors and map standard format
apiClient.interceptors.response.use(
  (response) => {
    // Backend API can return { status: false, message: "..." } inside a 200 OK wrapper
    if (response.data && response.data.status === false) {
      return Promise.reject(new Error(response.data.message || 'API request failed'));
    }
    return response;
  },
  async (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      // Auto-logout if token is expired or invalid
      if (status === 401) {
        await storage.clearAll();
        // Redirect logic to login screen goes here (e.g. event emitter or navigation dispatch)
      }
      
      const message = data?.message || `Request failed with status ${status}`;
      return Promise.reject(new Error(message));
    }
    
    if (error.request) {
      return Promise.reject(new Error('Network error. Check your internet connection.'));
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## 👤 3. Authentication & Profile Integration

### 3.1 Registration
*   **Endpoint:** `POST /api/v1/auth.php?action=register`
*   **Note:** The system requires a `transaction_pin` (exactly 4 digits) at registration. If `bvn` or `nin` is provided, it auto-provisions PalmPay/Wema/Moniepoint virtual accounts during registration.

```typescript
// services/auth.ts
import apiClient from './api';

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  transaction_pin: string; // 4 digits
  referral_code?: string;
  kyc_type?: 'none' | 'nin' | 'bvn';
  nin?: string;
  bvn?: string;
}

export const registerUser = async (payload: RegisterPayload) => {
  const response = await apiClient.post('/auth.php?action=register', payload);
  return response.data; // Returns status, message, and data (token, user details)
};
```

### 3.2 Login & Session Load
*   **Endpoint:** `POST /api/v1/auth.php?action=login`
*   Upon login success, persist the `token` and fetch profile details.

```typescript
export const loginUser = async (email: string, password: md5OrPlainPassword) => {
  const response = await apiClient.post('/auth.php?action=login', { email, password });
  const { token, user } = response.data.data;
  
  // Persist local session
  await storage.saveToken(token);
  await storage.saveUser(user);
  
  return response.data;
};
```

### 3.3 Forgot Password (OTP Verification Workflow)
Follows a strict 3-stage validation process.

```typescript
// 1. Send Reset OTP
export const requestPasswordReset = async (email: string) => {
  const response = await apiClient.post('/auth.php?action=forgot_password', { email });
  return response.data;
};

// 2. Verify OTP
export const verifyResetOtp = async (email: string, code: string) => {
  const response = await apiClient.post('/auth.php?action=verify_reset_code', { email, code });
  return response.data;
};

// 3. Confirm Reset
export const confirmNewPassword = async (email: string, code: string, password: string) => {
  const response = await apiClient.post('/auth.php?action=reset_password', { email, code, password });
  return response.data;
};
```

---

## 📊 4. Dashboard Stats & Configuration

To load all dynamic details on the screen concurrently, aggregate these endpoint calls:

### 4.1 Get Dashboard Stats
*   **Endpoint:** `POST /api/v1/services.php?action=getDashboardStats`
*   Loads: Balance, referral commission, transaction aggregates, unread notifications count, and KYC verification tier.

### 4.2 Get Service Configurations (Gateways & Switches)
*   **Endpoint:** `POST /api/v1/services.php?action=getServiceConfigurations`
*   Loads: System toggles (e.g. `airtime_to_cash_enabled`, `nin_enabled`, minimum/maximum withdrawals, and contact support emails).

### 4.3 Get Active Virtual Accounts
*   **Endpoint:** `POST /api/v1/services.php?action=getVirtualAccounts`
*   Loads bank accounts assigned to the user for instant funding transfers.

```typescript
// services/dashboard.ts
import apiClient from './api';

export const fetchDashboardData = async () => {
  const [stats, configs, accounts] = await Promise.all([
    apiClient.post('/services.php?action=getDashboardStats'),
    apiClient.post('/services.php?action=getServiceConfigurations'),
    apiClient.post('/services.php?action=getVirtualAccounts'),
  ]);
  
  return {
    stats: stats.data.data,
    configs: configs.data.data,
    accounts: accounts.data,
  };
};
```

---

## 📱 5. VTU & Financial Service Transactions

All actions that debit the user's wallet require the **Transaction PIN** and route to a single unified dispatcher endpoint.

### 5.1 Service Mapping Table

| Service Type (`type`) | Payload Parameters | Description |
| :--- | :--- | :--- |
| **`airtime`** | `{ network: number, amount: number, phone: string, networktype: 'VTU', pin: string }` | Airtime purchase |
| **`data`** | `{ network: number, plan: number, phone: string, pin: string }` | Data purchase |
| **`bills`** (Cable) | `{ type: 'cable', provider: string, customer_id: string, amount: number, plan: string, pin: string }` | Cable TV Subscription |
| **`bills`** (Power) | `{ type: 'electricity', provider: string, customer_id: string, amount: number, pin: string }` | Electricity Meter Token |
| **`exam`** | `{ provider: number, quantity: number, pin: string }` | WAEC/NECO pins generation |
| **`cac`** | `{ company_name: string, email: string, phone: string, details: string, pin: string }` | Business incorporation |
| **`verification`** | `{ verification_type: string, id_number: string, pin: string }` | KYC checks (NIN, BVN) |

```typescript
// services/transactions.ts
import apiClient from './api';

export interface ServiceTransactionRequest {
  type: 'airtime' | 'data' | 'bills' | 'exam' | 'cac' | 'verification' | 'alpha' | 'kirani' | 'smile' | 'a2c' | 'intl' | 'esim';
  payload: {
    pin: string; // Enforced for secure dispatcher actions
    [key: string]: any;
  };
}

export const executeServiceTransaction = async ({ type, payload }: ServiceTransactionRequest) => {
  const response = await apiClient.post(`/services.php?type=${type}`, payload);
  return response.data; // returns status: true, message, reference (optional)
};
```

### 5.2 Dynamic Form Configuration Lookups
Use these requests to populate dropdown menus:

*   **Airtime Networks:** `POST /api/v1/services.php?action=getAirtimeNetworks`
*   **Data Plans:** `POST /api/v1/services.php?action=getDataPlans` (Body: `{ network_id: number }`)
*   **Cable Providers:** `POST /api/v1/services.php?action=getCableProviders`
*   **Cable Plans:** `POST /api/v1/services.php?action=getCablePlans` (Body: `{ provider_id: string }`)
*   **Electricity Providers:** `POST /api/v1/services.php?action=getElectricityProviders`
*   **Exam Card Providers:** `POST /api/v1/services.php?action=getExamProviders`

```typescript
// Example: Get data plans for dynamic dropdowns
export const getDataPlans = async (networkId: number) => {
  const response = await apiClient.post('/services.php?action=getDataPlans', { network_id: networkId });
  return response.data.data;
};
```

### 5.3 Background Processing Verification (Polling)
For services that are processed asynchronously (like eSIM profile generation or identity check verifications), use the polling status endpoint:

```typescript
// Poll transaction status
export const checkTransactionStatus = async (reference: string) => {
  const response = await apiClient.get(`/verify.php?reference=${reference}`);
  return response.data.data; // Returns: status (e.g. 'success', 'pending', 'failed')
};
```

---

## 💳 6. Wallet Funding

The mobile app must support two funding strategies:
1.  **Bank Transfer:** Guide the user to copy active account numbers retrieved via `getVirtualAccounts`.
2.  **Online Payment Gateway Checkout:** Complete payments using standard web gateways.

*   **Endpoint:** `POST /api/v1/fund.php`
*   **Body:** `{ amount: number, gateway: 'paystack' | 'korapay' | 'monnify' }`

```typescript
// services/funding.ts
import apiClient from './api';

export const initializePayment = async (amount: number, gateway: 'paystack' | 'korapay' | 'monnify') => {
  const response = await apiClient.post('/fund.php', { amount, gateway });
  return response.data.data; // returns { checkout_url, reference, gateway }
};
```

### Mobile UX Workflow for Web Checkout:
1.  Request checkout parameters via `initializePayment`.
2.  Open the returned `checkout_url` inside an in-app browser overlay using `expo-web-browser` or `react-native-webview`.
3.  Listen to the WebView url callbacks. When it redirects to a success status URL page or the user closes the WebView, run a transaction verification check using `/verify.php?reference=TXN_ID`.
4.  If successful, reload the wallet context on the Dashboard.

---

## 🔐 7. Security & PIN Management Endpoints

All actions require standard API header validation.

### 7.1 Set/Change PIN
For account security, transaction PINs are locked by the backend if too many failed attempts occur.

```typescript
// Set Transaction PIN (if not set before)
export const setTransactionPin = async (password: string, newPin: string) => {
  const response = await apiClient.post('/services.php?action=set_pin', { password, newPin });
  return response.data;
};

// Change Existing PIN
export const changeTransactionPin = async (currentPin: string, newPin: string) => {
  const response = await apiClient.post('/services.php?action=change_pin', { currentPin, newPin });
  return response.data;
};

// Toggle PIN on/off globally (requires validation PIN)
export const togglePinRequirement = async (pin: string) => {
  const response = await apiClient.post('/services.php?action=toggle_pin', { pin });
  return response.data; // returns { sPinStatus: 0 | 1 }
};
```

### 7.2 Forgot Transaction PIN
*   **Endpoint:** `POST /api/v1/services.php?action=forgot_pin`
*   **Behavior:** The server generates a random 4-digit PIN, updates it in the DB, and emails it directly to the user.

```typescript
export const forgotTransactionPin = async () => {
  const response = await apiClient.post('/services.php?action=forgot_pin');
  return response.data; // returns: "A new PIN has been sent to your registered email address."
};
```

---

## 📝 8. Best Practices for Mobile Developers

1.  **Atomic Deduplication:** Prevent double-spending by disabling input/submit buttons immediately after a press during transactional API calls (`type=data`, `type=airtime`).
2.  **Strict 4-Digit UI Validation:** Enforce that the PIN field must contain exactly 4 numeric digits before allowing transmission.
3.  **Local Storage Profile Sync:** Sync the local cached wallet balance context on every successful VTU dispatcher call response to ensure that UI reflects the live balance immediately without requiring a full page refresh.
4.  **Graceful Offline Mode:** Wrap API calls in network state listeners using `@react-native-community/netinfo` to alert the user before requests fail due to missing cellular connections.
