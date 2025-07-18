// Device detection utilities
export const isMobile = (): boolean => {
  // Check for touch capability
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Check screen size
  const isSmallScreen = window.innerWidth <= 768;
  
  // Check user agent (fallback)
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  const isMobileUserAgent = mobileRegex.test(navigator.userAgent);
  
  return hasTouch && (isSmallScreen || isMobileUserAgent);
};

export const isTouch = (): boolean => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Performance mode based on device
export const getPerformanceMode = (): 'high' | 'medium' | 'low' => {
  if (!isMobile()) return 'high';
  
  // Check device pixel ratio for high-res screens
  const pixelRatio = window.devicePixelRatio || 1;
  
  // Check screen size
  const screenSize = window.innerWidth * window.innerHeight;
  
  if (pixelRatio > 2 || screenSize < 500000) {
    return 'low'; // High DPI or small screens need more optimization
  }
  
  return 'medium';
};