"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/libs/api";
import { ROUTES } from "@/libs/constant";
import {
  decodeJwtPayload,
  getAccessToken,
  getRefreshToken,
  removeTokens,
  setAuthTokens,
} from "@/libs/helper";
import type { Session } from "@/types/user";

// Wire format of POST /auth/login and /auth/refresh (auth/dto/token-pair.dto.ts).
interface TokenPairResponse {
  accessToken: string;
  refreshToken: string;
  user: Session;
}

interface DecodedAccessToken {
  sub: string;
  email: string;
  role: Session["role"];
  exp: number; // unix seconds
}

function sessionFromAccessToken(token: string): Session | null {
  const decoded = decodeJwtPayload<DecodedAccessToken>(token);
  if (!decoded) return null;
  if (decoded.exp * 1000 <= Date.now()) return null; // expired
  return { id: decoded.sub, email: decoded.email, role: decoded.role };
}

interface LoginResult {
  ok: boolean;
  error?: string;
}

interface AuthContextValue {
  user: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: async () => ({ ok: false, error: "Auth not ready." }),
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

// Single in-flight refresh promise so concurrent 401s from multiple requests
// only trigger one /auth/refresh call instead of a stampede.
let refreshInFlight: Promise<Session | null> | null = null;

async function refreshSession(): Promise<Session | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const res = await apiPost<TokenPairResponse>(
    "/auth/refresh",
    { refreshToken },
    { skipAuth: true },
  );
  if (!res.data) return null;

  setAuthTokens(res.data.accessToken, res.data.refreshToken);
  return res.data.user;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(() => {
    // Best-effort: invalidate the refresh token server-side, but don't block
    // clearing local state on it (the user is leaving either way).
    void apiPost("/auth/logout", {});
    removeTokens();
    setUser(null);
    router.replace(ROUTES.LOGIN);
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    async function restore() {
      const token = getAccessToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const fromToken = sessionFromAccessToken(token);
      if (fromToken) {
        if (!cancelled) {
          setUser(fromToken);
          setLoading(false);
        }
        return;
      }

      // Access token missing/expired but a refresh token might still be valid.
      const refreshed = await refreshSession();
      if (!cancelled) {
        setUser(refreshed);
        setLoading(false);
      }
    }

    void restore();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleUnauthorized = async () => {
      if (!refreshInFlight) {
        refreshInFlight = refreshSession().finally(() => {
          refreshInFlight = null;
        });
      }
      const refreshed = await refreshInFlight;
      if (refreshed) {
        setUser(refreshed);
      } else {
        removeTokens();
        setUser(null);
        router.replace(ROUTES.LOGIN);
      }
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [router]);

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    const res = await apiPost<TokenPairResponse>(
      "/auth/login",
      { email, password },
      { skipAuth: true },
    );
    if (!res.data) {
      return { ok: false, error: res.error ?? "Unable to sign in." };
    }
    setAuthTokens(res.data.accessToken, res.data.refreshToken);
    setUser(res.data.user);
    return { ok: true };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
