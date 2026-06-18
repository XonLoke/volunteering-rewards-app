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
