'use client';
import { useState, useEffect } from 'react';

interface JwtPayload {
  sub: number;
  email: string;
  role: string;
  exp: number;
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem('access_token'));
    setMounted(true);
  }, []);

  let user: JwtPayload | null = null;
  if (token) {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload)) as JwtPayload;
      if (decoded.exp * 1000 > Date.now()) user = decoded;
    } catch {
      // invalid token
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
  };

  return {
    token: user ? token : null,
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    mounted,
    logout,
  };
}
