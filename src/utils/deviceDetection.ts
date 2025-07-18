// Device detection utilities
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    ('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0);
};

export const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
};

export const isSafari = () => {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

// Performance optimization settings based on device
export const getDeviceOptimizations = () => {
  const mobile = isMobile();
  const ios = isIOS();
  
  return {
    enableAnimations: !mobile,
    enableShadows: !mobile,
    enableSmoothDrag: !mobile,
    dragThreshold: mobile ? 10 : 5,
    doubleTapDelay: mobile ? 300 : 250,
    // iOS specific optimizations
    usePassiveListeners: !ios, // iOS has issues with passive listeners in some cases
    enableMomentum: ios,
  };
};