/**
 * TWILIO SMS NOTIFICATION SERVICE
 *
 * Sends real-time SMS alerts to Care Circle members during escalations.
 * FDA Compliant: Provides immediate notification for medication adherence events.
 */

// Check Twilio configuration on module load
const TWILIO_CONFIGURED = !!(Deno.env.get('TWILIO_ACCOUNT_SID') && Deno.env.get('TWILIO_AUTH_TOKEN') && Deno.env.get('TWILIO_PHONE_NUMBER'));
if (TWILIO_CONFIGURED) {
  console.log('✅ [TWILIO] SMS service configured and ready');
  console.log('ℹ️  [TWILIO] Trial accounts can only send to verified numbers at twilio.com/console/phone-numbers/verified');
} else {
  console.warn('⚠️ [TWILIO] SMS service NOT configured - notifications will be logged but not sent');
  console.warn('⚠️ [TWILIO] Set environment variables: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER');
}

interface SMSPayload {
  to: string;
  message: string;
  escalationLevel?: number;
  patientName?: string;
  scheduledTime?: string;
}

/**
 * Normalize phone number to E.164 format for Twilio
 *
 * @param phone Phone number in any format
 * @returns E.164 formatted phone number (e.g., +15553456789)
 */
function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Handle different length scenarios
  if (digits.length === 10) {
    // US number without country code: 5553456789 -> +15553456789
    return `+1${digits}`;
  } else if (digits.length === 11 && digits.startsWith('1')) {
    // US number with country code: 15553456789 -> +15553456789
    return `+${digits}`;
  } else if (digits.length === 11) {
    // International number: assume it needs +
    return `+${digits}`;
  } else if (digits.length > 11) {
    // Already has country code, just add +
    return `+${digits}`;
  }

  // Invalid length
  throw new Error(`Invalid phone number: ${phone} (${digits.length} digits)`);
}

/**
 * Send SMS via Twilio
 *
 * @param payload SMS details
 * @returns Success status and message ID
 */
export async function sendSMS(payload: SMSPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
  const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
  const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER');

  // Validate environment variables
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.warn('⚠️ [TWILIO] SMS not sent - Twilio not configured');
    console.log(`📋 [TWILIO] Would send to ${payload.to}: ${payload.message}`);
    return {
      success: false,
      error: 'Twilio not configured (this is expected in development - SMS logged but not sent)'
    };
  }

  // Normalize phone number to E.164 format
  let normalizedPhone: string;
  try {
    normalizedPhone = normalizePhoneNumber(payload.to);
    console.log(`📱 [TWILIO] Normalized ${payload.to} -> ${normalizedPhone}`);
  } catch (error) {
    console.error(`❌ [TWILIO] Invalid phone number: ${payload.to} - ${error.message}`);
    return { success: false, error: `Invalid phone number: ${error.message}` };
  }

  // Validate E.164 format
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  if (!phoneRegex.test(normalizedPhone)) {
    console.error(`❌ [TWILIO] Invalid E.164 format: ${normalizedPhone}`);
    return { success: false, error: 'Invalid phone number format after normalization' };
  }

  // Skip fictional 555 test numbers - Twilio rejects these as invalid
  // US fictional numbers: +1555XXXXXXX (used in movies/TV/testing)
  if (normalizedPhone.match(/^\+1555\d{7}$/)) {
    console.warn(`⚠️ [TWILIO] Skipping fictional 555 test number: ${normalizedPhone}`);
    console.log(`📋 [TWILIO] Would send: ${payload.message}`);
    return {
      success: false,
      error: 'Test number (555 prefix) - replace with real phone number for SMS delivery'
    };
  }

  try {
    console.log(`📱 [TWILIO] Sending SMS to ${normalizedPhone} (originally ${payload.to})...`);

    // Twilio API endpoint
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

    // Create Basic Auth header
    const credentials = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

    // Send SMS request
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: normalizedPhone,
        From: TWILIO_PHONE_NUMBER,
        Body: payload.message,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`✅ [TWILIO] SMS sent successfully. SID: ${data.sid}`);
      return { success: true, messageId: data.sid };
    } else {
      // Handle trial account unverified number gracefully
      if (data.code === 21608) {
        console.warn(`⚠️ [TWILIO] Trial account - unverified number: ${normalizedPhone}`);
        console.log(`📋 [TWILIO] To send real SMS: Verify ${normalizedPhone} at twilio.com/console/phone-numbers/verified OR upgrade to paid account`);
        return {
          success: false,
          error: 'Twilio trial account - number not verified (expected in testing)'
        };
      }

      console.error(`❌ [TWILIO] Failed to send SMS:`, data);
      return { success: false, error: data.message || 'Unknown Twilio error' };
    }
  } catch (error) {
    console.error('❌ [TWILIO] Exception while sending SMS:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Format escalation message for SMS
 */
export function formatEscalationMessage(level: number, patientName: string, scheduledTime: string): string {
  const emoji = level === 1 ? '⚠️' : level === 2 ? '🔴' : '🚨';
  const urgency = level === 1 ? 'ALERT' : level === 2 ? 'URGENT' : 'CRITICAL';

  return `${emoji} ${urgency}: ${patientName} missed ${scheduledTime} medication check-in. Escalation Level ${level} active. Open CareSolis app immediately to respond.`;
}

/**
 * Format reminder message for SMS
 */
export function formatReminderMessage(patientName: string, scheduledTime: string): string {
  return `🔔 REMINDER: ${patientName}'s ${scheduledTime} medication window is now active. Check-in expected within grace period.`;
}

/**
 * Send SMS to multiple Care Circle contacts
 */
export async function notifyCareCircle(
  contacts: any[],
  message: string,
  escalationLevel?: number
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const results = { sent: 0, failed: 0, errors: [] as string[] };

  // Filter contacts based on escalation level
  // Level 1: Contact 1 only
  // Level 2: Contacts 1 & 2
  // Level 3: All contacts
  let targetContacts = contacts.filter(c => c.active);
  if (escalationLevel) {
    targetContacts = targetContacts.filter(c => c.priority <= escalationLevel);
  }

  console.log(`📱 [TWILIO] Notifying ${targetContacts.length} contacts for escalation level ${escalationLevel || 'reminder'}`);

  // Send SMS to each contact
  for (const contact of targetContacts) {
    if (!contact.phone) {
      console.warn(`⚠️ [TWILIO] Contact ${contact.name} has no phone number`);
      results.failed++;
      results.errors.push(`${contact.name}: No phone number`);
      continue;
    }

    const result = await sendSMS({
      to: contact.phone,
      message,
      escalationLevel,
    });

    if (result.success) {
      results.sent++;
      console.log(`✅ [TWILIO] Notified ${contact.name} (${contact.phone})`);
    } else {
      results.failed++;
      results.errors.push(`${contact.name}: ${result.error}`);
      console.error(`❌ [TWILIO] Failed to notify ${contact.name}:`, result.error);
    }

    // Rate limiting: wait 100ms between messages to avoid Twilio rate limits
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`📱 [TWILIO] Notification complete: ${results.sent} sent, ${results.failed} failed`);
  return results;
}
