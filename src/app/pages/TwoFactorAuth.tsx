import { useState } from 'react';
import { Shield, Smartphone, Mail, Key, CheckCircle, AlertCircle, Copy, QrCode } from 'lucide-react';
import { clsx } from 'clsx';

export default function TwoFactorAuth() {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [method, setMethod] = useState<'sms' | 'email' | 'authenticator'>('authenticator');
  const [setupStep, setSetupStep] = useState<'disabled' | 'setup' | 'verify' | 'enabled'>('disabled');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');

  // Mock secret key for authenticator apps
  const secretKey = 'JBSWY3DPEHPK3PXP';
  const qrCodeUrl = `otpauth://totp/Caresolis:user@example.com?secret=${secretKey}&issuer=Caresolis`;

  const handleEnable2FA = () => {
    setSetupStep('setup');
    // Generate backup codes
    const codes = Array.from({ length: 8 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );
    setBackupCodes(codes);
  };

  const handleVerify = () => {
    // In production: verify code with backend
    if (verificationCode.length === 6) {
      setSetupStep('enabled');
      setIs2FAEnabled(true);
      console.log('✅ 2FA enabled successfully');
    }
  };

  const handleDisable2FA = () => {
    setSetupStep('disabled');
    setIs2FAEnabled(false);
    setBackupCodes([]);
    console.log('❌ 2FA disabled');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const copyAllBackupCodes = () => {
    const allCodes = backupCodes.join('\n');
    navigator.clipboard.writeText(allCodes);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Shield className="text-indigo-600" size={32} />
            Two-Factor Authentication (2FA)
          </h1>
          <p className="text-slate-600 mt-2">
            Add an extra layer of security to your account. 2FA helps protect against unauthorized access.
          </p>
        </div>

        {/* Status Card */}
        <div className={clsx(
          "mb-6 p-6 rounded-xl border-2",
          is2FAEnabled
            ? "bg-emerald-50 border-emerald-300"
            : "bg-amber-50 border-amber-300"
        )}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {is2FAEnabled ? (
                <CheckCircle className="text-emerald-600 shrink-0 mt-1" size={32} />
              ) : (
                <AlertCircle className="text-amber-600 shrink-0 mt-1" size={32} />
              )}
              <div>
                <h3 className={clsx(
                  "text-xl font-bold mb-1",
                  is2FAEnabled ? "text-emerald-900" : "text-amber-900"
                )}>
                  {is2FAEnabled ? '2FA is Enabled' : '2FA is Disabled'}
                </h3>
                <p className={clsx(
                  "text-sm",
                  is2FAEnabled ? "text-emerald-700" : "text-amber-700"
                )}>
                  {is2FAEnabled 
                    ? 'Your account is protected with two-factor authentication.'
                    : 'Your account is not protected with 2FA. Enable it now for enhanced security.'}
                </p>
              </div>
            </div>
            {is2FAEnabled && (
              <button
                onClick={handleDisable2FA}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
              >
                Disable 2FA
              </button>
            )}
          </div>
        </div>

        {/* Setup Flow */}
        {setupStep === 'disabled' && !is2FAEnabled && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4">Choose Your 2FA Method</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Authenticator App */}
              <button
                onClick={() => setMethod('authenticator')}
                className={clsx(
                  "p-6 rounded-lg border-2 transition-all text-left",
                  method === 'authenticator'
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-200 hover:border-slate-300"
                )}
              >
                <Smartphone className={clsx(
                  "mb-3",
                  method === 'authenticator' ? "text-indigo-600" : "text-slate-600"
                )} size={32} />
                <h4 className="font-bold text-slate-900 mb-1">Authenticator App</h4>
                <p className="text-sm text-slate-600">
                  Use Google Authenticator, Authy, or similar apps
                </p>
                <p className="text-xs text-emerald-600 mt-2 font-semibold">✓ Recommended</p>
              </button>

              {/* SMS */}
              <button
                onClick={() => setMethod('sms')}
                className={clsx(
                  "p-6 rounded-lg border-2 transition-all text-left",
                  method === 'sms'
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-200 hover:border-slate-300"
                )}
              >
                <Mail className={clsx(
                  "mb-3",
                  method === 'sms' ? "text-indigo-600" : "text-slate-600"
                )} size={32} />
                <h4 className="font-bold text-slate-900 mb-1">SMS Text Message</h4>
                <p className="text-sm text-slate-600">
                  Receive codes via text message
                </p>
                <p className="text-xs text-amber-600 mt-2 font-semibold">⚠️ Requires Twilio</p>
              </button>

              {/* Email */}
              <button
                onClick={() => setMethod('email')}
                className={clsx(
                  "p-6 rounded-lg border-2 transition-all text-left",
                  method === 'email'
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-200 hover:border-slate-300"
                )}
              >
                <Mail className={clsx(
                  "mb-3",
                  method === 'email' ? "text-indigo-600" : "text-slate-600"
                )} size={32} />
                <h4 className="font-bold text-slate-900 mb-1">Email Code</h4>
                <p className="text-sm text-slate-600">
                  Receive codes via email
                </p>
                <p className="text-xs text-slate-500 mt-2">Less secure</p>
              </button>
            </div>

            <button
              onClick={handleEnable2FA}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors"
            >
              Enable {method === 'authenticator' ? 'Authenticator' : method === 'sms' ? 'SMS' : 'Email'} 2FA
            </button>
          </div>
        )}

        {/* Setup Step: Authenticator */}
        {setupStep === 'setup' && method === 'authenticator' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4">Set Up Authenticator App</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              {/* QR Code */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Step 1: Scan QR Code</h4>
                <div className="bg-slate-100 rounded-lg p-6 flex items-center justify-center aspect-square">
                  <QrCode size={200} className="text-slate-400" />
                  <p className="absolute text-xs text-slate-600 mt-48">QR Code appears here</p>
                </div>
                <p className="text-sm text-slate-600 mt-3">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
              </div>

              {/* Manual Entry */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Step 2: Or Enter Manually</h4>
                <p className="text-sm text-slate-600 mb-3">
                  If you can't scan the QR code, enter this secret key manually:
                </p>
                <div className="bg-slate-100 rounded-lg p-4 mb-3 flex items-center justify-between">
                  <code className="text-sm font-mono text-slate-900">{secretKey}</code>
                  <button
                    onClick={() => copyToClipboard(secretKey)}
                    className="p-2 hover:bg-slate-200 rounded transition-colors"
                    title="Copy secret key"
                  >
                    <Copy size={18} />
                  </button>
                </div>

                <h4 className="font-semibold text-slate-900 mb-3 mt-6">Step 3: Enter Verification Code</h4>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
                />
                <button
                  onClick={handleVerify}
                  disabled={verificationCode.length !== 6}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
                >
                  Verify and Enable 2FA
                </button>
              </div>
            </div>

            {/* Backup Codes */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mt-6">
              <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                <Key size={20} />
                Backup Recovery Codes
              </h4>
              <p className="text-sm text-amber-800 mb-4">
                Save these codes in a secure location. Each code can be used once if you lose access to your authenticator.
              </p>
              <div className="grid grid-cols-2 gap-2 bg-white rounded-lg p-4 mb-3">
                {backupCodes.map((code, i) => (
                  <div key={i} className="font-mono text-sm text-slate-900 bg-slate-100 px-3 py-2 rounded">
                    {code}
                  </div>
                ))}
              </div>
              <button
                onClick={copyAllBackupCodes}
                className="flex items-center gap-2 text-sm text-amber-700 hover:text-amber-900 font-semibold"
              >
                <Copy size={16} />
                Copy All Codes
              </button>
            </div>
          </div>
        )}

        {/* Setup Step: SMS */}
        {setupStep === 'setup' && method === 'sms' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4">Set Up SMS Authentication</h3>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Integration Required:</strong> SMS 2FA requires a Twilio account. 
                Add your Twilio credentials to environment variables to enable this feature.
              </p>
            </div>

            <label className="block mb-4">
              <span className="text-sm font-semibold text-slate-700 mb-2 block">Phone Number</span>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </label>

            <button
              onClick={() => setSetupStep('verify')}
              disabled={!phoneNumber}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
            >
              Send Verification Code
            </button>
          </div>
        )}

        {/* Enabled State */}
        {setupStep === 'enabled' && (
          <div className="space-y-6">
            {/* Active Method */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Active 2FA Method</h3>
              <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-lg">
                {method === 'authenticator' && <Smartphone className="text-emerald-600" size={32} />}
                {method === 'sms' && <Mail className="text-emerald-600" size={32} />}
                {method === 'email' && <Mail className="text-emerald-600" size={32} />}
                <div>
                  <h4 className="font-semibold text-slate-900">
                    {method === 'authenticator' ? 'Authenticator App' : 
                     method === 'sms' ? 'SMS Text Message' : 'Email Code'}
                  </h4>
                  <p className="text-sm text-slate-600">
                    Configured and active
                  </p>
                </div>
              </div>
            </div>

            {/* Backup Codes Management */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Backup Recovery Codes</h3>
              <p className="text-sm text-slate-600 mb-4">
                You have <strong>{backupCodes.length}</strong> backup codes remaining.
              </p>
              <button className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-semibold text-slate-700">
                Generate New Backup Codes
              </button>
            </div>

            {/* Session Management */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Active Sessions</h3>
              <div className="space-y-3">
                <div className="flex items-start justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-slate-900">Current Session</h4>
                    <p className="text-sm text-slate-600">MacBook Pro • San Francisco, CA</p>
                    <p className="text-xs text-slate-500 mt-1">Active now</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                    Active
                  </span>
                </div>
                <div className="flex items-start justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-slate-900">iPhone 15 Pro</h4>
                    <p className="text-sm text-slate-600">Los Angeles, CA</p>
                    <p className="text-xs text-slate-500 mt-1">Last active 2 hours ago</p>
                  </div>
                  <button className="text-sm text-red-600 hover:text-red-700 font-semibold">
                    Revoke
                  </button>
                </div>
              </div>
              <button className="mt-4 text-sm text-red-600 hover:text-red-700 font-semibold">
                Revoke All Other Sessions
              </button>
            </div>
          </div>
        )}

        {/* Requirements Notice */}
        <div className="mt-6 bg-slate-100 border border-slate-300 rounded-lg p-6">
          <h3 className="font-bold text-slate-900 mb-3">Enterprise Security Requirements</h3>
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <CheckCircle className="text-emerald-600 shrink-0 mt-0.5" size={16} />
              <span><strong>FDA Compliance:</strong> 2FA required for all users with prescription access</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="text-emerald-600 shrink-0 mt-0.5" size={16} />
              <span><strong>HIPAA Compliance:</strong> Enhanced authentication for PHI access</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="text-emerald-600 shrink-0 mt-0.5" size={16} />
              <span><strong>Session Timeout:</strong> Automatic logout after 30 minutes of inactivity</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="text-emerald-600 shrink-0 mt-0.5" size={16} />
              <span><strong>Audit Logging:</strong> All authentication events logged for compliance</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
