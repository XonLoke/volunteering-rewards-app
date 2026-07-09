// Production backend API
export const API_URL = "https://vol-rewards-api.onrender.com";

// JWT token management
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

async function handleResponse(res: Response) {
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message || data.message || "Something went wrong");
  }

  return data;
}

function getHeaders(hasBody?: boolean): Record<string, string> {
  const headers: Record<string, string> = {};
  if (hasBody) headers["Content-Type"] = "application/json";
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
  return headers;
}

export async function apiGet(path: string) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: getHeaders(),
  });
  return handleResponse(res);
}

export async function apiPost(path: string, body?: any) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: getHeaders(true),
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse(res);
}

export async function apiPut(path: string, body?: any) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "PUT",
    headers: getHeaders(true),
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse(res);
}

export async function apiDelete(path: string) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return handleResponse(res);
}
