const AUTH_STORAGE_KEY = "unir.auth.v1";

function safeJsonParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function normalizeAuth(raw) {
  if (!raw || typeof raw !== "object") return { user: null, accessToken: null, refreshToken: null };

  // Backwards compatibility: older versions stored { user } only.
  const user = raw.user ?? null;
  const accessToken = raw.accessToken ?? raw.token ?? raw.jwt ?? null;
  const refreshToken = raw.refreshToken ?? null;

  return { user, accessToken, refreshToken };
}

export function readAuth() {
  if (typeof window === "undefined") return { user: null, accessToken: null, refreshToken: null };

  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return normalizeAuth(raw ? safeJsonParse(raw) : null);
  } catch {
    return { user: null, accessToken: null, refreshToken: null };
  }
}

export function writeAuth(nextAuth) {
  if (typeof window === "undefined") return;

  const normalized = normalizeAuth(nextAuth);
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(normalized));
  } catch {
    // ignore
  }
}

export function clearAuth() {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function getAccessToken() {
  return readAuth().accessToken;
}

