import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  // access the current route pathname
  const { pathname } = useLocation();

  useEffect(() => {
    // Whenever the 'pathname' changes, scroll the window to (0, 0) instantly
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // This component doesn't render anything visually
}