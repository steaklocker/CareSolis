/**
 * ROLE-BASED ACCESS CONTROL MIDDLEWARE (Server-Side)
 * 
 * In production, this would verify JWT tokens and check user roles from database
 * For demo purposes, this provides the structure for role checking
 */

import type { Context } from "npm:hono";

export type UserRole = 'admin' | 'caregiver' | 'recipient';

interface RoleCheckResult {
  authorized: boolean;
  role?: UserRole;
  userId?: string;
  error?: string;
}

/**
 * Check if a request is authorized for the given role(s)
 * 
 * In production, this would:
 * 1. Extract JWT from Authorization header
 * 2. Verify token with Supabase Auth
 * 3. Query user role from database
 * 4. Check if role is in allowedRoles
 * 
 * @param c - Hono context
 * @param allowedRoles - Array of roles that can access this endpoint
 */
export async function checkRole(c: Context, allowedRoles: UserRole[]): Promise<RoleCheckResult> {
  // In demo mode, we don't have real authentication
  // In production, uncomment and implement:
  
  /*
  try {
    // 1. Extract token
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authorized: false, error: 'Missing or invalid Authorization header' };
    }
    
    const token = authHeader.substring(7);
    
    // 2. Verify with Supabase Auth
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return { authorized: false, error: 'Invalid or expired token' };
    }
    
    // 3. Get user role from database
    // Assuming you have a user_roles table or user metadata
    const { data: userData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    if (roleError || !userData) {
      return { authorized: false, error: 'User role not found' };
    }
    
    const userRole = userData.role as UserRole;
    
    // 4. Check if role is allowed
    if (!allowedRoles.includes(userRole)) {
      return { 
        authorized: false, 
        role: userRole,
        userId: user.id,
        error: `Role '${userRole}' is not authorized. Required: ${allowedRoles.join(', ')}` 
      };
    }
    
    return { 
      authorized: true, 
      role: userRole,
      userId: user.id
    };
    
  } catch (err) {
    console.error('Role check error:', err);
    return { authorized: false, error: 'Internal server error during role check' };
  }
  */
  
  // DEMO MODE: Always allow (frontend handles restrictions)
  console.log(`⚠️ DEMO MODE: Role check bypassed for endpoint. In production, verify role: ${allowedRoles.join(', ')}`);
  return { authorized: true, role: 'admin' };
}

/**
 * Middleware wrapper to protect routes
 * 
 * Usage:
 * app.post('/medications', requireRole(['admin']), async (c) => {
 *   // Only admins can reach here
 * });
 */
export function requireRole(allowedRoles: UserRole[]) {
  return async (c: Context, next: () => Promise<void>) => {
    const result = await checkRole(c, allowedRoles);
    
    if (!result.authorized) {
      return c.json(
        { 
          error: 'Unauthorized', 
          message: result.error || 'You do not have permission to access this resource',
          required_roles: allowedRoles 
        }, 
        403
      );
    }
    
    // Store user info in context for use in handlers
    c.set('userRole', result.role);
    c.set('userId', result.userId);
    
    await next();
  };
}

/**
 * Helper to get current user role from context
 */
export function getUserRole(c: Context): UserRole | undefined {
  return c.get('userRole');
}

/**
 * Helper to get current user ID from context
 */
export function getUserId(c: Context): string | undefined {
  return c.get('userId');
}

// Export role-protected endpoint examples for documentation
export const ROLE_REQUIREMENTS = {
  // ADMIN ONLY
  'POST /medications': ['admin'],
  'POST /medications/schedule': ['admin'],
  'POST /settings': ['admin'],
  'POST /contacts': ['admin'],
  'DELETE /contacts/:id': ['admin'],
  'POST /rpm/enrollment': ['admin'],
  'POST /systems-infrastructure': ['admin'],
  
  // ADMIN or CAREGIVER
  'GET /medications': ['admin', 'caregiver'],
  'GET /notifications': ['admin', 'caregiver'],
  'GET /dose-events': ['admin', 'caregiver'],
  'GET /events': ['admin', 'caregiver'],
  'GET /contacts': ['admin', 'caregiver'],
  
  // CAREGIVER ACTIONS (logged for audit)
  'POST /acknowledge': ['admin', 'caregiver'],
  'POST /chute/authorize-action': ['admin', 'caregiver'],
} as const;
