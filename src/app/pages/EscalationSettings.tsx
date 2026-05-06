import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useCaresolis } from '../hooks/useCaresolis';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useDrag, useDrop } from 'react-dnd';
import { 
  ShieldAlert, Moon, Calendar, User, Building, GripVertical, Check, AlertTriangle, Clock, Stethoscope, Briefcase, PlayCircle, Activity, Pencil, Trash2, Plus, UserPlus, Phone, Mail, Thermometer, Wind, Droplets
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { Switch } from '../components/ui/switch';
import { Button } from '../components/ui/button';
import { Slider } from '../components/ui/slider';
import { cn } from '../components/ui/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '../components/ui/dialog';

const ItemType = 'ESCALATION_CONTACT';

// Draggable Contact Component
const DraggableContact = ({ 
  contact, 
  index, 
  moveContact,
  isCareMode,
  onEdit,
  onDelete
}: {
  contact: any;
  index: number;
  moveContact: (dragIndex: number, hoverIndex: number) => void;
  isCareMode: boolean;
  onEdit: (contact: any) => void;
  onDelete: (id: string) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const [{ handlerId }, drop] = useDrop({
    accept: ItemType,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: any, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset as any).y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveContact(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { id: contact.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <motion.div
      ref={ref}
      layout
      data-handler-id={handlerId}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center gap-4 p-4 bg-white dark:bg-slate-900 border rounded-xl transition-all group",
        isDragging ? "opacity-50 border-emerald-200 dark:border-emerald-800 shadow-md scale-[1.02]" : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 shadow-sm"
      )}
    >
      <div className="cursor-grab text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 active:cursor-grabbing p-1">
        <GripVertical size={20} />
      </div>

      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-xs shrink-0">
        {index + 1}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-slate-900 dark:text-slate-100 truncate">{contact.name}</h4>
        <div className="flex items-center gap-2 text-xs text-slate-500">
           <span className="uppercase tracking-wide">{contact.role}</span>
           <span className="hidden sm:inline text-slate-300">•</span>
           <span className="hidden sm:inline truncate">{contact.phone}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-sm text-slate-500 hidden sm:block">
            {index === 0 ? (
            <span className="flex items-center gap-1 text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                <ShieldAlert size={14} /> Level 1
            </span>
            ) : (
            <span className="whitespace-nowrap">+{15 * index}m delay</span>
            )}
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
                onClick={() => onEdit(contact)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                title="Edit Contact"
            >
                <Pencil size={16} />
            </button>
            <button 
                onClick={() => onDelete(contact.id)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Remove Contact"
            >
                <Trash2 size={16} />
            </button>
        </div>
      </div>
    </motion.div>
  );
};

export default function EscalationSettings() {
  const { settings, updateSettings, contacts, addContact, updateContact, deleteContact } = useCaresolis();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Settings State
  const [gracePeriod, setGracePeriod] = useState("30");
  const [holidayMode, setHolidayMode] = useState(false);
  const [resumeDate, setResumeDate] = useState("");
  const [careMode, setCareMode] = useState(false); // Professional Care Mode
  const [quietHours, setQuietHours] = useState(false);
  const [driftThreshold, setDriftThreshold] = useState(15);
  // Environment State
  const [tempMin, setTempMin] = useState(65);
  const [tempMax, setTempMax] = useState(80);
  const [airQualityAlerts, setAirQualityAlerts] = useState(true);
  
  // Contacts State
  const [orderedContacts, setOrderedContacts] = useState<any[]>([]);
  const initialized = useRef(false);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  const [contactForm, setContactForm] = useState({
      name: '',
      role: '',
      phone: '',
      email: '',
      priority: 99
  });

  // Initialize Settings
  useEffect(() => {
    if (settings) {
      setGracePeriod(settings.gracePeriod || "30");
      setHolidayMode(settings.holidayMode || false);
      setResumeDate(settings.resumeDate || "");
      setCareMode(settings.careMode || false);
      setQuietHours(settings.quietHours || false);
      setDriftThreshold(settings.driftThreshold || 15);
      setTempMin(settings.tempMin || 65);
      setTempMax(settings.tempMax || 80);
      setAirQualityAlerts(settings.airQualityAlerts !== undefined ? settings.airQualityAlerts : true);
    }
  }, [settings]);

  // Initialize Contacts Order
  useEffect(() => {
    // If settings has an order, use it. Otherwise use contacts default order.
    if (contacts.length > 0 && !initialized.current) {
       let sorted = contacts;
       if (settings?.escalationOrder && Array.isArray(settings.escalationOrder)) {
            sorted = [...contacts].sort((a, b) => {
                const indexA = settings.escalationOrder.indexOf(a.id);
                const indexB = settings.escalationOrder.indexOf(b.id);
                return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
            });
       }
       setOrderedContacts(sorted);
       initialized.current = true;
    } else if (contacts.length > 0) {
        // If we have initialized, but contacts changed (added/removed), we need to respect that too
        // but try to keep current order if possible.
        // For simplicity, just re-syncing to contacts if length differs significantly or if we just added one.
        // But drag-and-drop modifies orderedContacts locally. 
        // We only want to re-sync if the source changed from outside (e.g. add/delete).
        
        // Simple sync strategy: maintain local order, append new ones at end.
        const currentIds = new Set(orderedContacts.map(c => c.id));
        const newContacts = contacts.filter(c => !currentIds.has(c.id));
        const removedIds = new Set(contacts.map(c => c.id));
        
        let next = orderedContacts.filter(c => removedIds.has(c.id)); // Remove deleted
        if (newContacts.length > 0) {
            next = [...next, ...newContacts];
        }
        
        if (next.length !== orderedContacts.length || newContacts.length > 0) {
            setOrderedContacts(next);
        }
    }
  }, [contacts, settings]);

  const moveContact = useCallback((dragIndex: number, hoverIndex: number) => {
    setOrderedContacts((prev) => {
      const newContacts = [...prev];
      const [dragged] = newContacts.splice(dragIndex, 1);
      newContacts.splice(hoverIndex, 0, dragged);
      return newContacts;
    });
  }, []);

  const handleTestEscalation = () => {
    toast.info("Initiating test escalation sequence...", { duration: 3000 });
    setTimeout(() => {
      toast.success("Test alert sent to Escalation Contact 1.");
      if (careMode) {
        toast.info("Facility Console alerted.");
      }
    }, 1500);
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    const newSettings = {
      ...settings,
      gracePeriod,
      holidayMode,
      resumeDate,
      careMode,
      quietHours,
      driftThreshold,
      tempMin,
      tempMax,
      airQualityAlerts,
      escalationOrder: orderedContacts.map(c => c.id)
    };
    await updateSettings(newSettings);
    setLoading(false);
  };

  // Contact Handlers
  const handleAddClick = () => {
      setEditingContact(null);
      setContactForm({
          name: '',
          role: 'Emergency Contact',
          phone: '',
          email: '',
          priority: orderedContacts.length + 1
      });
      setIsEditOpen(true);
  };

  const handleEditClick = (contact: any) => {
      setEditingContact(contact);
      setContactForm({
          name: contact.name,
          role: contact.role,
          phone: contact.phone,
          email: contact.email,
          priority: contact.priority
      });
      setIsEditOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
      if (confirm('Are you sure you want to remove this contact?')) {
          await deleteContact(id);
      }
  };

  const handleFormSubmit = async () => {
      if (!contactForm.name || !contactForm.phone) {
          toast.error("Name and phone are required");
          return;
      }

      if (editingContact) {
          await updateContact({ ...editingContact, ...contactForm });
      } else {
          await addContact(contactForm);
      }
      setIsEditOpen(false);
  };

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-slate-900 dark:text-slate-100 tracking-tight">Escalation Protocols</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-light">Manage trusted contacts and system responses</p>
      </div>

      <div className="space-y-8">
        
        {/* Status / Holiday Mode */}
        <section className={cn(
            "rounded-2xl p-6 border transition-all duration-300",
            holidayMode 
              ? "bg-amber-50 border-amber-200 shadow-sm" 
              : "bg-white border-slate-100 shadow-sm"
        )}>
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className={cn(
                  "p-3 rounded-xl transition-colors",
                  holidayMode ? "bg-amber-100 text-amber-700" : "bg-emerald-50 text-emerald-600"
              )}>
                 {holidayMode ? <Moon size={24} /> : <ShieldAlert size={24} />}
              </div>
              <div>
                <h3 className={cn("text-lg font-medium", holidayMode ? "text-amber-900" : "text-slate-900")}>
                  {holidayMode ? "Monitoring Suspended" : "System Active"}
                </h3>
                <p className={cn("text-sm mt-1", holidayMode ? "text-amber-700" : "text-slate-500")}>
                  {holidayMode 
                    ? "Escalations are paused. The system is in Holiday Mode." 
                    : "Routine monitoring is active. Missed check-ins will trigger alerts."}
                </p>
                
                {holidayMode && (
                  <div className="mt-4 flex items-center gap-2">
                    <label className="text-sm font-medium text-amber-800">Resume on:</label>
                    <input 
                      type="date" 
                      value={resumeDate}
                      onChange={(e) => setResumeDate(e.target.value)}
                      className="bg-white border border-amber-300 text-amber-900 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                )}
              </div>
            </div>
            <Switch 
              checked={holidayMode} 
              onCheckedChange={setHolidayMode}
              className="data-[state=checked]:bg-amber-500"
            />
          </div>
        </section>

        {/* Care Context (Professional/Nurse) */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
           <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 h-fit">
                  <Stethoscope size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Professional Care Context</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                    Optimizes the system for lived-in nurse environments or care facilities.
                  </p>
                </div>
              </div>
              <Switch 
                checked={careMode} 
                onCheckedChange={setCareMode}
                className="data-[state=checked]:bg-blue-600"
              />
           </div>

           <AnimatePresence>
             {careMode && (
               <motion.div 
                 initial={{ opacity: 0, height: 0 }}
                 animate={{ opacity: 1, height: 'auto' }}
                 exit={{ opacity: 0, height: 0 }}
                 className="overflow-hidden"
               >
                 <div className="pt-4 border-t border-slate-100 pl-[4.5rem] space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-slate-900 block">Quiet Hours</label>
                        <p className="text-xs text-slate-500">Suppress device audio alerts to respect shared spaces.</p>
                      </div>
                      <Switch checked={quietHours} onCheckedChange={setQuietHours} />
                    </div>
                    
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 flex gap-3">
                      <Briefcase className="text-blue-600 shrink-0" size={18} />
                      <p className="text-xs text-blue-800 leading-relaxed">
                        <strong>Facility Mode Active:</strong> A "Care Staff" console entry has been added to the top of your escalation chain automatically.
                      </p>
                    </div>
                 </div>
               </motion.div>
             )}
           </AnimatePresence>
        </section>

        {/* Environmental Safety Triggers */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                   <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 h-fit">
                       <Thermometer size={24} />
                   </div>
                   <div>
                       <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Environmental Safety</h3>
                       <p className="text-sm text-slate-500 dark:text-slate-400">Trigger alerts if home conditions become unsafe.</p>
                   </div>
              </div>
              <Switch 
                checked={airQualityAlerts} 
                onCheckedChange={setAirQualityAlerts}
                className="data-[state=checked]:bg-orange-500"
              />
           </div>
           
           <div className="pl-[4.5rem] space-y-6 pt-2">
               {/* Temperature Range */}
               <div className="space-y-3">
                   <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-slate-700">Safe Temperature Range</label>
                        <span className="text-sm font-semibold text-orange-600">{tempMin}°F - {tempMax}°F</span>
                   </div>
                   <Slider 
                       value={[tempMin, tempMax]} 
                       min={50} 
                       max={95} 
                       step={1} 
                       onValueChange={(vals) => {
                           setTempMin(vals[0]);
                           setTempMax(vals[1]);
                       }}
                       className="w-full"
                   />
                   <div className="flex justify-between text-xs text-slate-400 font-medium">
                       <span>50°F</span>
                       <span>95°F</span>
                   </div>
               </div>

               {/* Air Quality Toggle Detail */}
               <div className={cn(
                   "p-3 rounded-lg border flex gap-3 transition-colors",
                   airQualityAlerts ? "bg-orange-50/50 border-orange-100" : "bg-slate-50 border-slate-100"
               )}>
                   <Wind className={cn("shrink-0", airQualityAlerts ? "text-orange-500" : "text-slate-400")} size={18} />
                   <div className="space-y-1">
                       <span className={cn("text-sm font-medium block", airQualityAlerts ? "text-orange-900" : "text-slate-500")}>
                           Air Quality Monitoring {airQualityAlerts ? "Active" : "Paused"}
                       </span>
                       <p className="text-xs text-slate-500 leading-relaxed">
                           {airQualityAlerts 
                               ? "Escalation contacts will be notified if Indoor Air Quality (IAQ) drops to 'Poor' for more than 2 hours." 
                               : "Air quality alerts are currently disabled."}
                       </p>
                   </div>
               </div>
           </div>
        </section>

        {/* Analytics Thresholds */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
           <div className="flex items-center gap-4 mb-2">
               <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 h-fit">
                   <Activity size={24} />
               </div>
               <div>
                   <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Routine Analytics</h3>
                   <p className="text-sm text-slate-500 dark:text-slate-400">Define sensitivity for routine drift detection.</p>
               </div>
           </div>
           
           <div className="pl-[4.5rem]">
               <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-slate-700">Late Threshold</label>
                    <span className="text-sm font-semibold text-purple-600">{driftThreshold} min</span>
               </div>
               <Slider 
                   value={[driftThreshold]} 
                   min={5} 
                   max={60} 
                   step={5} 
                   onValueChange={(vals) => setDriftThreshold(vals[0])}
                   className="w-full mb-2"
               />
               <p className="text-xs text-slate-400">
                   Check-ins delayed by more than {driftThreshold} minutes will be marked as "Significant Drift".
               </p>
           </div>
        </section>

        {/* Escalation Chain */}
        <section className="space-y-4">
           <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Escalation Chain</h3>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Grace Period:</span>
              <select 
                value={gracePeriod}
                onChange={(e) => setGracePeriod(e.target.value)}
                className="bg-white border border-slate-200 text-slate-900 text-sm rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">60 min</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
             {careMode && (
               <div className="flex items-center gap-4 p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                  <div className="text-blue-300 p-1"><Briefcase size={20} /></div>
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">1</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900">On-Site Care Staff</h4>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Facility Console</p>
                  </div>
                  <div className="text-sm text-blue-600 font-medium px-2 py-0.5 bg-blue-100 rounded-full">
                    Immediate
                  </div>
               </div>
             )}

             <AnimatePresence>
                {orderedContacts.map((contact, index) => (
                  <DraggableContact 
                    key={contact.id || index}
                    contact={contact} 
                    index={index}
                    moveContact={moveContact}
                    isCareMode={careMode}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                  />
                ))}
             </AnimatePresence>
             
             {/* Add Contact Button */}
             <button
               onClick={handleAddClick}
               className="w-full py-4 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center gap-2 text-slate-500 font-medium hover:border-emerald-200 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all"
             >
               <UserPlus size={20} />
               <span>Add Trusted Contact</span>
             </button>
          </div>
          
          <p className="text-xs text-slate-400 px-2 flex items-center gap-1">
            <AlertTriangle size={12} />
            Drag to reorder. Contacts are notified in sequence if no response is received.
          </p>
        </section>

        {/* Actions */}
        <div className="flex items-center justify-between pt-8 border-t border-slate-200">
           <Button 
            variant="outline"
            onClick={handleTestEscalation} 
            className="text-slate-600 border-slate-200 hover:bg-slate-50 gap-2"
           >
            <PlayCircle size={18} />
            Test Escalation
           </Button>

           <Button 
            onClick={handleSaveSettings} 
            disabled={loading}
            className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-6 rounded-xl text-lg shadow-lg"
           >
            {loading ? 'Saving...' : 'Update Protocols'}
           </Button>
        </div>

      </div>

      {/* Edit/Add Contact Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingContact ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
            <DialogDescription>
              {editingContact ? 'Update contact details.' : 'Add a trusted person to the escalation chain.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right text-sm font-medium text-slate-500">
                Name
              </label>
              <input
                id="name"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                className="col-span-3 flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Jane Doe"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="role" className="text-right text-sm font-medium text-slate-500">
                Role
              </label>
              <input
                id="role"
                value={contactForm.role}
                onChange={(e) => setContactForm({ ...contactForm, role: e.target.value })}
                className="col-span-3 flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Daughter, Neighbor, etc."
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="phone" className="text-right text-sm font-medium text-slate-500">
                Phone
              </label>
              <input
                id="phone"
                value={contactForm.phone}
                onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                className="col-span-3 flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="email" className="text-right text-sm font-medium text-slate-500">
                Email
              </label>
              <input
                id="email"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                className="col-span-3 flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="email@example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleFormSubmit} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {editingContact ? 'Save Changes' : 'Add Contact'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}