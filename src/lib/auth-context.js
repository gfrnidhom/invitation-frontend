'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth as authApi } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('auth_user');
      }
      
      // Silent background refresh to get latest dynamic properties (quota, subscription)
      authApi.user().then((res) => {
        const authUser = res.user || res.data || res;
        localStorage.setItem('auth_user', JSON.stringify(authUser));
        setUser(authUser);
      }).catch(() => {});
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password });
    const authToken = res.token || res.data?.token;
    const authUser = res.user || res.data?.user;
    localStorage.setItem('auth_token', authToken);
    localStorage.setItem('auth_user', JSON.stringify(authUser));
    setToken(authToken);
    setUser(authUser);
    return res;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authApi.register(data);
    const authToken = res.token || res.data?.token;
    const authUser = res.user || res.data?.user;
    localStorage.setItem('auth_token', authToken);
    localStorage.setItem('auth_user', JSON.stringify(authUser));
    setToken(authToken);
    setUser(authUser);
    return res;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await authApi.user();
      const authUser = res.user || res.data || res;
      localStorage.setItem('auth_user', JSON.stringify(authUser));
      setUser(authUser);
    } catch {
      // ignore
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
