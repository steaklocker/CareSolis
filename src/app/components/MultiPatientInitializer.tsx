import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePatient } from '../context/PatientContext';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export function MultiPatientInitializer() {
  const { user } = useAuth();
  const { currentPatient } = usePatient();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // v6.46.6 - Updated session key to force re-seed with timezone data
    const sessionKey = 'caresolis-multipatient-initialized-v2';
    
    if (typeof window !== 'undefined' && sessionStorage.getItem(sessionKey)) {
      setInitialized(true);
      return;
    }

    async function seedAllPatients() {
      if (!user || initialized) return;

      try {
        console.log('🌱 Initializing multi-patient data for Caresolis...');
        
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-9aeac050/api/seed-all-patients`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`
            },
            body: JSON.stringify({
              userId: user.id
            })
          }
        );

        if (!response.ok) {
          console.error('Failed to seed multi-patient data:', await response.text());
          return;
        }

        const result = await response.json();
        console.log('✅ Multi-patient data seeded:', result);
        
        sessionStorage.setItem(sessionKey, 'true');
        setInitialized(true);
      } catch (error) {
        console.error('Error seeding multi-patient data:', error);
      }
    }

    seedAllPatients();
  }, [user, initialized]);

  // This component doesn't render anything
  return null;
}