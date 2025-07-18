import { useEffect, useRef } from 'react';
import { isMobile, isIOS } from '../utils/deviceDetection';

export const useMobileOptimizations = () => {
  const isOptimized = useRef(false);
  
  useEffect(() => {
    if (!isMobile() || isOptimized.current) return;
    
    isOptimized.current = true;
    
    // Disable bounce scrolling on iOS
    if (isIOS()) {
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      document.body.style.overflow = 'hidden';
    }
    
    // Disable context menu on long press
    const preventContextMenu = (e: Event) => {
      e.preventDefault();
      return false;
    };
    
    document.addEventListener('contextmenu', preventContextMenu);
    
    // Optimize CSS for mobile
    const style = document.createElement('style');
    style.textContent = `
      /* Disable text selection on mobile */
      body {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        user-select: none;
      }
      
      /* Hardware acceleration for transforms */
      canvas {
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
      }
      
      /* Disable tap highlight */
      * {
        -webkit-tap-highlight-color: transparent;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.removeEventListener('contextmenu', preventContextMenu);
      if (isIOS()) {
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';
        document.body.style.overflow = '';
      }
      style.remove();
    };
  }, []);
};