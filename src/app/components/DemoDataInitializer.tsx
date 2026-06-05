import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePatient } from '../context/PatientContext';
import { seedDemoData } from '../../utils/supabase/helpers';

/**
 * Component to initialize demo data on first app load
 * Renders nothing, just handles side effects
 */
export function DemoDataInitializer() {
  const { user } = useAuth();
  const { currentPatient } = usePatient();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initDemoData = async () => {
      const sessionKey = 'caresolis_demo_initialized';
      
      // Check if already initialized in this session
      if (sessionStorage.getItem(sessionKey)) {
        setInitialized(true);
        return;
      }

      if (user && currentPatient && !initialized) {
        try {
          console.log('🌱 Initializing demo data for Caresolis...');
          await seedDemoData(user.id, currentPatient.id);
          sessionStorage.setItem(sessionKey, 'true');
          setInitialized(true);
          console.log('✅ Demo data initialized successfully!');
        } catch (error) {
          console.error('❌ Error initializing demo data:', error);
        }
      }
    };

    initDemoData();
  }, [user, currentPatient, initialized]);

  // This component doesn't render anything
  return null;
}
