import React, { useState, useEffect } from 'react';
import { useUserRole } from '../context/UserRoleContext';
import { User, UserRole } from '../types/auth';
import { Users, UserPlus, Edit2, Trash2, Shield, Mail, Phone, Clock, Lock } from 'lucide-react';
import { format } from 'date-fns';

export default function UserManagement() {
  const { isAdmin } = useUserRole();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    role: 'secondary_caregiver' as UserRole,
    mfaEnabled: false,
    mfaMethod: 'email' as 'sms' | 'email' | 'authenticator',
    sessionTimeoutMinutes: 30,
    status: 'active' as 'active' | 'suspended' | 'locked'
  });

  // Check permission - use UserRoleContext instead of AuthV2
  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
          <p className="text-rose-700">You don't have permission to manage users. Only administrators can access user management.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to fetch users
      // const data = await fetchUsers();
      // setUsers(data);
      
      // Mock data for now
      setUsers([
        {
          id: '1',
          email: 'sarah@example.com',
          name: 'Sarah Johnson',
          role: 'primary_caregiver',
          phoneNumber: '+1 (555) 123-4567',
          mfaEnabled: true,
          mfaMethod: 'sms',
          lastLogin: '2026-02-28T14:32:17.890Z',
          createdAt: '2026-01-15T10:00:00.000Z',
          updatedAt: '2026-02-28T14:32:17.890Z',
          status: 'active',
          failedLoginAttempts: 0,
          passwordLastChanged: '2026-01-15T10:00:00.000Z',
          mustChangePassword: false,
          sessionTimeoutMinutes: 60
        },
        {
          id: '2',
          email: 'dr.kim@example.com',
          name: 'Dr. Emily Kim',
          role: 'clinical_supervisor',
          phoneNumber: '+1 (555) 234-5678',
          mfaEnabled: true,
          mfaMethod: 'authenticator',
          lastLogin: '2026-02-28T09:15:00.000Z',
          createdAt: '2026-01-20T14:00:00.000Z',
          updatedAt: '2026-02-28T09:15:00.000Z',
          status: 'active',
          failedLoginAttempts: 0,
          passwordLastChanged: '2026-01-20T14:00:00.000Z',
          mustChangePassword: false,
          sessionTimeoutMinutes: 120
        }
      ]);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      phoneNumber: '',
      role: 'secondary_caregiver',
      mfaEnabled: false,
      mfaMethod: 'email',
      sessionTimeoutMinutes: 30,
      status: 'active'
    });
    setShowModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      role: user.role,
      mfaEnabled: user.mfaEnabled,
      mfaMethod: user.mfaMethod || 'email',
      sessionTimeoutMinutes: user.sessionTimeoutMinutes,
      status: user.status
    });
    setShowModal(true);
  };

  const handleSaveUser = async () => {
    try {
      if (editingUser) {
        // TODO: Update user API call
        console.log('Updating user:', editingUser.id, formData);
      } else {
        // TODO: Create user API call
        console.log('Creating user:', formData);
      }
      
      setShowModal(false);
      await loadUsers();
    } catch (error) {
      console.error('Failed to save user:', error);
      alert('Failed to save user. Please try again.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      // TODO: Delete user API call
      console.log('Deleting user:', userId);
      await loadUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user. Please try again.');
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const colors = {
      primary_caregiver: 'bg-emerald-100 text-emerald-700',
      secondary_caregiver: 'bg-blue-100 text-blue-700',
      clinical_supervisor: 'bg-purple-100 text-purple-700',
      system_admin: 'bg-rose-100 text-rose-700'
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[role]}`}>
        {role.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-emerald-100 text-emerald-700',
      suspended: 'bg-amber-100 text-amber-700',
      locked: 'bg-rose-100 text-rose-700'
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status as keyof typeof colors]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-slate-600">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-emerald-600" />
            <div>
              <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
              <p className="text-slate-600">Manage user accounts, roles, and permissions</p>
            </div>
          </div>
          <button
            onClick={handleCreateUser}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <p className="text-sm text-slate-600 mb-1">Total Users</p>
          <p className="text-2xl font-bold text-slate-900">{users.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-emerald-200 p-4">
          <p className="text-sm text-slate-600 mb-1">Active</p>
          <p className="text-2xl font-bold text-emerald-600">
            {users.filter(u => u.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-4">
          <p className="text-sm text-slate-600 mb-1">MFA Enabled</p>
          <p className="text-2xl font-bold text-blue-600">
            {users.filter(u => u.mfaEnabled).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-purple-200 p-4">
          <p className="text-sm text-slate-600 mb-1">Supervisors/Admins</p>
          <p className="text-2xl font-bold text-purple-600">
            {users.filter(u => ['clinical_supervisor', 'system_admin'].includes(u.role)).length}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">MFA</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Last Login</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{user.name}</div>
                        <div className="text-sm text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      {user.phoneNumber && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="w-3 h-3" />
                          {user.phoneNumber}
                        </div>
                      )}
                      {user.email && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {user.mfaEnabled ? (
                      <div className="flex items-center gap-1 text-emerald-600">
                        <Shield className="w-4 h-4" />
                        <span className="text-xs capitalize">{user.mfaMethod}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">Disabled</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                    {user.lastLogin ? format(new Date(user.lastLogin), 'MMM dd, HH:mm') : 'Never'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                        title="Edit user"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {user.id !== '1' && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              {editingUser ? 'Edit User' : 'Create New User'}
            </h2>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Sarah Johnson"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="sarah@example.com"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Role <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="secondary_caregiver">Secondary Caregiver</option>
                  <option value="primary_caregiver">Primary Caregiver</option>
                  <option value="clinical_supervisor">Clinical Supervisor</option>
                  <option value="system_admin">System Admin</option>
                </select>
              </div>

              {/* Session Timeout */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Session Timeout (Minutes)
                </label>
                <input
                  type="number"
                  value={formData.sessionTimeoutMinutes}
                  onChange={(e) => setFormData({ ...formData, sessionTimeoutMinutes: parseInt(e.target.value) || 30 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  min="5"
                  max="480"
                />
              </div>

              {/* MFA */}
              <div className="p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-slate-700">
                    Enable Multi-Factor Authentication
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.mfaEnabled}
                      onChange={(e) => setFormData({ ...formData, mfaEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {formData.mfaEnabled && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">MFA Method</label>
                    <select
                      value={formData.mfaMethod}
                      onChange={(e) => setFormData({ ...formData, mfaMethod: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                      <option value="authenticator">Authenticator App</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Account Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="locked">Locked</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveUser}
                className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                {editingUser ? 'Update User' : 'Create User'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}