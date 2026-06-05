import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

/**
 * USER ROLE CONTEXT
 *
 * Manages role-based access control (RBAC) throughout the application.
 *
 * Roles:
 * - 'admin': Full system configuration access (system_admin, clinical_supervisor)
 * - 'caregiver': View-only + notifications (primary/secondary caregiver)
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

// Map backend roles to frontend roles
function mapBackendRole(backendRole: string): UserRole {
  if (backendRole === 'system_admin' || backendRole === 'clinical_supervisor') {
    return 'admin';
  }
  if (backendRole === 'primary_caregiver' || backendRole === 'secondary_caregiver') {
    return 'caregiver';
  }
  return 'recipient';
}

export function UserRoleProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const [role, setRole] = useState<UserRole>('admin');
  const [baseRole, setBaseRole] = useState<UserRole>('admin');
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  // Sync with authenticated user
  useEffect(() => {
    if (auth.user) {
      const mappedRole = mapBackendRole(auth.user.role);
      setRole(mappedRole);
      setBaseRole(mappedRole);
      setCurrentUser({
        name: auth.user.name,
        email: auth.user.email,
        role: mappedRole,
        id: auth.user.id
      });
      console.log('🔐 UserRole synced with auth:', { user: auth.user.name, role: mappedRole });
    } else {
      // Reset when logged out
      setRole('admin');
      setBaseRole('admin');
      setCurrentUser(null);
    }
  }, [auth.user]);

  // Switch role function (updates currentUser.role as well)
  const switchRole = React.useCallback((newRole: UserRole) => {
    console.log('🔐 switchRole called:', newRole);
    setRole(newRole);
  }, []);

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