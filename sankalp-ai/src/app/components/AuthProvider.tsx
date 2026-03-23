"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface User {
  id: string;
  name: string;
  phone: string;
  role: "admin" | "citizen" | "field_officer";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  register: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("sankalp_token");
    const storedUser = localStorage.getItem("sankalp_user");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("sankalp_token");
        localStorage.removeItem("sankalp_user");
      }
    }
    setMounted(true);
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("sankalp_token", newToken);
    localStorage.setItem("sankalp_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const register = (newToken: string, newUser: User) => {
    login(newToken, newUser);
  };

  const logout = () => {
    localStorage.removeItem("sankalp_token");
    localStorage.removeItem("sankalp_user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, register, logout }}>
      {mounted ? children : <div style={{ visibility: "hidden" }}>{children}</div>}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
