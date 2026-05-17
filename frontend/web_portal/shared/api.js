/**
 * Shared API Helper for Web Portal pages.
 * Provides apiGet, apiPost, apiPut, apiDel with auto token management.
 * Call initApi() on login to store the JWT.
 */

const TOKEN_KEY = "admin_token";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function getBaseUrl() {
  return localStorage.getItem("api_base_url") || "/api";
}

async function apiGet(path, params) {
  const token = getToken();
  if (!token) {
    window.location.href = "/web_portal/admin/login.html";
    throw new Error("Not authenticated");
  }

  let url = getBaseUrl() + path;
  if (params) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") qs.append(k, v);
    });
    const qstr = qs.toString();
    if (qstr) url += "?" + qstr;
  }

  const res = await fetch(url, {
    headers: { Authorization: "Bearer " + token },
  });

  if (res.status === 401) {
    clearToken();
    window.location.href = "/web_portal/admin/login.html";
    throw new Error("Session expired");
  }

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    const msg = json?.error?.message || "Request failed";
    throw new Error(msg);
  }

  return res.json();
}

async function apiPost(path, body) {
  const token = getToken();
  if (!token) {
    window.location.href = "/web_portal/admin/login.html";
    throw new Error("Not authenticated");
  }

  const res = await fetch(getBaseUrl() + path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(body),
  });

  if (res.status === 401) {
    clearToken();
    window.location.href = "/web_portal/admin/login.html";
    throw new Error("Session expired");
  }

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    const msg = json?.error?.message || "Request failed";
    throw new Error(msg);
  }

  return res.json();
}

async function apiPut(path, body) {
  const token = getToken();
  if (!token) {
    window.location.href = "/web_portal/admin/login.html";
    throw new Error("Not authenticated");
  }

  const res = await fetch(getBaseUrl() + path, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(body),
  });

  if (res.status === 401) {
    clearToken();
    window.location.href = "/web_portal/admin/login.html";
    throw new Error("Session expired");
  }

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    const msg = json?.error?.message || "Request failed";
    throw new Error(msg);
  }

  return res.json();
}

async function apiDel(path) {
  const token = getToken();
  if (!token) {
    window.location.href = "/web_portal/admin/login.html";
    throw new Error("Not authenticated");
  }

  const res = await fetch(getBaseUrl() + path, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + token },
  });

  if (res.status === 401) {
    clearToken();
    window.location.href = "/web_portal/admin/login.html";
    throw new Error("Session expired");
  }

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    const msg = json?.error?.message || "Request failed";
    throw new Error(msg);
  }

  return res.json();
}
