import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Shield, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export default function InitialSetup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [adminData, setAdminData] = useState<any>(null);

  const createAdminUser = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9aeac050/init/create-admin`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          // Admin already exists
          setError('Admin user already exists. Please use the login page.');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          throw new Error(data.error || 'Failed to create admin user');
        }
      } else {
        setSuccess(true);
        setAdminData(data.user);
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (err: any) {
      console.error('Setup error:', err);
      setError(err.message || 'Failed to create admin user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Caresolis</h1>
          <p className="text-slate-600">Initial System Setup</p>
        </div>

        {/* Setup Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Create Admin Account</h2>
            <p className="text-sm text-slate-600">
              This will create the initial system administrator account for Caresolis.
            </p>
          </div>

          {!success && !error && !loading && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 mb-3">Administrator Accounts:</p>

                <div className="space-y-3">
                  <div className="pb-3 border-b border-blue-200">
                    <p className="text-xs font-semibold text-blue-900 mb-1">Admin 1: Claus Schmitz</p>
                    <div className="space-y-1 text-xs text-blue-800">
                      <p><strong>Email:</strong> cschmitz2000@gmail.com</p>
                      <p><strong>Password:</strong> Admin2000!@#$Secure</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-blue-900 mb-1">Admin 2: Jelene Roxas</p>
                    <div className="space-y-1 text-xs text-blue-800">
                      <p><strong>Email:</strong> jelene.roxas@caresolis.com</p>
                      <p><strong>Password:</strong> Admin2024!@#$Secure</p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={createAdminUser}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/30"
              >
                Create Admin Accounts
              </button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader className="w-12 h-12 text-emerald-600 animate-spin" />
              <p className="text-slate-600">Creating admin account...</p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-4 bg-rose-50 border border-rose-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-rose-700 mb-1">Error</p>
                <p className="text-sm text-rose-600">{error}</p>
              </div>
            </div>
          )}

          {success && adminData && (
            <div className="space-y-4">
              <div className="flex items-start gap-2 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-emerald-700 mb-1">Success!</p>
                  <p className="text-sm text-emerald-600">Admin account created successfully.</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-xs font-semibold text-slate-700 mb-2">Account Details:</p>
                <div className="space-y-1 text-xs text-slate-600">
                  <p><strong>Name:</strong> {adminData.name}</p>
                  <p><strong>Email:</strong> {adminData.email}</p>
                  <p><strong>Role:</strong> {adminData.role}</p>
                </div>
              </div>

              <p className="text-sm text-center text-slate-600">
                Redirecting to login page...
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Already have an account? Sign in
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            🔒 FDA 21 CFR Part 11 Compliant • HIPAA Secure • AES-256 Encryption
          </p>
        </div>
      </div>
    </div>
  );
}
