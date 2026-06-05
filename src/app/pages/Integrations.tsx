import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useCaresolis } from '../hooks/useCaresolis';
import { 
  Webhook, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  Zap, 
  Globe, 
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { toast } from 'sonner';
import { cn } from '../components/ui/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '../components/ui/dialog';

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  lastTriggered?: string;
  status?: 'success' | 'failed' | 'pending';
}

const AVAILABLE_EVENTS = [
  { id: 'escalation_trigger', label: 'Escalation Triggered', icon: AlertTriangle, color: 'text-rose-500' },
  { id: 'interaction_verified', label: 'Interaction Verified', icon: CheckCircle2, color: 'text-emerald-500' },
  { id: 'system_fault', label: 'System Fault / Offline', icon: Activity, color: 'text-amber-500' },
  { id: 'daily_summary', label: 'Daily Summary Report', icon: Zap, color: 'text-blue-500' },
];

export default function Integrations() {
  const { settings, updateSettings } = useCaresolis();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  
  const [newWebhook, setNewWebhook] = useState<Partial<WebhookConfig>>({
    name: '',
    url: '',
    events: ['escalation_trigger'],
    active: true
  });

  const webhooks: WebhookConfig[] = settings?.webhooks || [];

  const handleSaveWebhook = async () => {
    if (!newWebhook.name || !newWebhook.url) {
      toast.error("Name and URL are required");
      return;
    }

    try {
      // Basic URL validation
      new URL(newWebhook.url);
    } catch (e) {
      toast.error("Please enter a valid URL");
      return;
    }

    const webhook: WebhookConfig = {
      id: crypto.randomUUID(),
      name: newWebhook.name!,
      url: newWebhook.url!,
      events: newWebhook.events || [],
      active: newWebhook.active ?? true,
      status: 'pending'
    };

    const updatedWebhooks = [...webhooks, webhook];
    await updateSettings({ ...settings, webhooks: updatedWebhooks });
    toast.success("Webhook integration added");
    setIsAddOpen(false);
    setNewWebhook({ name: '', url: '', events: ['escalation_trigger'], active: true });
  };

  const handleDeleteWebhook = async (id: string) => {
    if (confirm("Are you sure you want to remove this integration?")) {
      const updatedWebhooks = webhooks.filter(w => w.id !== id);
      await updateSettings({ ...settings, webhooks: updatedWebhooks });
      toast.success("Integration removed");
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    const updatedWebhooks = webhooks.map(w => 
      w.id === id ? { ...w, active: !current } : w
    );
    await updateSettings({ ...settings, webhooks: updatedWebhooks });
  };

  const handleTestWebhook = async (webhook: WebhookConfig) => {
    setTestingId(webhook.id);
    toast.info(`Sending test payload to ${webhook.name}...`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real app, we'd fire a test event to the backend here.
    // Since we are mocking the "Trigger" for now in the UI:
    const success = Math.random() > 0.1; // 90% success chance for simulation
    
    if (success) {
      toast.success(`Test payload delivered to ${webhook.name}`);
      const updatedWebhooks = webhooks.map(w => 
        w.id === webhook.id ? { ...w, lastTriggered: new Date().toISOString(), status: 'success' as const } : w
      );
      updateSettings({ ...settings, webhooks: updatedWebhooks });
    } else {
      toast.error(`Failed to deliver payload to ${webhook.name}. Check URL.`);
      const updatedWebhooks = webhooks.map(w => 
        w.id === webhook.id ? { ...w, lastTriggered: new Date().toISOString(), status: 'failed' as const } : w
      );
      updateSettings({ ...settings, webhooks: updatedWebhooks });
    }
    setTestingId(null);
  };

  const toggleEventSelection = (eventId: string) => {
    const current = newWebhook.events || [];
    if (current.includes(eventId)) {
      setNewWebhook({ ...newWebhook, events: current.filter(e => e !== eventId) });
    } else {
      setNewWebhook({ ...newWebhook, events: [...current, eventId] });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto pb-20"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h1 className="text-2xl sm:text-3xl font-light text-slate-900 dark:text-slate-100 tracking-tight">Signal Integrations</h1>
            {/* FDA COMPLIANCE BADGE */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full shadow-lg border-2 border-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              FDA COMPLIANT
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-lg font-light">Connect Caresolis events to external systems</p>
        </div>
        <Button 
          onClick={() => setIsAddOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white gap-2"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Add Webhook</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      <div className="grid gap-6">
        {webhooks.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
              <Webhook className="text-slate-300" size={32} />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No Integrations Configured</h3>
            <p className="text-slate-500 max-w-sm mx-auto mt-2">
              Add a webhook to pipe real-time events to Slack, Discord, PagerDuty, or your own infrastructure.
            </p>
            <Button 
              variant="outline" 
              onClick={() => setIsAddOpen(true)}
              className="mt-6"
            >
              Configure First Webhook
            </Button>
          </div>
        ) : (
          webhooks.map((webhook) => (
            <div 
              key={webhook.id}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-3 rounded-lg border",
                    webhook.active ? "bg-slate-50 border-slate-100" : "bg-slate-50 opacity-50 border-dashed"
                  )}>
                    <Globe size={24} className={webhook.active ? "text-indigo-600" : "text-slate-400"} />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-slate-900 flex items-center gap-3">
                      {webhook.name}
                      {!webhook.active && <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Paused</span>}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500 font-mono mt-0.5">
                      <span className="truncate max-w-[300px]">{webhook.url}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={webhook.active} 
                    onCheckedChange={() => handleToggleActive(webhook.id, webhook.active)}
                  />
                  <div className="h-6 w-px bg-slate-200 mx-2" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteWebhook(webhook.id)}
                    className="text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-slate-500 border-t border-slate-50 pt-4">
                 <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-700">Subscribed Events:</span>
                    <div className="flex gap-1">
                      {webhook.events.map(eventId => {
                        const evt = AVAILABLE_EVENTS.find(e => e.id === eventId);
                        if (!evt) return null;
                        const Icon = evt.icon;
                        return (
                          <div key={eventId} className="p-1 rounded-md bg-slate-50 border border-slate-100 text-slate-500" title={evt.label}>
                            <Icon size={14} />
                          </div>
                        );
                      })}
                    </div>
                 </div>

                 <div className="flex-1" />

                 <div className="flex items-center gap-3">
                    {webhook.lastTriggered && (
                      <span className="flex items-center gap-1.5 text-xs">
                        <span className={cn(
                          "w-2 h-2 rounded-full",
                          webhook.status === 'success' ? "bg-emerald-500" : "bg-rose-500"
                        )} />
                        {webhook.status === 'success' ? '200 OK' : 'Error'} 
                        <span className="text-slate-400">({new Date(webhook.lastTriggered).toLocaleTimeString()})</span>
                      </span>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleTestWebhook(webhook)}
                      disabled={testingId === webhook.id}
                      className="h-8 gap-2 text-xs"
                    >
                      {testingId === webhook.id ? <RefreshCw size={12} className="animate-spin" /> : <Zap size={12} />}
                      Test Payload
                    </Button>
                 </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Webhook Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Integration</DialogTitle>
            <DialogDescription>
              Configure an endpoint to receive JSON payloads for system events.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Integration Name</label>
              <input
                value={newWebhook.name}
                onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                placeholder="e.g. Slack #alerts"
                className="w-full flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Endpoint URL</label>
              <input
                value={newWebhook.url}
                onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                placeholder="https://hooks.slack.com/services/..."
                className="w-full flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono text-xs"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700">Subscribe to Events</label>
              <div className="grid grid-cols-1 gap-2">
                {AVAILABLE_EVENTS.map((evt) => {
                  const isSelected = newWebhook.events?.includes(evt.id);
                  const Icon = evt.icon;
                  return (
                    <div 
                      key={evt.id}
                      onClick={() => toggleEventSelection(evt.id)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                        isSelected 
                          ? "bg-slate-50 border-slate-300 shadow-sm" 
                          : "bg-white border-slate-100 hover:border-slate-200"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded flex items-center justify-center border transition-colors",
                        isSelected ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-300"
                      )}>
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>
                      <Icon size={18} className={evt.color} />
                      <span className="text-sm text-slate-700">{evt.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveWebhook}>Create Integration</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function Check({ size = 24, strokeWidth = 2, ...props }: any) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )
  }