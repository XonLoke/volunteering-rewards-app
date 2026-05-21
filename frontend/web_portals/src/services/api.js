const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

let authToken = localStorage.getItem('auth_token');
let refreshToken = localStorage.getItem('refresh_token');
let isRefreshing = false;

export function setAuthToken(token) {
  authToken = token;
  if (token) localStorage.setItem('auth_token', token);
  else localStorage.removeItem('auth_token');
}

export function setRefreshToken(token) {
  refreshToken = token;
  if (token) localStorage.setItem('refresh_token', token);
  else localStorage.removeItem('refresh_token');
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

async function tryRefreshToken() {
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    setAuthToken(data.accessToken);
    if (data.refreshToken) setRefreshToken(data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

async function apiFetch(url, method, body) {
  const headers = { 'Content-Type': 'application/json' };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const json = await res.json();

  if (res.status === 401 && json.error?.code === 'token_expired' && refreshToken) {
    if (!isRefreshing) {
      isRefreshing = true;
      const refreshed = await tryRefreshToken();
      isRefreshing = false;
      if (refreshed) {
        headers['Authorization'] = `Bearer ${authToken}`;
        const retryRes = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
        const retryJson = await retryRes.json();
        if (!retryRes.ok) {
          throw { code: retryJson.error?.code || 'unknown', message: retryJson.error?.message || 'Request failed', status: retryRes.status };
        }
        return retryJson;
      }
    }
    setAuthToken(null);
    setRefreshToken(null);
  }

  if (!res.ok) {
    throw { code: json.error?.code || 'unknown', message: json.error?.message || 'Request failed', status: res.status };
  }

  return json;
}

export async function apiLogin(email, password) {
  const res = await apiPost('/auth/login', { email, password });
  setAuthToken(res.token);
  if (res.refresh_token) setRefreshToken(res.refresh_token);
  return res;
}

export async function apiLogout() {
  setAuthToken(null);
  setRefreshToken(null);
}
