// src/services/storage.ts
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const TOKEN_KEY = 'saukiglobal_user_token';
const USER_KEY = 'saukiglobal_user_profile';

const isWeb = Platform.OS === 'web';

export const storage = {
  async saveToken(token: string): Promise<void> {
    try {
      if (isWeb) {
        await AsyncStorage.setItem(TOKEN_KEY, token);
      } else {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      }
    } catch (e) {
      console.error('Error saving token', e);
    }
  },

  async getToken(): Promise<string | null> {
    try {
      if (isWeb) {
        return await AsyncStorage.getItem(TOKEN_KEY);
      } else {
        return await SecureStore.getItemAsync(TOKEN_KEY);
      }
    } catch (e) {
      console.error('Error getting token', e);
      return null;
    }
  },

  async deleteToken(): Promise<void> {
    try {
      if (isWeb) {
        await AsyncStorage.removeItem(TOKEN_KEY);
      } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      }
    } catch (e) {
      console.error('Error deleting token', e);
    }
  },

  async saveUser(user: any): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Error saving user profile', e);
    }
  },

  async getUser(): Promise<any | null> {
    try {
      const user = await AsyncStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (e) {
      console.error('Error getting user profile', e);
      return null;
    }
  },

  async clearAll(): Promise<void> {
    try {
      if (isWeb) {
        await AsyncStorage.removeItem(TOKEN_KEY);
      } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      }
      await AsyncStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error('Error clearing storage', e);
    }
  }
};
