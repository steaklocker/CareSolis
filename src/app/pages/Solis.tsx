import React, { useState, useEffect } from 'react';
import { useCaresolis } from '../hooks/useCaresolis';
import { usePatient } from '../context/PatientContext';
import { motion, AnimatePresence } from 'motion/react';
import { CloudSun, Check, Lock, UserCheck, Activity, ShieldCheck, X } from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { useNavigate } from 'react-router';
import { CaresolisLogo } from '../components/CaresolisLogo';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9aeac050`;

export default function Solis() {
  const navigate = useNavigate();
  const { statusData, interact, acknowledge, isLoading: isApiLoading, refresh } = useCaresolis();
  const { currentPatient } = usePatient();
  const [now, setNow] = useState(new Date());
  
  // Modal States
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [showUnlock, setShowUnlock] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  
  // Interaction State
  const [isInteracting, setIsInteracting] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const hours = now.getHours();
  
  const getGreeting = () => {
      if (hours < 12) return "Good Morning";
      if (hours < 18) return "Good Afternoon";
      return "Good Evening";
  };

  const rawStatus = statusData?.status || 'pending';
  // Map status to modes
  // Safe: Check-In On Time, Closed, Scheduled (future)
  // Warning: ReminderActive (Grace Period)
  // Danger: EscalationLevel1/2/3, Check-In Not Logged (past grace)
  
  let mode = 'safe';
  if (rawStatus === 'ReminderActive') mode = 'warning';
  if (rawStatus.startsWith('Escalation') || rawStatus === 'Check-In Not Logged') mode = 'danger';
  if (rawStatus === 'Acknowledged') mode = 'warning'; // Or distinct state? Keeping warning for now.

  const handleInteraction = async () => {
      if (isApiLoading || isInteracting) return;
      setIsInteracting(true);
      
      // Simulate "Passive" check-in delay/animation
      setTimeout(async () => {
          await interact();
          setIsInteracting(false);
      }, 1500);
  };

  const handleGuestCheckIn = async () => {
    try {
        const patientId = currentPatient?.id || '1';
        const res = await fetch(`${SERVER_URL}/guest-checkin`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${publicAnonKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ patientId, guestName: guestName || 'Guest' })
        });
        if (res.ok) {
            toast.success("Guest visit recorded.");
            setShowGuestModal(false);
            setGuestName('');
            refresh();
        }
    } catch (e) {
        toast.error("Failed to record visit.");
    }
  };

  const handlePinInput = (digit: string) => {
      if (pin.length < 4) {
          const newPin = pin + digit;
          setPin(newPin);
          if (newPin.length === 4) {
             if (newPin === '1234') {
                 navigate('/');
             } else {
                 setTimeout(() => {
                    setError(true);
                    setPin('');
                    setTimeout(() => setError(false), 500);
                 }, 300);
             }
          }
      }
  };

  // Dynamic Styles based on Mode
  const getGlowColor = () => {
      if (mode === 'warning') return "from-amber-400 via-amber-200 to-amber-400";
      if (mode === 'danger') return "from-rose-500 via-rose-400 to-rose-500";
      return "from-emerald-400 via-yellow-200 to-emerald-400"; // Default "Good Morning" glow
  };

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden font-sans selection:bg-emerald-500/30 flex flex-col relative">
      
      {/* --- Top Glow Bar (Physical Light Simulation) --- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-1 z-50">
           <div className={clsx("w-full h-full rounded-b-full blur-[2px] bg-gradient-to-r", getGlowColor())} />
           <div className={clsx("absolute top-0 inset-x-0 h-16 opacity-40 blur-xl bg-gradient-to-r", getGlowColor())} />
      </div>

      {/* --- Main Content Area --- */}
      <div 
        className="flex-1 flex flex-col items-center justify-center relative z-10 p-8 cursor-pointer"
        onClick={() => {
            if (mode === 'warning') handleInteraction();
        }}
      >
          <AnimatePresence mode="wait">
            
            {/* SAFE / IDLE STATE */}
            {mode === 'safe' && (
                <motion.div 
                    key="safe"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="flex flex-col items-center text-center gap-6"
                >
                    <h1 className="text-6xl font-semibold tracking-tight text-white drop-shadow-md">
                        {getGreeting()}
                    </h1>
                    
                    {/* Divider */}
                    <div className="w-24 h-px bg-gradient-to-r from-transparent via-slate-500 to-transparent my-2" />
                    
                    {/* Weather Widget */}
                    <div className="flex items-center gap-4 text-2xl font-light text-slate-200">
                        <CloudSun className="w-10 h-10 text-yellow-300" />
                        <span className="font-medium">Sunny</span>
                        <Check className="w-6 h-6 text-emerald-400" />
                        <span>72°F</span>
                    </div>
                    
                    {/* Temp Range */}
                    <div className="text-slate-400 font-light text-lg tracking-wide">
                        72° <span className="text-yellow-400 text-xs align-top">+</span> 87°F
                    </div>
                    
                    <div className="mt-8 text-slate-500 text-xl font-medium tracking-wide">
                        {currentPatient?.name || "Mrs. Green"}
                    </div>
                </motion.div>
            )}

            {/* WARNING / GRACE PERIOD STATE */}
            {mode === 'warning' && (
                <motion.div 
                    key="warning"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center text-center gap-8"
                >
                     <div className="relative">
                        <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full animate-pulse" />
                        <Activity className="w-24 h-24 text-amber-400 relative z-10 animate-bounce" />
                     </div>
                     
                     <div className="flex flex-col gap-2">
                        <h1 className="text-5xl font-semibold text-amber-100">
                            {isInteracting ? "Verifying..." : "Time for Routine"}
                        </h1>
                        <p className="text-amber-400/80 text-lg uppercase tracking-widest font-medium">
                            {isInteracting ? "Please wait" : "Passive Check-In Active"}
                        </p>
                     </div>

                     {!isInteracting && (
                         <div className="text-slate-500 text-sm mt-4 animate-pulse">
                             Tap anywhere to check in
                         </div>
                     )}
                </motion.div>
            )}

            {/* DANGER / ESCALATION STATE */}
            {mode === 'danger' && (
                <motion.div 
                    key="danger"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center text-center gap-8"
                >
                     <div className="relative">
                        <div className="absolute inset-0 bg-rose-500/20 blur-3xl rounded-full animate-pulse" />
                        <ShieldCheck className="w-24 h-24 text-rose-400 relative z-10" />
                     </div>
                     
                     <div className="flex flex-col gap-2">
                        <h1 className="text-5xl font-semibold text-rose-100">
                            Check-In Required
                        </h1>
                        <p className="text-rose-400/80 text-lg uppercase tracking-widest font-medium">
                            Escalation Active
                        </p>
                     </div>

                     <button
                        onClick={(e) => { e.stopPropagation(); acknowledge(); }}
                        disabled={isApiLoading}
                        className="mt-8 px-12 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-full text-2xl font-medium shadow-[0_0_30px_rgba(225,29,72,0.4)] transition-all active:scale-95"
                    >
                        {isApiLoading ? "Processing..." : "I'm Okay"}
                    </button>
                </motion.div>
            )}

          </AnimatePresence>
      </div>

      {/* --- Footer Area --- */}
      <div className="relative z-20 pb-10 flex flex-col items-center justify-center gap-6">
          
          {/* Hummingbird Logo */}
          <div className="relative group cursor-pointer" onClick={() => setShowUnlock(true)}>
              <div className="w-12 h-12 text-cyan-400">
                  <CaresolisLogo withText={false} className="w-full h-full" colorClass="fill-cyan-400" />
              </div>
              {/* Secret Admin Hitbox */}
              <div className="absolute inset-0 scale-150" /> 
          </div>

          {/* Bottom Light Indicator */}
          <div className="w-16 h-1 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]" />

      </div>
      
      {/* --- Hidden/Subtle Controls --- */}
      <div className="absolute bottom-8 right-8 z-30">
          <button 
            onClick={() => setShowGuestModal(true)}
            className="p-3 rounded-full text-slate-700 hover:text-slate-500 transition-colors"
          >
              <UserCheck className="w-6 h-6" />
          </button>
      </div>

      {/* --- Modals (Guest & Admin) --- */}
      
      {/* Guest Modal */}
      <AnimatePresence>
        {showGuestModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={(e) => e.stopPropagation()}>
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-lg shadow-2xl"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-light text-white">Guest Visit Log</h2>
                        <button onClick={() => setShowGuestModal(false)} className="text-slate-500 hover:text-white"><X /></button>
                    </div>
                    
                    <input 
                        type="text" 
                        placeholder="Your Name"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-6 py-4 text-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 mb-8"
                        autoFocus
                    />
                    <div className="grid grid-cols-1 gap-4">
                        <button 
                            onClick={handleGuestCheckIn}
                            className="py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium text-lg shadow-lg"
                        >
                            Confirm Visit
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
      
      {/* Admin Unlock Modal */}
      <AnimatePresence>
        {showUnlock && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4" onClick={(e) => e.stopPropagation()}>
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="w-full max-w-md flex flex-col items-center"
                >
                    <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-8">
                        <Lock className="text-slate-400" size={24} />
                    </div>
                    
                    <h2 className="text-xl font-medium text-slate-300 mb-10 tracking-widest uppercase text-xs">Admin Access</h2>
                    
                    {/* PIN Dots */}
                    <div className="flex gap-6 mb-12">
                        {[0, 1, 2, 3].map(i => (
                            <div key={i} className={clsx(
                                "w-3 h-3 rounded-full transition-all duration-300",
                                i < pin.length 
                                    ? error ? "bg-rose-500 scale-110" : "bg-white scale-110" 
                                    : "bg-slate-800"
                            )} />
                        ))}
                    </div>

                    {/* Number Pad */}
                    <div className="grid grid-cols-3 gap-8 w-full max-w-[300px] mb-12">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'del'].map((item, idx) => {
                            if (item === '') return <div key={idx} />;
                            if (item === 'del') return (
                                <button 
                                    key={idx}
                                    onClick={() => setPin(prev => prev.slice(0, -1))}
                                    className="w-20 h-20 flex items-center justify-center text-slate-500 hover:text-white transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            );
                            return (
                                <button 
                                    key={idx}
                                    onClick={() => handlePinInput(item.toString())}
                                    className="w-20 h-20 rounded-full bg-transparent border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-2xl font-light text-white transition-all active:scale-95"
                                >
                                    {item}
                                </button>
                            );
                        })}
                    </div>

                    <button 
                        onClick={() => { setShowUnlock(false); setPin(''); }}
                        className="text-slate-500 hover:text-white transition-colors text-sm tracking-widest uppercase"
                    >
                        Cancel
                    </button>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

    </div>
  );
}