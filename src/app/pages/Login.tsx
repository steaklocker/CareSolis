import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, User, Smartphone, AlertCircle, CheckCircle } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      console.log('Attempting login with:', email);
      await login(email, password);
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => navigate('/'), 1000);
    } catch (err: any) {
      console.error('Login error details:', err);
      // Show detailed error with debugging info
      const errorMsg = err.message || 'Login failed. Please check your credentials.';
      setError(`${errorMsg}\n\nEmail: ${email}\nTimestamp: ${new Date().toISOString()}`);
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
          <p className="text-slate-600">Infrastructure-Grade Care Visibility</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Sign In</h2>
            <p className="text-sm text-slate-600">FDA-compliant secure authentication</p>
          </div>

          {/* Admin Quick Login */}
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-300 rounded-lg">
            <p className="text-sm font-semibold text-purple-900 mb-3">🔧 Administrator Logins</p>

            {/* Admin 1: Claus Schmitz */}
            <div className="mb-3 pb-3 border-b border-purple-200">
              <div className="space-y-1 text-xs text-purple-800 mb-2">
                <p><strong>Admin:</strong> Claus Schmitz</p>
                <p><strong>Email:</strong> cschmitz2000@gmail.com</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmail('cschmitz2000@gmail.com');
                  setPassword('Admin2000!@#$Secure');
                }}
                className="w-full bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors text-xs font-medium"
              >
                Auto-Fill Claus Schmitz
              </button>
            </div>

            {/* Admin 2: Jelene Roxas */}
            <div>
              <div className="space-y-1 text-xs text-purple-800 mb-2">
                <p><strong>Admin:</strong> Jelene Roxas</p>
                <p><strong>Email:</strong> jelene.roxas@caresolis.com</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmail('jelene.roxas@caresolis.com');
                  setPassword('Admin2024!@#$Secure');
                }}
                className="w-full bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors text-xs font-medium"
              >
                Auto-Fill Jelene Roxas
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
                  placeholder="caregiver@example.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
                  placeholder="••••••••••••"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-rose-700 whitespace-pre-wrap font-mono">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-700">{success}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/30"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-2">
            <a href="#" className="block text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              Forgot password?
            </a>
            <a href="/initial-setup" className="block text-xs text-slate-500 hover:text-slate-700">
              First time? Run initial setup
            </a>
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