import React, { createContext, useContext, useEffect } from 'react';

// DARK MODE ONLY - Medical monitoring best practice
// Clinical monitoring systems (ICU monitors, radiology, mission control) use dark backgrounds
// Better color contrast for critical alerts (rose, yellow, red rings)
// Reduces eye strain during 24/7 monitoring and late-night escalations
type Theme = 'dark';

interface ThemeProviderProps {
  children: React.ReactNode;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const initialState: ThemeProviderState = {
  theme: 'dark',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
}: ThemeProviderProps) {
  const theme: Theme = 'dark';

  useEffect(() => {
    const root = window.document.documentElement;

    // Force dark mode always
    root.classList.remove('light', 'system');
    root.classList.add('dark');

    // Clear any old theme preferences from localStorage
    localStorage.removeItem('caresolis-ui-theme');
  }, []);

  const value = {
    theme,
    setTheme: () => {
      // Dark mode only - setTheme is a no-op for compatibility
      console.log('CareSolis uses dark mode only (medical monitoring best practice)');
    },
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};