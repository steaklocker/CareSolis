import React from 'react';
import { Shield, CheckCircle, XCircle, Info } from 'lucide-react';
import { ROLE_DEFINITIONS } from '../config/roles';

export default function PermissionMatrix() {
  const roles = Object.values(ROLE_DEFINITIONS).sort((a, b) => b.level - a.level);
  
  const permissionCategories = {
    'System Access': ['viewCode', 'viewLogs', 'viewAuditTrail', 'viewAnalytics'],
    'User Management': ['createUsers', 'editUsers', 'deleteUsers'],
    'Patient Data': ['viewPatientData', 'editPatientData', 'deletePatientData', 'exportPatientData'],
    'Medications': ['viewMedications', 'editMedications', 'approveMedications'],
    'System Configuration': ['editSettings', 'editEscalation', 'editIntegrations'],
    'Testing & Development': ['accessTestingTools', 'accessSimulator'],
    'Security': ['copyPaste', 'printPages', 'downloadReports']
  };

  const permissionLabels: Record<string, string> = {
    viewCode: 'View Code',
    viewLogs: 'View System Logs',
    viewAuditTrail: 'View Audit Trail',
    viewAnalytics: 'View Analytics',
    createUsers: 'Create Users',
    editUsers: 'Edit Users',
    deleteUsers: 'Delete Users',
    viewPatientData: 'View Patient Data',
    editPatientData: 'Edit Patient Data',
    deletePatientData: 'Delete Patient Data',
    exportPatientData: 'Export Patient Data',
    viewMedications: 'View Medications',
    editMedications: 'Edit Medications',
    approveMedications: 'Approve Medications',
    editSettings: 'Edit System Settings',
    editEscalation: 'Edit Escalation Rules',
    editIntegrations: 'Edit Integrations',
    accessTestingTools: 'Access Testing Tools',
    accessSimulator: 'Access Simulator',
    copyPaste: 'Copy/Paste Enabled',
    printPages: 'Print Pages',
    downloadReports: 'Download Reports'
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3 mb-4">
          <Shield className="w-8 h-8 text-emerald-500" />
          Role & Permission Matrix
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Comprehensive overview of user roles and their permissions in the Caresolis system
        </p>
      </div>

      {/* Role Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {roles.map((role) => (
          <div key={role.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {role.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Level {role.level}</p>
              </div>
              <Shield className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              {role.description}
            </p>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full">
                {Object.values(role.permissions).filter(Boolean).length} Permissions
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Permission Matrix Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider sticky left-0 bg-slate-50 dark:bg-slate-800 z-10">
                  Permission
                </th>
                {roles.map((role) => (
                  <th key={role.id} className="px-4 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <div className="flex flex-col items-center">
                      <span>{role.name.split(' ')[0]}</span>
                      <span className="text-[10px] font-normal normal-case text-slate-400">L{role.level}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {Object.entries(permissionCategories).map(([category, permissions]) => (
                <React.Fragment key={category}>
                  {/* Category Header */}
                  <tr className="bg-slate-50 dark:bg-slate-800/50">
                    <td colSpan={roles.length + 1} className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {category}
                    </td>
                  </tr>
                  
                  {/* Permission Rows */}
                  {permissions.map((permission) => (
                    <tr key={permission} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-slate-900 dark:text-slate-100 sticky left-0 bg-white dark:bg-slate-900 z-10">
                        {permissionLabels[permission]}
                      </td>
                      {roles.map((role) => {
                        const hasPermission = role.permissions[permission as keyof typeof role.permissions];
                        return (
                          <td key={role.id} className="px-4 py-3 text-center">
                            {hasPermission ? (
                              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto" />
                            ) : (
                              <XCircle className="w-5 h-5 text-slate-300 dark:text-slate-700 mx-auto" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Notes */}
      <div className="mt-6 space-y-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                Security & Compliance
              </p>
              <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                <li>• All actions are logged in the audit trail for FDA 21 CFR Part 11 compliance</li>
                <li>• Copy/Paste protection prevents unauthorized data extraction</li>
                <li>• Role assignments are immutable after creation (requires admin to change)</li>
                <li>• Sessions expire based on role: Viewer (30min), Caregiver (60min), Supervisor (120min), Admin (180min)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-start gap-2">
            <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-300 mb-1">
                Best Practices
              </p>
              <ul className="text-sm text-amber-800 dark:text-amber-400 space-y-1">
                <li>• Assign minimum required permissions (principle of least privilege)</li>
                <li>• Use Viewer role for family members who only need status updates</li>
                <li>• Reserve System Admin role for technical administrators only</li>
                <li>• Review user access regularly and remove inactive accounts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
