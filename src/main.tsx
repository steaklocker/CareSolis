import { createRoot } from 'react-dom/client';
import App from './app/App';

// v6.45.3 - Removed StrictMode for more predictable loading behavior
// StrictMode causes double-renders which can trigger race conditions during initialization

// Global error handler to suppress Figma environment errors
window.addEventListener('error', (event) => {
  const ignoredPatterns = [
    'multiple renderers concurrently',
    'Detected multiple renderers',
    'multiple Jotai instances',
    'Unknown runtime error'
  ];

  const errorMessage = event.message || event.error?.message || '';
  const shouldSuppress = ignoredPatterns.some(pattern =>
    errorMessage.includes(pattern)
  );

  if (shouldSuppress) {
    console.warn('🔕 Suppressed Figma environment error:', errorMessage);
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
});

// Suppress unhandled promise rejections from Figma environment
window.addEventListener('unhandledrejection', (event) => {
  const errorMessage = event.reason?.message || String(event.reason) || '';
  const ignoredPatterns = [
    'multiple renderers concurrently',
    'Detected multiple renderers',
    'multiple Jotai instances'
  ];

  const shouldSuppress = ignoredPatterns.some(pattern =>
    errorMessage.includes(pattern)
  );

  if (shouldSuppress) {
    console.warn('🔕 Suppressed Figma environment rejection:', errorMessage);
    event.preventDefault();
    return false;
  }
});

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(<App />);