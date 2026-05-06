/**
 * Location Synchronization Utility for CareSolis
 * 
 * Integrates with TimeSync to provide:
 * 1. Cached location data to avoid repeated API calls
 * 2. Timezone-aware location management
 * 3. Geolocation fallback with IP-based lookup
 * 4. Environmental monitoring integration
 */

import { getTimeSync } from './timeSync';

export interface LocationData {
  city: string;
  state: string;
  country: string;
  timezone: string;
  latitude: number;
  longitude: number;
  lastUpdated: number;
  source: 'gps' | 'ip' | 'manual' | 'cached';
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  description: string;
  icon: string;
  lastUpdated: number;
}

class LocationSync {
  private locationData: LocationData | null = null;
  private weatherData: WeatherData | null = null;
  private listeners: Set<(location: LocationData) => void> = new Set();
  private readonly CACHE_KEY = 'caresolis_location_cache';
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    // Load cached location on initialization
    this.loadFromCache();
  }

  /**
   * Get current location with caching and fallback strategies
   */
  async getLocation(forceRefresh: boolean = false): Promise<LocationData> {
    // Return cached location if valid and not forcing refresh
    if (!forceRefresh && this.locationData && this.isCacheValid()) {
      console.log('📍 LocationSync: Using cached location', this.locationData);
      return this.locationData;
    }

    console.log('📍 LocationSync: Fetching new location...');

    try {
      // Strategy 1: Try browser geolocation API first
      const gpsLocation = await this.getGPSLocation();
      if (gpsLocation) {
        await this.updateLocation(gpsLocation);
        return gpsLocation;
      }
    } catch (error) {
      console.warn('📍 LocationSync: GPS location failed, trying IP lookup', error);
    }

    try {
      // Strategy 2: Fall back to IP-based geolocation
      const ipLocation = await this.getIPLocation();
      if (ipLocation) {
        await this.updateLocation(ipLocation);
        return ipLocation;
      }
    } catch (error) {
      console.error('📍 LocationSync: IP location failed', error);
    }

    // Strategy 3: Use TimeSync timezone as fallback
    const timeSyncLocation = this.getTimezoneBasedLocation();
    if (timeSyncLocation) {
      await this.updateLocation(timeSyncLocation);
      return timeSyncLocation;
    }

    // Strategy 4: Return cached data even if expired
    if (this.locationData) {
      console.warn('📍 LocationSync: Using expired cache as last resort');
      return this.locationData;
    }

    // Final fallback: Default location
    const defaultLocation: LocationData = {
      city: 'Unknown',
      state: 'Unknown',
      country: 'US',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      latitude: 0,
      longitude: 0,
      lastUpdated: Date.now(),
      source: 'manual',
    };

    await this.updateLocation(defaultLocation);
    return defaultLocation;
  }

  /**
   * Get location using browser GPS
   */
  private async getGPSLocation(): Promise<LocationData | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.log('📍 LocationSync: GPS not available in this browser');
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            
            // Reverse geocode to get city/state
            const locationData = await this.reverseGeocode(latitude, longitude);
            
            resolve({
              ...locationData,
              latitude,
              longitude,
              lastUpdated: Date.now(),
              source: 'gps' as const,
            });
          } catch (error) {
            console.error('📍 LocationSync: Reverse geocoding failed', error);
            resolve(null);
          }
        },
        (error) => {
          // GPS errors are expected - don't alarm the user
          const errorMessages: Record<number, string> = {
            1: 'User denied location permission',
            2: 'Location unavailable',
            3: 'Location request timeout',
          };
          
          console.log(
            `📍 LocationSync: GPS unavailable (${errorMessages[error.code] || 'Unknown error'}). Using fallback location method.`
          );
          resolve(null);
        },
        {
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
          enableHighAccuracy: false, // Use faster, less accurate location
        }
      );
    });
  }

  /**
   * Get location using IP address (free service)
   */
  private async getIPLocation(): Promise<LocationData | null> {
    try {
      const response = await fetch('https://ipapi.co/json/');
      if (!response.ok) throw new Error('IP location service unavailable');

      const data = await response.json();

      return {
        city: data.city || 'Unknown',
        state: data.region || 'Unknown',
        country: data.country_code || 'US',
        timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        lastUpdated: Date.now(),
        source: 'ip' as const,
      };
    } catch (error) {
      console.error('📍 LocationSync: IP location failed', error);
      return null;
    }
  }

  /**
   * Reverse geocode coordinates to city/state
   */
  private async reverseGeocode(lat: number, lon: number): Promise<{
    city: string;
    state: string;
    country: string;
    timezone: string;
  }> {
    try {
      // Using OpenStreetMap Nominatim (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
        {
          headers: {
            'User-Agent': 'CareSolis/1.0',
          },
        }
      );

      if (!response.ok) throw new Error('Geocoding failed');

      const data = await response.json();
      const address = data.address || {};

      return {
        city: address.city || address.town || address.village || 'Unknown',
        state: address.state || 'Unknown',
        country: address.country_code?.toUpperCase() || 'US',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
    } catch (error) {
      console.error('📍 LocationSync: Reverse geocoding failed', error);
      
      // Fallback: Use timezone-based approximation
      return this.getTimezoneBasedLocation() || {
        city: 'Unknown',
        state: 'Unknown',
        country: 'US',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
    }
  }

  /**
   * Get approximate location from timezone (using TimeSync)
   */
  private getTimezoneBasedLocation(): LocationData | null {
    try {
      const timeSync = getTimeSync();
      const status = timeSync.getStatus();
      
      // Don't use TimeSync if it hasn't been initialized yet
      if (status.syncQuality === 'unknown' && status.lastSyncTimestamp === 0) {
        console.log('📍 LocationSync: TimeSync not ready, using browser timezone');
        return this.getBrowserTimezoneLocation();
      }
      
      const timezone = status.timezone;

      // Map common timezones to approximate locations
      const timezoneMap: Record<string, Partial<LocationData>> = {
        'America/New_York': { city: 'New York', state: 'NY', country: 'US', latitude: 40.7128, longitude: -74.0060 },
        'America/Chicago': { city: 'Chicago', state: 'IL', country: 'US', latitude: 41.8781, longitude: -87.6298 },
        'America/Denver': { city: 'Denver', state: 'CO', country: 'US', latitude: 39.7392, longitude: -104.9903 },
        'America/Los_Angeles': { city: 'Los Angeles', state: 'CA', country: 'US', latitude: 34.0522, longitude: -118.2437 },
        'America/Phoenix': { city: 'Phoenix', state: 'AZ', country: 'US', latitude: 33.4484, longitude: -112.0740 },
        'Europe/London': { city: 'London', state: 'England', country: 'GB', latitude: 51.5074, longitude: -0.1278 },
      };

      const locationInfo = timezoneMap[timezone];
      if (!locationInfo) return null;

      return {
        city: locationInfo.city || 'Unknown',
        state: locationInfo.state || 'Unknown',
        country: locationInfo.country || 'US',
        timezone,
        latitude: locationInfo.latitude || 0,
        longitude: locationInfo.longitude || 0,
        lastUpdated: Date.now(),
        source: 'manual' as const,
      };
    } catch (error) {
      console.error('📍 LocationSync: Timezone-based location failed', error);
      return null;
    }
  }

  /**
   * Get approximate location from browser timezone
   */
  private getBrowserTimezoneLocation(): LocationData | null {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Map common timezones to approximate locations
    const timezoneMap: Record<string, Partial<LocationData>> = {
      'America/New_York': { city: 'New York', state: 'NY', country: 'US', latitude: 40.7128, longitude: -74.0060 },
      'America/Chicago': { city: 'Chicago', state: 'IL', country: 'US', latitude: 41.8781, longitude: -87.6298 },
      'America/Denver': { city: 'Denver', state: 'CO', country: 'US', latitude: 39.7392, longitude: -104.9903 },
      'America/Los_Angeles': { city: 'Los Angeles', state: 'CA', country: 'US', latitude: 34.0522, longitude: -118.2437 },
      'America/Phoenix': { city: 'Phoenix', state: 'AZ', country: 'US', latitude: 33.4484, longitude: -112.0740 },
      'Europe/London': { city: 'London', state: 'England', country: 'GB', latitude: 51.5074, longitude: -0.1278 },
    };

    const locationInfo = timezoneMap[timezone];
    if (!locationInfo) return null;

    return {
      city: locationInfo.city || 'Unknown',
      state: locationInfo.state || 'Unknown',
      country: locationInfo.country || 'US',
      timezone,
      latitude: locationInfo.latitude || 0,
      longitude: locationInfo.longitude || 0,
      lastUpdated: Date.now(),
      source: 'manual' as const,
    };
  }

  /**
   * Update location and notify listeners
   */
  private async updateLocation(location: LocationData): Promise<void> {
    this.locationData = location;
    this.saveToCache();
    this.notifyListeners();
    
    console.log('📍 LocationSync: Location updated', {
      city: location.city,
      state: location.state,
      timezone: location.timezone,
      source: location.source,
    });
  }

  /**
   * Check if cached location is still valid
   */
  private isCacheValid(): boolean {
    if (!this.locationData) return false;
    const age = Date.now() - this.locationData.lastUpdated;
    return age < this.CACHE_DURATION;
  }

  /**
   * Save location to localStorage
   */
  private saveToCache(): void {
    if (!this.locationData) return;
    
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(this.locationData));
    } catch (error) {
      console.error('📍 LocationSync: Failed to save cache', error);
    }
  }

  /**
   * Load location from localStorage
   */
  private loadFromCache(): void {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return;

      const data = JSON.parse(cached) as LocationData;
      
      // Validate cache structure
      if (data.city && data.timezone && data.lastUpdated) {
        this.locationData = data;
        console.log('📍 LocationSync: Loaded from cache', {
          city: data.city,
          age: `${Math.round((Date.now() - data.lastUpdated) / 1000 / 60)}min`,
        });
      }
    } catch (error) {
      console.error('📍 LocationSync: Failed to load cache', error);
    }
  }

  /**
   * Subscribe to location updates
   */
  subscribe(listener: (location: LocationData) => void): () => void {
    this.listeners.add(listener);
    
    // Send current location immediately if available
    if (this.locationData) {
      listener(this.locationData);
    }
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    if (!this.locationData) return;
    this.listeners.forEach(listener => listener(this.locationData!));
  }

  /**
   * Get formatted location string
   */
  getFormattedLocation(): string {
    if (!this.locationData) return 'Location not available';
    
    const { city, state, country } = this.locationData;
    
    if (country === 'US') {
      return `${city}, ${state}`;
    }
    
    return `${city}, ${country}`;
  }

  /**
   * Get current cached location (synchronous)
   */
  getCachedLocation(): LocationData | null {
    return this.locationData;
  }

  /**
   * Clear cache and force refresh
   */
  clearCache(): void {
    this.locationData = null;
    localStorage.removeItem(this.CACHE_KEY);
    console.log('📍 LocationSync: Cache cleared');
  }
}

// Singleton instance
let locationSyncInstance: LocationSync | null = null;

/**
 * Get or create LocationSync singleton
 */
export function getLocationSync(): LocationSync {
  if (!locationSyncInstance) {
    locationSyncInstance = new LocationSync();
  }
  return locationSyncInstance;
}

/**
 * Initialize location sync (call once at app startup)
 */
export async function initializeLocationSync(): Promise<LocationData> {
  const locationSync = getLocationSync();
  return await locationSync.getLocation();
}

/**
 * Get cached location (convenience function)
 */
export function getCachedLocation(): LocationData | null {
  return getLocationSync().getCachedLocation();
}

/**
 * Get formatted location string (convenience function)
 */
export function getFormattedLocation(): string {
  return getLocationSync().getFormattedLocation();
}