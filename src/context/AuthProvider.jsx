import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./authContext";
import { clearAuth, readAuth, writeAuth } from "@/auth/authStorage";
import { getJwtExpiryMs, isJwtExpired, decodeJwtPayload } from "@/auth/jwt";
import { authService, profileService } from "@/services/api";

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
  const [profile, setProfile] = useState(null);

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

  useEffect(() => {
    if (isAuthenticated) {
      profileService.getProfile()
        .then(data => setProfile(data))
        .catch(err => console.error("Failed to fetch profile:", err));
    } else {
      setProfile(null);
    }
  }, [isAuthenticated]);

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
    let userFromRes = res?.user ?? res?.data?.user ?? null;

    if (!accessTokenFromRes) {
      throw new Error("Login succeeded but no access token was returned by the API.");
    }

    // Resolve user if missing from response
    if (!userFromRes) {
        const payload = decodeJwtPayload(accessTokenFromRes);
        if (payload) {
             userFromRes = {
                 id: payload.sub || payload.id,
                 name: payload.name || payload.email || payload.sub,
                 email: payload.email || payload.sub
             };
        }
    }

    const nextAuth = {
      user: userFromRes,
      accessToken: accessTokenFromRes,
      refreshToken: refreshTokenFromRes,
    };

    writeAuth(nextAuth);
    setAuth(nextAuth);
  }, []);

  const register = useCallback(async (name, email, password) => {
    // 1. Call signup
    const userDto = await authService.register(name, email, password);

    // 2. Immediately login to get the token
    const res = await authService.login(email, password);
    const accessTokenFromRes = res?.accessToken ?? res?.token ?? res?.jwt ?? res?.data?.accessToken ?? null;
    const refreshTokenFromRes = res?.refreshToken ?? res?.data?.refreshToken ?? null;
    
    if (!accessTokenFromRes) {
        throw new Error("Registration succeeded but login failed to return a token.");
    }

    // 3. Prefer the userDto from signup as it's the most complete
    let finalUser = userDto || res?.user || res?.data?.user;
    if (!finalUser) {
        const payload = decodeJwtPayload(accessTokenFromRes);
        if (payload) {
            finalUser = {
                id: payload.sub || payload.id,
                name: payload.name || payload.email || payload.sub,
                email: payload.email || payload.sub
            };
        }
    }

    const nextAuth = {
      user: finalUser,
      accessToken: accessTokenFromRes,
      refreshToken: refreshTokenFromRes,
    };

    writeAuth(nextAuth);
    setAuth(nextAuth);
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      accessToken,
      isAuthenticated,
      login,
      logout,
      register,
      refreshProfile: async () => {
        const data = await profileService.getProfile();
        setProfile(data);
        return data;
      }
    }),
    [user, profile, accessToken, isAuthenticated, login, logout, register]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

