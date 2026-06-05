import React from 'react';
import { Link } from 'react-router';
import { Shield, ArrowLeft } from 'lucide-react';

interface AccessDeniedProps {
  message?: string;
  returnPath?: string;
}

export function AccessDenied({ 
  message = "Only administrators can access this page. Please contact your household admin for assistance.",
  returnPath = "/dashboard"
}: AccessDeniedProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md text-center">
        <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield size={40} className="text-rose-600" />
        </div>
        
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Access Denied</h2>
        
        <p className="text-slate-600 mb-8 leading-relaxed">
          {message}
        </p>

        <div className="space-y-3">
          <Link
            to={returnPath}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
          >
            <ArrowLeft size={20} />
            Return to Dashboard
          </Link>
          
          <div className="text-sm text-slate-500">
            Need admin access? Contact your Care Circle administrator.
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-2">Your Current Access Level</h3>
          <div className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">
            Caregiver (View-only)
          </div>
        </div>
      </div>
    </div>
  );
}
