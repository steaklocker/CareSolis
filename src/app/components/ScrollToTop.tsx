import { useEffect } from 'react';
import { useLocation } from 'react-router';

/**
 * ScrollToTop component - Automatically scrolls to top of page on route change
 * This ensures every page starts at the top when navigating
 */
export function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top immediately when route changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Use 'instant' for immediate scroll, 'smooth' for animation
    });
  }, [location.pathname]); // Trigger whenever the path changes

  return null; // This component doesn't render anything
}
