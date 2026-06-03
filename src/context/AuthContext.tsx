// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { storage } from '../services/storage';
import { loginUser, registerUser, logoutUser, RegisterPayload } from '../api/auth';
import { getUserProfile } from '../api/services';
import { setOnUnauthorized } from '../api/apiClient';

interface AuthContextType {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (payload: RegisterPayload) => Promise<any>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize: Load token and user from local storage
  const initializeAuth = async () => {
    try {
      const storedToken = await storage.getToken();
      const storedUser = await storage.getUser();
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      }
    } catch (e) {
      console.error('Failed to load session details', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();
    
    // Bind global apiClient 401 interceptor trigger
    setOnUnauthorized(() => {
      setUser(null);
      setToken(null);
    });
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await loginUser({ email, password });
      console.log('[AuthContext] Login API Response:', response);
      if (response.status && response.data) {
        const { token: userToken, user: userProfile } = response.data;
        console.log('[AuthContext] Saving token:', userToken);
        console.log('[AuthContext] Saving profile:', userProfile);
        await storage.saveToken(userToken);
        await storage.saveUser(userProfile);
        setToken(userToken);
        setUser(userProfile);
        // Async update from profile endpoint to sync extra details (balance, virtual accounts)
        setTimeout(() => refreshProfile(), 200);
      } else {
        console.warn('[AuthContext] Login response status or data field missing:', response);
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true);
    try {
      const response = await registerUser(payload);
      if (response.status && response.data) {
        const { token: userToken, user: userProfile } = response.data;
        await storage.saveToken(userToken);
        await storage.saveUser(userProfile);
        setToken(userToken);
        setUser(userProfile);
        setTimeout(() => refreshProfile(), 200);
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutUser().catch(() => {}); // Attempt API logout
    } finally {
      await storage.clearAll();
      setUser(null);
      setToken(null);
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    try {
      const activeToken = await storage.getToken();
      console.log('[AuthContext] Refreshing profile. Token in storage:', activeToken);
      const response = await getUserProfile();
      console.log('[AuthContext] Get Profile Response:', response);
      if (response.status && response.data) {
        const updatedUser = response.data;
        // Merge with existing user details (to preserve things like virtual accounts returned at registration)
        const mergedUser = { ...(user || {}), ...updatedUser };
        await storage.saveUser(mergedUser);
        setUser(mergedUser);
      }
    } catch (e) {
      console.error('[AuthContext] Failed to sync profile details', e);
    }
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
