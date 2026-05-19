import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Fallback in-memory store for web where SecureStore is unavailable
const memoryStore: Record<string, string> = {};

function isSecureStoreAvailable(): boolean {
  if (Platform.OS === 'web') return false;
  return true;
}

export async function getItem(key: string): Promise<string | null> {
  try {
    if (isSecureStoreAvailable()) {
      return await SecureStore.getItemAsync(key);
    }
    return memoryStore[key] ?? null;
  } catch (error) {
    console.warn(`SecureStore getItem failed for key "${key}":`, error);
    return memoryStore[key] ?? null;
  }
}

export async function setItem(key: string, value: string): Promise<void> {
  try {
    if (isSecureStoreAvailable()) {
      await SecureStore.setItemAsync(key, value);
    }
    memoryStore[key] = value;
  } catch (error) {
    console.warn(`SecureStore setItem failed for key "${key}":`, error);
    memoryStore[key] = value;
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    if (isSecureStoreAvailable()) {
      await SecureStore.deleteItemAsync(key);
    }
    delete memoryStore[key];
  } catch (error) {
    console.warn(`SecureStore removeItem failed for key "${key}":`, error);
    delete memoryStore[key];
  }
}

export async function getToken(): Promise<string | null> {
  return getItem(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  return setItem(TOKEN_KEY, token);
}

export async function getRefreshToken(): Promise<string | null> {
  return getItem(REFRESH_TOKEN_KEY);
}

export async function setRefreshToken(token: string): Promise<void> {
  return setItem(REFRESH_TOKEN_KEY, token);
}

export async function clearAuth(): Promise<void> {
  await removeItem(TOKEN_KEY);
  await removeItem(REFRESH_TOKEN_KEY);
}
