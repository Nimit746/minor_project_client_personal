"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getAccessToken, getRefreshToken, setTokens as saveTokens, clearTokens } from "@/services/api";
import { getMe } from "@/services/userService";
import { login as authLogin, register as authRegister } from "@/services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Always start with null/loading=true so SSR and first client render match
  const [tokens, setTokens] = useState({ access: null, refresh: null });
  const [loading, setLoading] = useState(true);

  // Initialize auth state on the client only (after hydration)
  useEffect(() => {
    const access = getAccessToken();
    const refresh = getRefreshToken();
    setTokens({ access, refresh });

    if (access) {
      getMe()
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          // Token invalid or refresh failed
          clearTokens();
          setTokens({ access: null, refresh: null });
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const tokenPair = await authLogin(email, password);
    saveTokens(tokenPair.access_token, tokenPair.refresh_token);
    setTokens({ access: tokenPair.access_token, refresh: tokenPair.refresh_token });
    const profile = await getMe();
    setUser(profile);
    return profile;
  }, []);

  const register = useCallback(async (payload) => {
    return await authRegister(payload);
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setTokens({ access: null, refresh: null });
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const profile = await getMe();
      setUser(profile);
      return profile;
    } catch {
      return null;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        isAuthenticated: !!tokens.access,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
