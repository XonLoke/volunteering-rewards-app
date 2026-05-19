const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

let authToken = localStorage.getItem('auth_token');

export function setAuthToken(token) {
  authToken = token;
  if (token) localStorage.setItem('auth_token', token);
  else localStorage.removeItem('auth_token');
}

export async function apiGet(path, params = {}) {
  const url = new URL(`${API_BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== '') url.searchParams.set(k, v);
  });
  return apiFetch(url.toString(), 'GET');
}

export async function apiPost(path, body) {
  return apiFetch(`${API_BASE}${path}`, 'POST', body);
}

export async function apiPut(path, body) {
  return apiFetch(`${API_BASE}${path}`, 'PUT', body);
}

export async function apiDel(path) {
  return apiFetch(`${API_BASE}${path}`, 'DELETE');
}

async function apiFetch(url, method, body) {
  const headers = { 'Content-Type': 'application/json' };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json();

  if (!res.ok) {
    throw {
      code: json.error?.code || 'unknown',
      message: json.error?.message || 'Request failed',
      status: res.status,
    };
  }

  return json;
}

export async function apiLogin(email, password) {
  const res = await apiPost('/auth/login', { email, password });
  setAuthToken(res.token);
  return res;
}

export async function apiLogout() {
  setAuthToken(null);
}
