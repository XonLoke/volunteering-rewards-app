/**
 * Shared API helper for the mobile app.
 *
 * Automatically attaches JWT Bearer token from AsyncStorage
 * to all requests. Provides typed helpers for GET, POST, PUT, DELETE.
 *
 * Usage:
 *   import { apiGet, apiPost } from '../api';
 *   const data = await apiGet('/events');
 *   await apiPost('/events/5/register');
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://vol-rewards-api.onrender.com/api";

// ─── Token helpers ───────────────────────────────────────────────

async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem("token");
  } catch {
    return null;
  }
}

// ─── Generic request builder ─────────────────────────────────────

interface ApiError {
  code?: string;
  message?: string;
}

async function request<T = any>(
  method: string,
  path: string,
  body?: Record<string, any>,
  opts?: { isFormData?: boolean }
): Promise<T> {
  const token = await getToken();

  const headers: Record<string, string> = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (!opts?.isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body
      ? opts?.isFormData
        ? (body as any)
        : JSON.stringify(body)
      : undefined,
  });

  // Handle 204 No Content
  if (res.status === 204) {
    return {} as T;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errMsg =
      data.error?.message || data.message || `Request failed (${res.status})`;
    throw new Error(errMsg);
  }

  return data as T;
}

// ─── Public helpers ──────────────────────────────────────────────

export async function apiGet<T = any>(path: string): Promise<T> {
  return request<T>("GET", path);
}

export async function apiPost<T = any>(
  path: string,
  body?: Record<string, any>
): Promise<T> {
  return request<T>("POST", path, body);
}

export async function apiPut<T = any>(
  path: string,
  body?: Record<string, any>
): Promise<T> {
  return request<T>("PUT", path, body);
}

export async function apiDelete<T = any>(
  path: string,
  body?: Record<string, any>
): Promise<T> {
  return request<T>("DELETE", path, body);
}

/**
 * Authenticated fetch wrapper — attaches JWT Bearer token automatically.
 * Use this in any file that needs to call the API with authentication.
 */
export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(url, { ...options, headers });
}

/**
 * Upload FormData (e.g. avatar image).
 * The caller builds the FormData — this just attaches the token header.
 */
export async function apiUpload<T = any>(
  path: string,
  formData: FormData
): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  // Do NOT set Content-Type for FormData — fetch sets it automatically with boundary

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errMsg =
      data.error?.message || data.message || `Upload failed (${res.status})`;
    throw new Error(errMsg);
  }

  return data as T;
}

// ─── Cross-platform dialog helpers (PWA-safe) ────────────────────

import { Alert, Platform } from "react-native";

const isWeb = Platform.OS === "web";

/**
 * Confirmation dialog — works on both web (window.confirm) and native (Alert).
 */
export function confirmAndAct(
  title: string,
  message: string,
  onConfirm: () => void
): void {
  if (isWeb && typeof window !== "undefined") {
    if (window.confirm(`${title}\n${message}`)) onConfirm();
  } else {
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" as const },
      { text: "OK", onPress: onConfirm },
    ]);
  }
}

/**
 * Action sheet with multiple options — works in PWA using prompt() fallback.
 */
export function actionSheet(
  title: string,
  message: string,
  options: { label: string; onPress: () => void }[]
): void {
  if (isWeb && typeof window !== "undefined") {
    const lines = options.map((o, i) => `${i + 1}. ${o.label}`).join("\n");
    const choice = prompt(
      `${title}\n${message}\n\n${lines}\n\nEnter 1-${options.length}:`
    );
    if (choice) {
      const idx = parseInt(choice, 10) - 1;
      if (idx >= 0 && idx < options.length) options[idx].onPress();
    }
  } else {
    Alert.alert(title, message, [
      ...options.map((o) => ({ text: o.label, onPress: o.onPress })),
      { text: "Cancel", style: "cancel" as const },
    ]);
  }
}
