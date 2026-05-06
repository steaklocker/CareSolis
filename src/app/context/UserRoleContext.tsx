import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * USER ROLE CONTEXT
 * 
 * Manages role-based access control (RBAC) throughout the application.
 * 
 * Roles:
 * - 'admin': Full system configuration access (primary caregiver, healthcare POA)
 * - 'caregiver': View-only + notifications (Care Circle members)
 * - 'recipient': Care recipient themselves (future feature)
 * 
 * CRITICAL: Escalation Level ≠ Authority Level
 * - Level 3 contacts can be admins (e.g., Healthcare POA)
 * - Level 1 contacts can be caregivers (e.g., neighbor - fast response, no config access)
 */

export type UserRole = 'admin' | 'caregiver' | 'recipient';

interface CurrentUser {
  name: string;
  email: string;
  role: UserRole;
  id: string;
}

interface UserRoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  baseRole: UserRole; // User's TRUE permission level (never changes)
  isAdmin: boolean;
  isCaregiver: boolean;
  isRecipient: boolean;
  isBaseAdmin: boolean; // TRUE if user has admin privileges (for showing role switcher)
  currentUser: CurrentUser | null;
  switchRole: (role: UserRole) => void;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

export function UserRoleProvider({ children }: { children: React.ReactNode }) {
  // For demo purposes, default to 'admin'. In production, this would come from auth/database
  const [role, setRole] = useState<UserRole>('admin');
  
  // Base role is the user's TRUE permission level (set on login, never changes)
  // In production, this comes from database and cannot be changed by the user
  const [baseRole] = useState<UserRole>('admin'); // This would be set from auth

  // Mock user data - in production, this comes from auth system
  const [currentUser] = useState<CurrentUser>({
    name: 'Dr. Sarah Chen',
    email: 'sarah.chen@caresolis.com',
    role: baseRole,
    id: 'user_admin_001'
  });

  // Switch role function (updates currentUser.role as well)
  const switchRole = React.useCallback((newRole: UserRole) => {
    console.log('🔐 switchRole called:', newRole);
    setRole(newRole);
  }, []);

  // In production, fetch user role from backend on mount
  useEffect(() => {
    console.log('🔐 UserRoleContext INIT - Starting initialization...');
    console.log('🔐 Default role before localStorage check:', role);
    
    // Example: fetchUserRole().then(setRole);
    // For now, check localStorage for demo switching
    const savedRole = localStorage.getItem('caresolisUserRole') as UserRole;
    console.log('🔐 localStorage value:', savedRole);
    
    if (savedRole && (savedRole === 'admin' || savedRole === 'caregiver' || savedRole === 'recipient')) {
      console.log('🔐 Setting role from localStorage:', savedRole);
      setRole(savedRole);
    } else {
      console.log('🔐 No saved role, keeping default: admin');
      localStorage.setItem('caresolisUserRole', 'admin');
    }
  }, []); // Run only once on mount

  // Persist role to localStorage for demo
  useEffect(() => {
    console.log('🔐 UserRoleContext - Persisting role to localStorage:', role);
    localStorage.setItem('caresolisUserRole', role);
  }, [role]); // Only run when role changes

  // Memoize computed values to prevent unnecessary re-renders
  const value = React.useMemo(() => ({
    role,
    setRole,
    baseRole,
    isAdmin: role === 'admin',
    isCaregiver: role === 'caregiver',
    isRecipient: role === 'recipient',
    isBaseAdmin: baseRole === 'admin',
    currentUser,
    switchRole
  }), [role, baseRole, currentUser, switchRole]);

  return (
    <UserRoleContext.Provider value={value}>
      {children}
    </UserRoleContext.Provider>
  );
}

export function useUserRole() {
  const context = useContext(UserRoleContext);
  if (context === undefined) {
    // v6.45.3 - Defensive fallback instead of throwing error
    console.warn('⚠️ useUserRole used outside UserRoleProvider - returning safe defaults');
    return {
      role: 'admin' as UserRole,
      setRole: () => {},
      baseRole: 'admin' as UserRole,
      isAdmin: true,
      isCaregiver: false,
      isRecipient: false,
      isBaseAdmin: true,
      currentUser: {
        name: 'Demo User',
        email: 'demo@caresolis.com',
        role: 'admin' as UserRole,
        id: 'demo_user'
      },
      switchRole: () => {}
    };
  }
  return context;
}