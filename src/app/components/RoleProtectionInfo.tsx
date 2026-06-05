/**
 * ROLE-BASED ACCESS CONTROL (RBAC) REFERENCE
 * 
 * This component documents the complete role system implemented in CareSolis
 * Use as a reference for understanding what each role can/cannot do
 */

import React from 'react';
import { Shield, Eye, Edit, Lock } from 'lucide-react';

export function RoleProtectionInfo() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-gradient-to-br from-emerald-50 to-slate-50 dark:from-emerald-900/20 dark:to-slate-900/20 rounded-xl p-6 border-2 border-emerald-200 dark:border-emerald-800">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-3">
          <Shield className="w-8 h-8 text-emerald-600" />
          Role-Based Access Control
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          CareSolis implements strict role separation to ensure data integrity and FDA compliance
        </p>
      </div>

      {/* Role Definitions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* ADMIN */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-3">
            <Edit className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100">ADMIN</h2>
          </div>
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
            Primary caregiver, healthcare POA, or clinical supervisor with full system control
          </p>
          
          <div className="space-y-2">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">Can Do:</h3>
            <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">✅</span>
                Edit medication schedules & blister packs
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">✅</span>
                Configure system settings & webhooks
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">✅</span>
                Manage Care Circle contacts
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">✅</span>
                Configure RPM billing & compliance
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">✅</span>
                Authorize dose re-presentation
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600">✅</span>
                View all audit logs & analytics
              </li>
            </ul>
          </div>
        </div>

        {/* CAREGIVER */}
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-300 dark:border-emerald-700 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-100">CAREGIVER</h2>
          </div>
          <p className="text-sm text-emerald-800 dark:text-emerald-200 mb-4">
            Care Circle members with view-only access and response capabilities
          </p>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 text-sm mb-2">Can Do:</h3>
              <ul className="space-y-1 text-sm text-emerald-800 dark:text-emerald-200">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600">✅</span>
                  View dashboard & all patient data
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600">✅</span>
                  Respond to alerts & escalations
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600">✅</span>
                  Authorize dose actions (re-present/skip)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600">✅</span>
                  Add journal entries
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600">✅</span>
                  View audit logs (read-only)
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-rose-900 dark:text-rose-100 text-sm mb-2">Cannot Do:</h3>
              <ul className="space-y-1 text-sm text-rose-800 dark:text-rose-200">
                <li className="flex items-start gap-2">
                  <Lock className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  Edit medications or schedules
                </li>
                <li className="flex items-start gap-2">
                  <Lock className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  Change system settings
                </li>
                <li className="flex items-start gap-2">
                  <Lock className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  Modify Care Circle contacts
                </li>
                <li className="flex items-start gap-2">
                  <Lock className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  Configure billing or integrations
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Protected Pages */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Admin-Only Pages
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          These pages require ADMIN role. Caregivers attempting to access will see "Access Denied":
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            'Medication Hub',
            'Medication Maintenance',
            'RTM Billing',
            'Integrations (Webhooks)',
            'Clinical Operations',
            'System Settings',
            'System Monitoring',
            'Analytics Dashboard',
            'Access & Permissions',
            'Security Center',
            'Two-Factor Auth',
            'Data Governance',
            'Regulatory Compliance',
            'Legal Disclaimers'
          ].map(page => (
            <div key={page} className="flex items-center gap-2 text-sm">
              <Lock className="w-3 h-3 text-rose-600 dark:text-rose-400" />
              <span className="text-slate-700 dark:text-slate-300">{page}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Key Principle */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-amber-900 dark:text-amber-100 mb-3">
          🔐 Key Security Principle
        </h2>
        <div className="space-y-3 text-sm text-amber-800 dark:text-amber-200">
          <p>
            <strong>Operational Authorization ≠ Data Editing</strong>
          </p>
          <p>
            Caregivers can <em>respond to events</em> (re-present a dose, mark as missed) because these are 
            operational decisions with full audit trails.
          </p>
          <p>
            However, caregivers <strong>cannot edit clinical data</strong> (medication schedules, dosages, 
            patient info) as these require administrator authorization for FDA compliance and liability protection.
          </p>
        </div>
      </div>

      {/* Demo Mode */}
      <div className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-4">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Demo Mode</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          In the demo environment, you can switch between ADMIN and CAREGIVER roles using the role badge 
          in the header. In production, roles are assigned during authentication and cannot be changed by the user.
        </p>
      </div>
    </div>
  );
}
