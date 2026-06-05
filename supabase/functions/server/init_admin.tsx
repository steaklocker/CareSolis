/**
 * ADMIN USER INITIALIZATION SCRIPT
 *
 * This script creates the initial system administrator account.
 * Run this ONCE to bootstrap the authentication system.
 *
 * Usage: Deploy this as a one-time edge function call
 */

import { Hono } from "npm:hono";
import { pbkdf2Sync, randomBytes } from "node:crypto";
import * as db from "./db.tsx";

const initApp = new Hono();

function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const passwordSalt = salt || randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, passwordSalt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt: passwordSalt };
}

initApp.post('/create-admin', async (c) => {
  try {
    const adminEmail = 'cschmitz2000@gmail.com';
    const adminPassword = 'Admin2000!@#$Secure';
    const adminName = 'Claus Schmitz';

    // Check if admin already exists
    const existingUsers = await db.getByPrefix('auth:user:email:');
    const adminExists = existingUsers.some((u: any) => u.email === adminEmail);

    if (adminExists) {
      return c.json({
        success: false,
        message: 'Admin user already exists',
        email: adminEmail
      }, 409);
    }

    // Hash password
    const { hash, salt } = hashPassword(adminPassword);

    // Create admin user
    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const adminUser = {
      id: userId,
      email: adminEmail,
      name: adminName,
      role: 'system_admin',
      status: 'active',
      passwordHash: hash,
      passwordSalt: salt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: null,
      failedLoginAttempts: 0,
      mfaEnabled: false,
      mfaMethod: null,
      passwordExpiresAt: null // Admin password never expires
    };

    // Save user to database
    await db.set(`auth:user:${userId}`, adminUser);
    await db.set(`auth:user:email:${adminEmail}`, adminUser);

    // Log creation
    await db.set(`auth:audit_log:admin_created:${userId}`, {
      userId,
      action: 'admin_user_created',
      timestamp: new Date().toISOString(),
      details: { email: adminEmail, name: adminName, role: 'system_admin' }
    });

    console.log(`✅ Admin user created successfully: ${adminEmail}`);

    return c.json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        id: userId,
        email: adminEmail,
        name: adminName,
        role: 'system_admin'
      }
    });

  } catch (error) {
    console.error('Error creating admin user:', error);
    return c.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, 500);
  }
});

export default initApp;
