function base64UrlToBase64(base64Url) {
  // Convert base64url to base64
  let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  // Pad with '='
  const pad = base64.length % 4;
  if (pad) base64 += "=".repeat(4 - pad);
  return base64;
}

export function decodeJwtPayload(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const json = atob(base64UrlToBase64(parts[1]));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function isJwtExpired(token, leewaySeconds = 30) {
  const payload = decodeJwtPayload(token);
  const exp = payload?.exp;
  if (!exp || typeof exp !== "number") return false; // can't determine -> treat as non-expired
  const expMs = exp * 1000;
  return Date.now() >= expMs - leewaySeconds * 1000;
}

export function getJwtExpiryMs(token) {
  const payload = decodeJwtPayload(token);
  const exp = payload?.exp;
  if (!exp || typeof exp !== "number") return null;
  return exp * 1000;
}

