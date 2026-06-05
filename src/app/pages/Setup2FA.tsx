import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { Smartphone, Mail, CheckCircle2, Copy, Shield, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { CaresolisLogo } from '../components/CaresolisLogo';

export default function Setup2FA() {
  const navigate = useNavigate();
  const [method, setMethod] = useState<'app' | 'sms' | 'email'>('app');
  const [step, setStep] = useState<'choose' | 'setup' | 'verify'>('choose');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Mock secret key for authenticator apps
  const [secretKey] = useState('JBSWY3DPEHPK3PXP');
  const [qrCodeUrl] = useState('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/Caresolis:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Caresolis');

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secretKey);
    toast.success('Secret key copied to clipboard');
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    setIsVerifying(true);

    // Simulate verification
    setTimeout(() => {
      setIsVerifying(false);
      toast.success('Two-factor authentication enabled!');
      navigate('/');
    }, 1500);
  };

  const handleSkip = () => {
    navigate('/');
    toast.info('You can enable 2FA later in Settings');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 flex items-center justify-center p-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <CaresolisLogo className="h-12 dark:invert" />
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {step === 'choose' && (
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-4">
                  <Shield className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h1 className="text-2xl font-light text-slate-900 dark:text-slate-100 mb-2">Secure Your Account</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Add an extra layer of security with two-factor authentication
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {/* Authenticator App */}
                <button
                  onClick={() => {
                    setMethod('app');
                    setStep('setup');
                  }}
                  className="w-full p-6 border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-xl transition-colors text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
                      <Smartphone className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">Authenticator App</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Use Google Authenticator, Authy, or similar app (Recommended)
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                  </div>
                </button>

                {/* SMS */}
                <button
                  onClick={() => {
                    setMethod('sms');
                    setStep('setup');
                  }}
                  className="w-full p-6 border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-xl transition-colors text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg group-hover:bg-slate-100 dark:group-hover:bg-slate-700 transition-colors">
                      <Smartphone className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">SMS Text Message</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Receive codes via text message to your phone
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                  </div>
                </button>

                {/* Email */}
                <button
                  onClick={() => {
                    setMethod('email');
                    setStep('setup');
                  }}
                  className="w-full p-6 border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-xl transition-colors text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg group-hover:bg-slate-100 dark:group-hover:bg-slate-700 transition-colors">
                      <Mail className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">Email</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Receive codes via email
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                  </div>
                </button>
              </div>

              <div className="text-center">
                <button
                  onClick={handleSkip}
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}

          {step === 'setup' && method === 'app' && (
            <div className="p-8">
              <button
                onClick={() => setStep('choose')}
                className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors mb-6"
              >
                ← Back
              </button>

              <div className="text-center mb-8">
                <h2 className="text-2xl font-light text-slate-900 dark:text-slate-100 mb-2">Set Up Authenticator App</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Scan the QR code or enter the secret key manually
                </p>
              </div>

              <div className="flex flex-col items-center space-y-6 mb-8">
                {/* QR Code */}
                <div className="bg-white p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700">
                  <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                </div>

                {/* Secret Key */}
                <div className="w-full max-w-md">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 text-center">
                    Or enter this key manually:
                  </p>
                  <div className="flex items-center gap-2">
                    <Input
                      value={secretKey}
                      readOnly
                      className="font-mono text-center"
                    />
                    <Button
                      onClick={handleCopySecret}
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 w-full max-w-md">
                  <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2 text-sm">Instructions:</h3>
                  <ol className="space-y-2 text-sm text-slate-600 dark:text-slate-400 list-decimal list-inside">
                    <li>Download an authenticator app (Google Authenticator, Authy, etc.)</li>
                    <li>Open the app and scan the QR code or enter the key</li>
                    <li>Enter the 6-digit code from your app below</li>
                  </ol>
                </div>
              </div>

              <Button
                onClick={() => setStep('verify')}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Continue to Verification
              </Button>
            </div>
          )}

          {step === 'verify' && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-light text-slate-900 dark:text-slate-100 mb-2">Verify Your Code</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Enter the 6-digit code from your {method === 'app' ? 'authenticator app' : method === 'sms' ? 'text message' : 'email'}
                </p>
              </div>

              <div className="max-w-sm mx-auto space-y-6">
                <div>
                  <Input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="text-center text-2xl font-mono tracking-widest"
                    maxLength={6}
                    autoFocus
                  />
                </div>

                <Button
                  onClick={handleVerify}
                  disabled={isVerifying || verificationCode.length !== 6}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isVerifying ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Verifying...
                    </span>
                  ) : (
                    'Verify & Enable 2FA'
                  )}
                </Button>

                <div className="text-center">
                  <button
                    onClick={() => setStep('setup')}
                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  >
                    Didn't receive a code?
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        {step === 'choose' && (
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Two-factor authentication adds an extra layer of security to your account by requiring a code in addition to your password.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
