# Caregiver App - Auto-Sync Integration Instructions

## Overview
The Caresolis Patient Device now has **automatic sync** enabled. The Caregiver App needs to **auto-push** data changes to the backend immediately when they occur.

---

## Implementation Steps

### 1. Install Required Service

Create `/src/services/autoSyncService.ts`:

```typescript
/**
 * Auto-Sync Service for Caregiver App
 * Automatically pushes data to backend when changes occur
 */

import { projectId, publicAnonKey } from '/utils/supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-2a443375`;
const PATIENT_ID = 'patient-001';

class AutoSyncService {
  /**
   * Sync medication schedule
   */
  async syncSchedule(doses: any[], timezone: string = 'America/New_York') {
    console.log('🔄 Auto-syncing medication schedule...', doses.length, 'doses');
    
    const response = await fetch(
      `${BASE_URL}/patient/${PATIENT_ID}/schedule`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ doses, timezone })
      }
    );

    if (!response.ok) {
      throw new Error(`Schedule sync failed: ${response.statusText}`);
    }

    console.log('✅ Schedule synced successfully');
  }

  /**
   * Sync caregiver information
   */
  async syncCaregivers(caregiverData: any) {
    console.log('🔄 Auto-syncing caregiver info...');
    
    const response = await fetch(
      `${BASE_URL}/patient/${PATIENT_ID}/caregivers`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(caregiverData)
      }
    );

    if (!response.ok) {
      throw new Error(`Caregiver sync failed: ${response.statusText}`);
    }

    console.log('✅ Caregivers synced successfully');
  }

  /**
   * Sync medication inventory
   */
  async syncInventory(inventoryData: any) {
    console.log('🔄 Auto-syncing inventory...', inventoryData.compartments.length, 'compartments');
    
    const response = await fetch(
      `${BASE_URL}/patient/${PATIENT_ID}/inventory`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(inventoryData)
      }
    );

    if (!response.ok) {
      throw new Error(`Inventory sync failed: ${response.statusText}`);
    }

    console.log('✅ Inventory synced successfully');
  }
}

export const autoSyncService = new AutoSyncService();
```

---

### 2. Update Medication Schedule Component

Add auto-sync to your medication schedule management:

```typescript
import { autoSyncService } from '../services/autoSyncService';

// After adding/editing/deleting a medication dose:
const handleSaveDose = async (dose: any) => {
  // Save to local state
  const updatedDoses = [...doses, dose];
  setDoses(updatedDoses);
  
  // Auto-sync to backend
  try {
    await autoSyncService.syncSchedule(updatedDoses, timezone);
  } catch (error) {
    console.error('Auto-sync failed:', error);
    // Show error to user
  }
};
```

---

### 3. Update Caregiver Info Component

Add auto-sync when caregiver info changes:

```typescript
import { autoSyncService } from '../services/autoSyncService';

const handleUpdateCaregiver = async (caregiverInfo: any) => {
  // Save to local state
  setCaregiverInfo(caregiverInfo);
  
  // Auto-sync to backend
  try {
    await autoSyncService.syncCaregivers(caregiverInfo);
  } catch (error) {
    console.error('Auto-sync failed:', error);
  }
};
```

---

### 4. Update Inventory Component

Add auto-sync when inventory changes:

```typescript
import { autoSyncService } from '../services/autoSyncService';

const handleUpdateInventory = async (inventory: any) => {
  // Save to local state
  setInventory(inventory);
  
  // Auto-sync to backend
  try {
    await autoSyncService.syncInventory(inventory);
  } catch (error) {
    console.error('Auto-sync failed:', error);
  }
};
```

---

### 5. Add Sync Status Indicator (Optional)

Show users when data is syncing:

```typescript
<div className="flex items-center gap-2 text-green-600">
  <CheckCircle className="w-5 h-5" />
  <span>Synced to Patient Device</span>
</div>
```

---

## Important Notes

✅ **Real-Time Sync**: Patient device auto-refreshes every 30 seconds
✅ **Immediate Push**: CG app should sync on every data change
✅ **Error Handling**: Show sync errors to caregivers
✅ **No Manual Button**: Remove "Sync to Patient Device" button - it's automatic now!
✅ **Backend API**: All endpoints are ready and working

---

## Testing

1. Make a change in CG app (add medication, update schedule, etc.)
2. Wait 30 seconds (or less)
3. Check Patient Device `/sync-status` screen
4. Data should appear automatically!

---

## Troubleshooting

**Issue**: Data not syncing
- Check browser console for errors
- Verify backend is running (check /health endpoint)
- Ensure `publicAnonKey` is correct

**Issue**: "CORS error"
- Backend has CORS enabled, this shouldn't happen
- Check network tab in browser dev tools

**Issue**: "Unauthorized"
- Verify Authorization header includes `Bearer ${publicAnonKey}`

---

## Backend Endpoints

All ready to use:

- `PUT /make-server-2a443375/patient/:patientId/schedule`
- `PUT /make-server-2a443375/patient/:patientId/caregivers`
- `PUT /make-server-2a443375/patient/:patientId/inventory`
- `GET /make-server-2a443375/health` (test backend is running)

---

Last Updated: 3/22/2026
