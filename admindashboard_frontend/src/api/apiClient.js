const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const DEFAULT_EMAIL = import.meta.env.VITE_API_EMAIL || "hr@southpoint.edu";
const DEFAULT_PASSWORD = import.meta.env.VITE_API_PASSWORD || "Admin@123";

// Helper to get access token from localStorage, or fallback to .env VITE_API_ACCESS_TOKEN
function getAccessToken() {
  return localStorage.getItem("api_access_token") || import.meta.env.VITE_API_ACCESS_TOKEN;
}

// Helper to save token
function setAccessToken(token) {
  if (token) {
    localStorage.setItem("api_access_token", token);
  }
}

// Perform login to fetch a new token
async function performLogin() {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: DEFAULT_EMAIL, password: DEFAULT_PASSWORD }),
    });
    if (!res.ok) {
      throw new Error(`Auth failed: ${res.statusText}`);
    }
    const data = await res.json();
    if (data.access) {
      setAccessToken(data.access);
      return data.access;
    }
  } catch (error) {
    console.error("Auto-login failed:", error);
  }
  return null;
}

// Custom request wrapper
export async function apiRequest(endpoint, options = {}) {
  let token = getAccessToken();
  
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  // If 401 Unauthorized, token might be expired. Try auto-logging in once.
  if (res.status === 401) {
    console.warn("API 401 Unauthorized received. Attempting auto-login...");
    const newToken = await performLogin();
    if (newToken) {
      // Retry request with the new token
      headers["Authorization"] = `Bearer ${newToken}`;
      const retryRes = await fetch(endpoint, {
        ...options,
        headers,
      });
      return retryRes;
    }
  }

  return res;
}
