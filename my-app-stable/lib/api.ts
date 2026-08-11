export const API_URL = "https://vol-rewards-api.onrender.com/api";

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function clearAccessToken() {
  accessToken = null;
}

async function apiRequest(path: string, options: RequestInit = {}) {
  const controller = new AbortController();

  // Give Render enough time to respond.
  const timeout = setTimeout(() => controller.abort(), 60000);

  const url = `${API_URL}${path}`;

  console.log("API request:", url);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : {}),
        ...(options.headers || {}),
      },
    });

    const responseText = await response.text();

    let data: any = {};

    if (responseText) {
      try {
        data = JSON.parse(responseText);
      } catch {
        data = {
          message: responseText,
        };
      }
    }

    if (!response.ok) {
      const errorMessage =
        typeof data === "string"
          ? data
          : typeof data?.error === "string"
            ? data.error
            : data?.error?.message ||
              data?.message ||
              data?.details ||
              `Request failed with status ${response.status}`;

      console.log("API error response:", {
        url,
        status: response.status,
        data,
      });

      throw new Error(errorMessage);
    }

    return data;
  } catch (error: any) {
    if (error?.name === "AbortError") {
      throw new Error(`Network request timed out. Cannot reach ${API_URL}`);
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export function apiGet(path: string) {
  return apiRequest(path, {
    method: "GET",
  });
}

export function apiPost(path: string, body?: unknown) {
  return apiRequest(path, {
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export function apiPut(path: string, body?: unknown) {
  return apiRequest(path, {
    method: "PUT",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export function apiDelete(path: string) {
  return apiRequest(path, {
    method: "DELETE",
  });
}
