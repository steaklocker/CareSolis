/**
 * Timezone Detection Utility
 * FDA Compliant: Auto-detects timezone from patient address for pre-population
 * Requires explicit human verification before application
 */

// US State to Timezone mapping
// Handles states with multiple timezones by selecting the most populous timezone
const STATE_TIMEZONE_MAP: Record<string, string> = {
  // Eastern Time
  'CT': 'America/New_York',
  'DE': 'America/New_York',
  'FL': 'America/New_York',
  'GA': 'America/New_York',
  'ME': 'America/New_York',
  'MD': 'America/New_York',
  'MA': 'America/New_York',
  'NH': 'America/New_York',
  'NJ': 'America/New_York',
  'NY': 'America/New_York',
  'NC': 'America/New_York',
  'OH': 'America/New_York',
  'PA': 'America/New_York',
  'RI': 'America/New_York',
  'SC': 'America/New_York',
  'VT': 'America/New_York',
  'VA': 'America/New_York',
  'WV': 'America/New_York',
  'DC': 'America/New_York',
  
  // Central Time
  'AL': 'America/Chicago',
  'AR': 'America/Chicago',
  'IL': 'America/Chicago',
  'IN': 'America/Chicago', // Note: Some counties are Eastern
  'IA': 'America/Chicago',
  'KS': 'America/Chicago',
  'KY': 'America/Chicago', // Note: Eastern part is America/New_York
  'LA': 'America/Chicago',
  'MN': 'America/Chicago',
  'MS': 'America/Chicago',
  'MO': 'America/Chicago',
  'NE': 'America/Chicago',
  'ND': 'America/Chicago', // Note: Western part is America/Denver
  'OK': 'America/Chicago',
  'SD': 'America/Chicago', // Note: Western part is America/Denver
  'TN': 'America/Chicago', // Note: Eastern part is America/New_York
  'TX': 'America/Chicago',
  'WI': 'America/Chicago',
  
  // Mountain Time
  'AZ': 'America/Phoenix', // No DST (except Navajo Nation)
  'CO': 'America/Denver',
  'ID': 'America/Denver', // Note: Northern panhandle is America/Los_Angeles
  'MT': 'America/Denver',
  'NM': 'America/Denver',
  'UT': 'America/Denver',
  'WY': 'America/Denver',
  
  // Pacific Time
  'CA': 'America/Los_Angeles',
  'NV': 'America/Los_Angeles',
  'OR': 'America/Los_Angeles', // Note: Malheur County is America/Denver
  'WA': 'America/Los_Angeles',
  
  // Alaska
  'AK': 'America/Anchorage',
  
  // Hawaii
  'HI': 'Pacific/Honolulu',
};

// Cities that override state defaults (for states with multiple timezones)
const CITY_TIMEZONE_OVERRIDES: Record<string, string> = {
  // Indiana - Eastern Time cities
  'evansville, in': 'America/New_York',
  'indianapolis, in': 'America/New_York',
  'fort wayne, in': 'America/New_York',
  
  // Kentucky - Eastern Time cities
  'louisville, ky': 'America/New_York',
  'lexington, ky': 'America/New_York',
  
  // Tennessee - Eastern Time cities
  'chattanooga, tn': 'America/New_York',
  'knoxville, tn': 'America/New_York',
  
  // North Dakota - Mountain Time cities
  'dickinson, nd': 'America/Denver',
  
  // South Dakota - Mountain Time cities
  'rapid city, sd': 'America/Denver',
  
  // Oregon - Mountain Time cities
  'ontario, or': 'America/Denver',
  
  // Idaho - Pacific Time cities
  'coeur d\'alene, id': 'America/Los_Angeles',
};

export interface TimezoneDetectionResult {
  timezone: string;
  confidence: 'high' | 'medium' | 'low';
  source: 'city_override' | 'state_mapping' | 'default';
  displayText: string;
}

/**
 * Detects timezone from patient address
 * @param city Patient's city
 * @param state Patient's state (2-letter code)
 * @returns Detected timezone with confidence level
 */
export function detectTimezoneFromAddress(
  city?: string,
  state?: string
): TimezoneDetectionResult {
  // Default fallback
  const defaultResult: TimezoneDetectionResult = {
    timezone: 'America/New_York',
    confidence: 'low',
    source: 'default',
    displayText: 'Default (Eastern Time)',
  };

  // If no state, return default
  if (!state) {
    return defaultResult;
  }

  // Normalize state to uppercase
  const normalizedState = state.toUpperCase().trim();

  // Check for city-specific override
  if (city) {
    const normalizedCity = city.toLowerCase().trim();
    const cityKey = `${normalizedCity}, ${normalizedState.toLowerCase()}`;
    
    if (CITY_TIMEZONE_OVERRIDES[cityKey]) {
      return {
        timezone: CITY_TIMEZONE_OVERRIDES[cityKey],
        confidence: 'high',
        source: 'city_override',
        displayText: `${city}, ${normalizedState}`,
      };
    }
  }

  // Check state mapping
  const stateTimezone = STATE_TIMEZONE_MAP[normalizedState];
  if (stateTimezone) {
    return {
      timezone: stateTimezone,
      confidence: city ? 'high' : 'medium',
      source: 'state_mapping',
      displayText: city ? `${city}, ${normalizedState}` : normalizedState,
    };
  }

  // Return default if state not found
  return defaultResult;
}

/**
 * Formats timezone for display
 */
export function formatTimezoneDisplay(timezone: string): string {
  const abbreviations: Record<string, string> = {
    'America/New_York': 'Eastern Time (EST/EDT)',
    'America/Chicago': 'Central Time (CST/CDT)',
    'America/Denver': 'Mountain Time (MST/MDT)',
    'America/Los_Angeles': 'Pacific Time (PST/PDT)',
    'America/Phoenix': 'Arizona Time (MST - No DST)',
    'Pacific/Honolulu': 'Hawaii Time (HST)',
    'America/Anchorage': 'Alaska Time (AKST/AKDT)',
  };
  
  return abbreviations[timezone] || timezone;
}

/**
 * Validates if a timezone string is a valid IANA timezone
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets current time in a specific timezone
 */
export function getTimeInTimezone(timezone: string): string {
  try {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return 'Invalid timezone';
  }
}

/**
 * Calculates timezone offset difference between two timezones
 */
export function getTimezoneOffsetDifference(tz1: string, tz2: string): number {
  try {
    const now = new Date();
    const offset1 = new Date(now.toLocaleString('en-US', { timeZone: tz1 })).getTime();
    const offset2 = new Date(now.toLocaleString('en-US', { timeZone: tz2 })).getTime();
    return Math.floor((offset1 - offset2) / (1000 * 60 * 60)); // Hours difference
  } catch {
    return 0;
  }
}
