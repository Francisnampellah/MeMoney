import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from './authService';
import { useAuth } from './useAuth';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string;
  login: (emailOrPhone: string, password: string) => Promise<User>;
  register: (fullName: string, email: string, phone: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, loading, error, login, register, logout, checkCurrentUser } = useAuth();

  useEffect(() => {
    // Check if user is already logged in on app start
    checkCurrentUser();
  }, []);

  const value: AuthContextType = {
    user,
    isLoggedIn: !!user,
    isLoading: loading,
    error,
    login,
    register,
    logout,
    checkAuth: checkCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
