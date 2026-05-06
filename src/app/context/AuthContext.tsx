import React, { createContext, useContext, useState } from 'react';

console.log('🔥 AuthContext v7.04.01 LOADING');

interface AuthContextType {
  isAuthenticated: boolean;
  user: { id: string; email: string; name: string } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => boolean;
  isLoading: boolean;
}

const defaultAuthContext: AuthContextType = {
  isAuthenticated: true,
  user: { id: 'dev-user-001', email: 'dev@caresolis.com', name: 'Developer' },
  login: async () => {},
  logout: () => {},
  checkAuth: () => true,
  isLoading: false
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  console.log('🔥 AuthProvider RENDERING');
  
  const [isAuthenticated] = useState(true);
  const [user] = useState<{ id: string; email: string; name: string } | null>({ 
    id: 'dev-user-001',
    email: 'dev@caresolis.com', 
    name: 'Developer' 
  });
  const [isLoading] = useState(false);

  const login = async (email: string, password: string) => {
    console.log('✅ Auto-login (dev mode):', email);
  };

  const logout = () => {
    console.log('✅ Logout (dev mode)');
  };

  const checkAuth = () => {
    return true;
  };

  console.log('🔥 AuthProvider returning children');

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, checkAuth, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    console.warn('⚠️ useAuth used outside AuthProvider');
    return defaultAuthContext;
  }
  return context;
}

console.log('🔥 AuthContext v7.04.01 LOADED');
