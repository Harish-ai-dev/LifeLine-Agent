'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export type Role = 'blood_donor' | 'hospital_staff' | 'government_authority';

export interface UserProfile {
  id: string;
  username: string;
  role: Role;
  facility_id?: string;
  facility_name?: string;
}

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (role: Role, username: string, facility_id?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    user: null,
    isAuthenticated: false,
  });
  const router = useRouter();

  // Load from local storage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('lifeline_token');
    const savedUser = localStorage.getItem('lifeline_user');
    if (savedToken && savedUser) {
      setAuthState({
        token: savedToken,
        user: JSON.parse(savedUser),
        isAuthenticated: true,
      });
    }
  }, []);

  const login = (role: Role, username: string, facility_id?: string) => {
    // Mock Token format: lifeline_mock_<role>_<uid>
    const uid = Math.floor(Math.random() * 10000);
    const token = `lifeline_mock_${role}_usr_${uid}`;
    
    const user: UserProfile = {
      id: `usr_${uid}`,
      username,
      role,
      facility_id,
      facility_name: facility_id ? `Facility ${facility_id}` : undefined,
    };

    localStorage.setItem('lifeline_token', token);
    localStorage.setItem('lifeline_user', JSON.stringify(user));

    setAuthState({
      token,
      user,
      isAuthenticated: true,
    });

    // Role-based routing
    if (role === 'blood_donor') router.push('/donor');
    else if (role === 'hospital_staff') router.push('/hospital');
    else if (role === 'government_authority') router.push('/government');
  };

  const logout = () => {
    localStorage.removeItem('lifeline_token');
    localStorage.removeItem('lifeline_user');
    setAuthState({ token: null, user: null, isAuthenticated: false });
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
