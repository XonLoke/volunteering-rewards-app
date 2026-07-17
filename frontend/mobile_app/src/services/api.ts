const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

let authToken: string | null = null;
let onTokenExpired: (() => Promise<string | null>) | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function setOnTokenExpired(handler: (() => Promise<string | null>) | null) {
  onTokenExpired = handler;
}

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  let res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Attempt automatic token refresh on 401
  if (res.status === 401 && onTokenExpired) {
    const newToken = await onTokenExpired();
    if (newToken) {
      authToken = newToken;
      headers['Authorization'] = `Bearer ${authToken}`;
      res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    }
  }

  let json: any;
  try {
    json = await res.json();
  } catch {
    json = {};
  }

  if (!res.ok) {
    throw new ApiError(
      json?.error?.message || `Request failed with status ${res.status}`,
      json?.error?.code || 'unknown_error',
      res.status,
    );
  }

  return json as T;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  del: <T>(path: string) => request<T>('DELETE', path),
};
