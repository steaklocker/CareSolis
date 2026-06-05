import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Wifi, Smartphone, Check, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function DeviceBindingSection() {
  const [step, setStep] = useState<'search' | 'found' | 'binding' | 'success'>('search');
  const [method, setMethod] = useState<'scan' | 'manual'>('scan');
  const [deviceIdInput, setDeviceIdInput] = useState('');

  // Simulate device search
  React.useEffect(() => {
    if (step === 'search' && method === 'scan') {
      const timer = setTimeout(() => {
        setStep('found');
      }, 3000);
      return () => clearTimeout(timer);
    }
    if (step === 'binding') {
        const timer = setTimeout(() => {
            setStep('success');
            toast.success("Device paired successfully");
        }, 2000);
        return () => clearTimeout(timer);
    }
  }, [step, method]);

  const handleManualBind = () => {
    if (deviceIdInput.length >= 10) {
        setStep('binding');
    } else {
        toast.error("Please enter a valid device ID");
    }
  };

  return (
    <div className=\"max-w-xl mx-auto space-y-6 py-8\">
      <div className=\"bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 text-center min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden\">
        
        {/* Toggle Method */}
        {step !== 'success' && step !== 'binding' && (
             <div className=\"absolute top-4 right-4 flex gap-2\">
                 <button 
                    onClick={() => { setMethod('scan'); setStep('search'); }}
                    className={`text-xs font-medium px-3 py-1 rounded-full border transition-colors ${method === 'scan' ? 'bg-slate-900 dark:bg-slate-700 text-white border-slate-900 dark:border-slate-700' : 'text-slate-600 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                 >
                    Auto-Scan
                 </button>
                 <button 
                    onClick={() => { setMethod('manual'); setStep('search'); }}
                    className={`text-xs font-medium px-3 py-1 rounded-full border transition-colors ${method === 'manual' ? 'bg-slate-900 dark:bg-slate-700 text-white border-slate-900 dark:border-slate-700' : 'text-slate-600 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                 >
                    Manual ID
                 </button>
             </div>
        )}

        {step === 'search' && method === 'scan' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className=\"flex flex-col items-center\">
                <div className=\"relative mb-6\">
                    <div className=\"absolute inset-0 bg-emerald-100 dark:bg-emerald-900/50 rounded-full animate-ping opacity-75\"></div>
                    <div className=\"relative bg-emerald-50 dark:bg-emerald-900/30 p-6 rounded-full\">
                        <Wifi className=\"w-10 h-10 text-emerald-600 dark:text-emerald-400 animate-pulse\" />
                    </div>
                </div>
                <h3 className=\"text-lg font-medium text-slate-900 dark:text-slate-100\">Searching for Devices...</h3>
                <p className=\"text-slate-600 dark:text-slate-300 mt-2 max-w-xs\">Please ensure your Caresolis Hub is plugged in and in pairing mode (blue light flashing).</p>
            </motion.div>
        )}

        {step === 'search' && method === 'manual' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className=\"flex flex-col items-center w-full max-w-xs\">
                <div className=\"bg-slate-50 dark:bg-slate-800 p-4 rounded-full mb-6\">
                    <Smartphone className=\"w-10 h-10 text-slate-700 dark:text-slate-300\" />
                </div>
                <h3 className=\"text-lg font-medium text-slate-900 dark:text-slate-100 mb-4\">Enter Device ID</h3>
                <Input 
                    type=\"text\" 
                    placeholder=\"CS-XXXX-XXXX\"
                    value={deviceIdInput}
                    onChange={(e) => setDeviceIdInput(e.target.value.toUpperCase())}
                    className=\"text-center font-mono mb-4\"
                />
                <Button onClick={handleManualBind} className=\"w-full\">
                    Pair Device
                </Button>
                <p className=\"text-xs text-slate-500 dark:text-slate-400 mt-4\">Find the Device ID on the bottom of your Caresolis Hub</p>
            </motion.div>
        )}

        {step === 'found' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className=\"flex flex-col items-center\">
                <div className=\"bg-emerald-50 dark:bg-emerald-900/30 p-6 rounded-full mb-6\">
                    <CheckCircle2 className=\"w-10 h-10 text-emerald-600 dark:text-emerald-400\" />
                </div>
                <h3 className=\"text-lg font-medium text-slate-900 dark:text-slate-100 mb-2\">Device Found!</h3>
                <div className=\"bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mb-6 w-full max-w-xs\">
                    <div className=\"text-sm space-y-2 text-left\">
                        <div className=\"flex justify-between\">
                            <span className=\"text-slate-500 dark:text-slate-400\">Model:</span>
                            <span className=\"font-medium text-slate-900 dark:text-slate-100\">Caresolis Hub v2</span>
                        </div>
                        <div className=\"flex justify-between\">
                            <span className=\"text-slate-500 dark:text-slate-400\">ID:</span>
                            <span className=\"font-mono text-sm text-slate-900 dark:text-slate-100\">CS-8A4F-92B1</span>
                        </div>
                        <div className=\"flex justify-between\">
                            <span className=\"text-slate-500 dark:text-slate-400\">Signal:</span>
                            <span className=\"text-emerald-600 dark:text-emerald-400\">Strong (-58 dBm)</span>
                        </div>
                    </div>
                </div>
                <Button onClick={() => setStep('binding')} className=\"w-full max-w-xs\">
                    Bind This Device
                </Button>
            </motion.div>
        )}

        {step === 'binding' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className=\"flex flex-col items-center\">
                <Loader2 className=\"w-12 h-12 text-emerald-600 dark:text-emerald-400 animate-spin mb-6\" />
                <h3 className=\"text-lg font-medium text-slate-900 dark:text-slate-100\">Binding Device...</h3>
                <p className=\"text-slate-500 dark:text-slate-400 mt-2\">Establishing secure connection</p>
            </motion.div>
        )}

        {step === 'success' && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: \"spring\", duration: 0.5 }}
                className=\"flex flex-col items-center\"
            >
                <div className=\"relative mb-6\">
                    <div className=\"absolute inset-0 bg-emerald-100 dark:bg-emerald-900/50 rounded-full animate-pulse\"></div>
                    <div className=\"relative bg-emerald-500 dark:bg-emerald-600 p-6 rounded-full shadow-lg shadow-emerald-200 dark:shadow-emerald-900/50\">
                        <Check className=\"w-12 h-12 text-white\" />
                    </div>
                </div>
                <h3 className=\"text-xl font-medium text-slate-900 dark:text-slate-100 mb-2\">Device Paired Successfully!</h3>
                <p className=\"text-slate-500 dark:text-slate-400 mb-6\">Your Caresolis Hub is now connected and monitoring</p>
                <div className=\"bg-slate-50 dark:bg-slate-800 rounded-lg p-4 w-full max-w-xs mb-6\">
                    <div className=\"text-sm space-y-2\">
                        <div className=\"flex items-center gap-2 text-emerald-600 dark:text-emerald-400\">
                            <Check size={16} />
                            <span>Secure connection established</span>
                        </div>
                        <div className=\"flex items-center gap-2 text-emerald-600 dark:text-emerald-400\">
                            <Check size={16} />
                            <span>Sensors calibrated</span>
                        </div>
                        <div className=\"flex items-center gap-2 text-emerald-600 dark:text-emerald-400\">
                            <Check size={16} />
                            <span>Ready for monitoring</span>
                        </div>
                    </div>
                </div>
                <Button onClick={() => setStep('search')} variant=\"outline\" className=\"w-full max-w-xs\">
                    Pair Another Device
                </Button>
            </motion.div>
        )}
      </div>

      {/* Help Section */}
      <div className=\"bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 p-6\">
        <h4 className=\"font-medium text-slate-900 dark:text-slate-100 mb-3\">Need Help?</h4>
        <ul className=\"space-y-2 text-sm text-slate-600 dark:text-slate-400\">
          <li>• Ensure your hub is powered on and the blue pairing LED is flashing</li>
          <li>• The hub must be within 30 feet of your WiFi router</li>
          <li>• Manual pairing requires the Device ID found on the bottom label</li>
          <li>• Contact support if pairing fails after multiple attempts</li>
        </ul>
      </div>
    </div>
  );
}