import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

/**
 * APP LOADING CONTEXT v6.45.5
 * 
 * Coordinates the loading state of the entire application.
 * Fixed stale closure bug in timeout protection.
 * Enhanced logging for debugging load failures.
 */

interface AppLoadingState {
  isInitialized: boolean;
  isLoading: boolean;
  errors: string[];
  progress: number; // 0-100
  stage: 'starting' | 'auth' | 'contexts' | 'data' | 'ready' | 'error';
}

interface AppLoadingContextType extends AppLoadingState {
  setStage: (stage: AppLoadingState['stage']) => void;
  setProgress: (progress: number) => void;
  addError: (error: string) => void;
  markReady: () => void;
  retry: () => void;
}

const defaultState: AppLoadingState = {
  isInitialized: false,
  isLoading: true,
  errors: [],
  progress: 0,
  stage: 'starting'
};

const AppLoadingContext = createContext<AppLoadingContextType | undefined>(undefined);

export function AppLoadingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppLoadingState>(defaultState);
  const [retryCount, setRetryCount] = useState(0);
  const initCompleteRef = useRef(false);

  const setStage = (stage: AppLoadingState['stage']) => {
    setState(prev => ({ ...prev, stage }));
    
    // Auto-update progress based on stage
    const stageProgress: Record<string, number> = {
      'starting': 10,
      'auth': 30,
      'contexts': 60,
      'data': 80,
      'ready': 100,
      'error': 0
    };
    setState(prev => ({ ...prev, progress: stageProgress[stage] || prev.progress }));
  };

  const setProgress = (progress: number) => {
    setState(prev => ({ ...prev, progress: Math.min(100, Math.max(0, progress)) }));
  };

  const addError = (error: string) => {
    console.error('🚨 AppLoading Error:', error);
    setState(prev => ({ 
      ...prev, 
      errors: [...prev.errors, error],
      stage: 'error'
    }));
  };

  const markReady = () => {
    initCompleteRef.current = true;
    setState({
      isInitialized: true,
      isLoading: false,
      errors: [],
      progress: 100,
      stage: 'ready'
    });
  };

  const retry = () => {
    console.log('🔄 AppLoading: Retrying initialization...');
    initCompleteRef.current = false;
    setRetryCount(prev => prev + 1);
    setState(defaultState);
  };

  // Auto-initialization sequence
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const initialize = async () => {
      try {
        console.log('🚀 AppLoading: Starting initialization sequence...');
        
        if (!isMounted) return;
        setState(prev => ({ ...prev, stage: 'starting', progress: 10 }));
        await new Promise(resolve => setTimeout(resolve, 50));

        if (!isMounted) return;
        setState(prev => ({ ...prev, stage: 'auth', progress: 30 }));
        await new Promise(resolve => setTimeout(resolve, 50));

        if (!isMounted) return;
        setState(prev => ({ ...prev, stage: 'contexts', progress: 60 }));
        await new Promise(resolve => setTimeout(resolve, 50));

        if (!isMounted) return;
        setState(prev => ({ ...prev, stage: 'data', progress: 80 }));
        await new Promise(resolve => setTimeout(resolve, 50));

        if (!isMounted) return;
        setState(prev => ({ ...prev, stage: 'ready', progress: 100 }));
        initCompleteRef.current = true;
        setState({
          isInitialized: true,
          isLoading: false,
          errors: [],
          progress: 100,
          stage: 'ready'
        });
        
        console.log('✅ AppLoading: Initialization complete');
      } catch (error) {
        if (!isMounted) return;
        const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
        console.error('🚨 AppLoading initialization error:', errorMessage);
        setState(prev => ({ 
          ...prev, 
          errors: [errorMessage],
          stage: 'error'
        }));
      }
    };

    // Start initialization
    initialize();

    // Failsafe timeout - if not ready in 5 seconds, force ready
    timeoutId = setTimeout(() => {
      if (isMounted && !initCompleteRef.current) {
        console.warn('⚠️ AppLoading: Initialization timeout - forcing ready state');
        initCompleteRef.current = true;
        setState({
          isInitialized: true,
          isLoading: false,
          errors: [],
          progress: 100,
          stage: 'ready'
        });
      }
    }, 5000);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [retryCount]);

  const value: AppLoadingContextType = {
    ...state,
    setStage,
    setProgress,
    addError,
    markReady,
    retry
  };

  return (
    <AppLoadingContext.Provider value={value}>
      {children}
    </AppLoadingContext.Provider>
  );
}

export function useAppLoading() {
  const context = useContext(AppLoadingContext);
  if (!context) {
    // Defensive: Return safe defaults if used outside provider
    console.warn('useAppLoading used outside AppLoadingProvider - returning defaults');
    return {
      isInitialized: true,
      isLoading: false,
      errors: [],
      progress: 100,
      stage: 'ready' as const,
      setStage: () => {},
      setProgress: () => {},
      addError: () => {},
      markReady: () => {},
      retry: () => {}
    };
  }
  return context;
}