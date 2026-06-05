import React, { createContext, useContext, useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

console.log('🔥 AuthContext v8.00 - DEV MODE: AUTH DISABLED');
console.log('🔥 Authentication bypassed for development phase');

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
}

interface Session {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  expiresAt: string;
  lastActivity: string;
  isActive: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => boolean;
  isLoading: boolean;
}

const defaultAuthContext: AuthContextType = {
  isAuthenticated: false,
  user: null,
  session: null,
  login: async () => {},
  logout: async () => {},
  checkAuth: () => false,
  isLoading: true
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

// Device fingerprinting helper
function getDeviceInfo() {
  return {
    deviceId: localStorage.getItem('device_id') || generateDeviceId(),
    deviceName: navigator.userAgent,
    deviceType: /mobile/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
    browser: navigator.userAgent,
    platform: navigator.platform,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    ipAddress: 'auto-detect' // Server will capture real IP
  };
}

function generateDeviceId() {
  const id = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('device_id', id);
  return id;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  console.log('🔥 AuthProvider RENDERING - DEV MODE: Auto-authenticated');

  // DEV MODE: Bypass authentication - auto-login as admin
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [user, setUser] = useState<User | null>({
    id: 'dev-admin',
    email: 'cschmitz2000@gmail.com',
    name: 'Claus Schmitz (Dev Mode)',
    role: 'system_admin',
    status: 'active'
  });
  const [session, setSession] = useState<Session | null>({
    id: 'dev-session',
    userId: 'dev-admin',
    userName: 'Claus Schmitz',
    userRole: 'system_admin',
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivity: new Date().toISOString(),
    isActive: true
  });
  const [isLoading, setIsLoading] = useState(false);

  // DEV MODE: Skip session check
  useEffect(() => {
    console.log('🔥 DEV MODE: Authentication disabled, auto-logged in as admin');
  }, []);

  // DEV MODE: Removed session check function

  const login = async (email: string, password: string) => {
    // DEV MODE: Bypass login, already authenticated
    console.log('🔥 DEV MODE: Login bypassed, already authenticated as admin');
    return Promise.resolve();
  };

  const logout = async () => {
    // DEV MODE: Logout disabled, stay authenticated
    console.log('🔥 DEV MODE: Logout disabled in dev mode');
    return Promise.resolve();
  };

  const checkAuth = () => {
    return isAuthenticated;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, session, login, logout, checkAuth, isLoading }}>
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

console.log('🔥 AuthContext v8.00 LOADED - DEV MODE: Authentication disabled for development');
