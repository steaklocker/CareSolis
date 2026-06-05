import React, { useState, useEffect } from 'react';
import { MapPin, Save, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9aeac050`;

export function LocationSettings() {
  const [location, setLocation] = useState('');
  const [originalLocation, setOriginalLocation] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  // Load location on mount
  useEffect(() => {
    loadLocation();
  }, []);

  const loadLocation = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/location`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLocation(data.location || '');
        setOriginalLocation(data.location || '');
      }
    } catch (error) {
      console.error('Failed to load location:', error);
      toast.error('Could not load location settings');
    } finally {
      setIsLoading(false);
    }
  };

  const saveLocation = async () => {
    setIsSaving(true);
    
    try {
      const response = await fetch(`${SERVER_URL}/location`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          location,
          updatedBy: 'admin'
        })
      });

      if (response.ok) {
        setOriginalLocation(location);
        setJustSaved(true);
        toast.success(location ? `Location set to: ${location}` : 'Location cleared');
        
        // Reset "just saved" state after 2 seconds
        setTimeout(() => setJustSaved(false), 2000);
      } else {
        toast.error('Failed to save location');
      }
    } catch (error) {
      console.error('Failed to save location:', error);
      toast.error('Network error saving location');
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = location !== originalLocation;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-8 py-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="animate-pulse flex gap-4">
            <div className="h-12 w-12 bg-slate-200 rounded-xl"></div>
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Location & Environment</h2>
              <p className="text-sm text-slate-600">
                Set the household location (city, town, or suburb) for environmental monitoring display
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-2">
              Location
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Portland, OR or Beacon Hill, Boston"
              className={clsx(
                "w-full px-4 py-2.5 border rounded-lg transition-all",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                "placeholder:text-slate-400",
                hasChanges 
                  ? "border-blue-300 bg-blue-50/50" 
                  : "border-slate-300 bg-white"
              )}
            />
            <p className="mt-2 text-xs text-slate-500">
              This location will appear in the Environment card on the dashboard
            </p>
          </div>

          {/* Example Formats */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs font-medium text-slate-700 mb-2">Example formats:</p>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• "Portland, Oregon"</li>
              <li>• "Beacon Hill, Boston, MA"</li>
              <li>• "Palm Springs, CA"</li>
              <li>• "Greenwich Village, NYC"</li>
            </ul>
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={saveLocation}
              disabled={!hasChanges || isSaving}
              className={clsx(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all",
                hasChanges && !isSaving
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed",
                justSaved && "bg-emerald-600 hover:bg-emerald-600"
              )}
            >
              {justSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved!
                </>
              ) : isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Location
                </>
              )}
            </button>
            
            {hasChanges && !isSaving && (
              <span className="text-sm text-slate-500">
                Unsaved changes
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
