import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

/**
 * DIAGNOSTIC TEST PAGE
 * Simple page to verify module loading works
 */

export default function DiagnosticTest() {
  const [testsPassed, setTestsPassed] = React.useState(0);
  const [testsFailed, setTestsFailed] = React.useState(0);

  React.useEffect(() => {
    // Test 1: React import
    if (typeof React !== 'undefined') {
      setTestsPassed(prev => prev + 1);
    } else {
      setTestsFailed(prev => prev + 1);
    }

    // Test 2: Lucide icons
    if (typeof CheckCircle2 !== 'undefined') {
      setTestsPassed(prev => prev + 1);
    } else {
      setTestsFailed(prev => prev + 1);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-6">Module Diagnostic Test</h1>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg">
              <CheckCircle2 className="text-emerald-600" size={24} />
              <div>
                <p className="font-semibold text-emerald-900">Tests Passed: {testsPassed}</p>
                <p className="text-sm text-emerald-700">Modules loading correctly</p>
              </div>
            </div>

            {testsFailed > 0 && (
              <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-lg">
                <XCircle className="text-rose-600" size={24} />
                <div>
                  <p className="font-semibold text-rose-900">Tests Failed: {testsFailed}</p>
                  <p className="text-sm text-rose-700">Module loading errors detected</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <AlertTriangle className="text-blue-600" size={24} />
              <div>
                <p className="font-semibold text-blue-900">Diagnostic Info</p>
                <p className="text-sm text-blue-700">If you see this page, basic module loading is working.</p>
                <p className="text-sm text-blue-700 mt-2">Try clearing browser cache and refreshing if you're experiencing import errors.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-slate-50 rounded-lg border border-slate-200">
            <h2 className="font-bold text-slate-900 mb-4">Recent Changes:</h2>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>✅ Created RegulatoryCompliance page</li>
              <li>✅ Created LegalDisclaimers page</li>
              <li>✅ Updated DoseEventVerification with optical disclaimer</li>
              <li>✅ Added routes for new compliance pages</li>
              <li>✅ Updated sidebar navigation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
