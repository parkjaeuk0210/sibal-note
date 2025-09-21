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
      
      /* 모바일에서 터치 타겟 크기 최적화 */
      @media (max-width: 768px) {
        .glass-button {
          min-height: 44px !important;
          min-width: 44px !important;
          padding: 12px !important;
        }
        
        /* 노트 최소 크기 확보 */
        .mobile-note {
          min-width: 150px !important;
          min-height: 120px !important;
        }
        
        /* 모바일 툴바 공간 확보 */
        .canvas-container {
          padding-bottom: 100px !important;
        }
      }
      
      /* 고해상도 디스플레이 최적화 */
      @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
        canvas {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: optimize-contrast;
        }
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