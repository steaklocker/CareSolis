import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";

const locationApp = new Hono();

/**
 * LOCATION & ENVIRONMENTAL DATA ROUTES
 * 
 * Manages location information (city, town, suburb) for environmental monitoring.
 * Location data is displayed in the HomeEnvironmentCard on the Dashboard.
 * 
 * FDA COMPLIANCE: All location updates are logged to audit trail
 */

const LOCATION_KEY = "mds:environment:location:v1";

// Write audit log (helper function)
async function writeLocationAuditLog(action: string, userId: string, details: string) {
    const auditEntry = {
        timestamp: new Date().toISOString(),
        action,
        userId,
        details,
        component: 'location_management'
    };
    
    const auditKey = `mds:audit:location:${Date.now()}:${crypto.randomUUID()}`;
    await kv.set(auditKey, auditEntry);
    console.log(`📋 AUDIT LOG: ${action} - ${details}`);
}

// GET /location - Retrieve current location
locationApp.get("/location", async (c) => {
    try {
        const locationData = await kv.get(LOCATION_KEY) || { location: "" };
        console.log('📍 Location retrieved:', locationData.location || '(not set)');
        return c.json(locationData);
    } catch (e) {
        console.error("❌ Failed to fetch location:", e);
        return c.json({ location: "", error: e.message }, 500);
    }
});

// POST /location - Update location
locationApp.post("/location", async (c) => {
    try {
        const body = await c.req.json();
        
        // Validate location input
        if (typeof body.location !== 'string') {
            return c.json({ error: "Invalid location format" }, 400);
        }
        
        const locationData = {
            location: body.location.trim(),
            updatedAt: new Date().toISOString(),
            updatedBy: body.updatedBy || "admin"
        };
        
        // Store in database
        await kv.set(LOCATION_KEY, locationData);
        
        // FDA COMPLIANCE: Log location update to audit trail
        await writeLocationAuditLog(
            'LOCATION_UPDATE',
            locationData.updatedBy,
            `Location set to: "${locationData.location}" ${locationData.location ? '' : '(cleared)'}`
        );
        
        console.log(`📍 Location updated successfully: "${locationData.location}"`);
        return c.json(locationData);
        
    } catch (e) {
        console.error("❌ Failed to update location:", e);
        return c.json({ error: e.message }, 500);
    }
});

export default locationApp;
