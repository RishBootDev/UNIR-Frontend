import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./authContext";
import { clearAuth, readAuth, writeAuth } from "@/auth/authStorage";
import { getJwtExpiryMs, isJwtExpired, decodeJwtPayload } from "@/auth/jwt";
import { authService } from "@/services/api";

const USE_MOCK_AUTH =
  import.meta.env.DEV && String(import.meta.env.VITE_USE_MOCK_AUTH).toLowerCase() === "true";

const mockUser = {
  id: "1",
  name: "Alex Johnson",
  email: "alex@example.com",
  headline: "Senior Software Engineer at TechCorp",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  coverImage: "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&h=200&fit=crop",
  location: "San Francisco Bay Area",
  connections: 500,
};

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => readAuth());

  const accessToken = auth?.accessToken ?? null;
  const user = auth?.user ?? null;
  const isAuthenticated = Boolean(accessToken) && !isJwtExpired(accessToken);

  const logout = useCallback((reason) => {
    clearAuth();
    setAuth({ user: null, accessToken: null, refreshToken: null, reason });
  }, []);

  useEffect(() => {
    function onUnauthorized() {
      logout("unauthorized");
    }

    window.addEventListener("unir:unauthorized", onUnauthorized);
    return () => window.removeEventListener("unir:unauthorized", onUnauthorized);
  }, [logout]);

  useEffect(() => {
    if (!accessToken) return;

    const expMs = getJwtExpiryMs(accessToken);
    if (!expMs) return;

    const timeoutMs = expMs - Date.now() - 30_000; // logout 30s early
    if (timeoutMs <= 0) {
      const immediate = setTimeout(() => logout("token_expired"), 0);
      return () => clearTimeout(immediate);
    }

    const id = setTimeout(() => logout("token_expired"), timeoutMs);
    return () => clearTimeout(id);
  }, [accessToken, logout]);

  const login = useCallback(async (email, password) => {
    if (USE_MOCK_AUTH) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const nextUser = { ...mockUser, email };
      const nextAuth = { user: nextUser, accessToken: "dev-mock-token", refreshToken: null };
      writeAuth(nextAuth);
      setAuth(nextAuth);
      return;
    }

    const res = await authService.login(email, password);

    const accessTokenFromRes = res?.accessToken ?? res?.token ?? res?.jwt ?? res?.data?.accessToken ?? null;
    const refreshTokenFromRes = res?.refreshToken ?? res?.data?.refreshToken ?? null;
    const userFromRes = res?.user ?? res?.data?.user ?? null;

    if (!accessTokenFromRes) {
      throw new Error("Login succeeded but no access token was returned by the API.");
    }

    const nextAuth = {
      user: userFromRes,
      accessToken: accessTokenFromRes,
      refreshToken: refreshTokenFromRes,
    };

    writeAuth(nextAuth);
    setAuth(nextAuth);

    // If API doesn't return user, attempt to fetch it
    if (!userFromRes) {
      try {
        // const me = await authService.me();
        // const nextAuthWithUser = { ...nextAuth, user: me?.user ?? me ?? null };
        // writeAuth(nextAuthWithUser);
        // setAuth(nextAuthWithUser);
        throw new Error("Skipping /me call");
      } catch {
        // Fallback: try to decode user from token
        const payload = decodeJwtPayload(accessTokenFromRes);
        if (payload) {
             const fallbackUser = {
                 id: payload.sub || payload.id,
                 name: payload.name || payload.email || payload.sub,
                 email: payload.email || payload.sub
             };
             const nextAuthWithUser = { ...nextAuth, user: fallbackUser };
             writeAuth(nextAuthWithUser);
             setAuth(nextAuthWithUser);
        }
      }
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    // 1. Call signup endpoint
    const userDto = await authService.register(name, email, password);

    // 2. Signup successful (no error thrown).
    // The backend returns UserDto but NO token. We must login to get the token.
    await login(email, password);
    
    // 3. Update auth state with the UserDto we got from register
    // (since login likely couldn't fetch it if /me is missing)
    if (userDto) {
        const currentAuth = readAuth();
        const updatedAuth = { ...currentAuth, user: userDto };
        writeAuth(updatedAuth);
        setAuth(updatedAuth);
    }
  }, [login]);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated,
      login,
      logout,
      register,
    }),
    [user, accessToken, isAuthenticated, login, logout, register]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

