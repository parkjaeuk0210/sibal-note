import { getPerformanceMode, isMobile, isTouch } from '../../utils/device';

describe('device utils', () => {
  // Save original values
  const originalUserAgent = navigator.userAgent;
  const originalMaxTouchPoints = navigator.maxTouchPoints;
  const originalInnerWidth = window.innerWidth;
  const originalInnerHeight = window.innerHeight;
  const originalDevicePixelRatio = window.devicePixelRatio;
  const originalOntouchstart = window.ontouchstart;

  beforeEach(() => {
    // Reset to original values before each test
    Object.defineProperty(navigator, 'userAgent', {
      writable: true,
      configurable: true,
      value: originalUserAgent
    });
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      configurable: true,
      value: originalMaxTouchPoints
    });
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalInnerHeight
    });
    Object.defineProperty(window, 'devicePixelRatio', {
      writable: true,
      configurable: true,
      value: originalDevicePixelRatio
    });
    // Remove ontouchstart
    if ('ontouchstart' in window) {
      delete (window as any).ontouchstart;
    }
  });

  afterAll(() => {
    // Restore original values
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalInnerHeight
    });
    Object.defineProperty(window, 'devicePixelRatio', {
      writable: true,
      configurable: true,
      value: originalDevicePixelRatio
    });
    if (originalOntouchstart !== undefined) {
      (window as any).ontouchstart = originalOntouchstart;
    }
  });

  describe('isMobile', () => {
    it('should return true for mobile devices with touch and small screen', () => {
      // Setup mobile environment
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        configurable: true,
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
      });
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: 5
      });
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });
      
      expect(isMobile()).toBe(true);
    });

    it('should return false for desktop without touch', () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        configurable: true,
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      });
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: 0
      });
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920
      });
      
      expect(isMobile()).toBe(false);
    });

    it('should return false for touch device with large screen', () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        configurable: true,
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      });
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: 5
      });
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920
      });
      
      expect(isMobile()).toBe(false);
    });
  });

  describe('isTouch', () => {
    it('should return true when maxTouchPoints > 0', () => {
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: 5
      });
      expect(isTouch()).toBe(true);
    });

    it('should return true when ontouchstart exists', () => {
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: 0
      });
      (window as any).ontouchstart = null;
      expect(isTouch()).toBe(true);
    });

    it('should return false when no touch support', () => {
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: 0
      });
      delete (window as any).ontouchstart;
      expect(isTouch()).toBe(false);
    });
  });

  describe('getPerformanceMode', () => {
    it('should return "high" for desktop devices', () => {
      // Setup desktop environment
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        configurable: true,
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      });
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: 0
      });
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920
      });
      
      expect(getPerformanceMode()).toBe('high');
    });

    it('should return "low" for mobile devices with high DPI', () => {
      // Setup mobile environment with high DPI
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        configurable: true,
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
      });
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: 5
      });
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667
      });
      Object.defineProperty(window, 'devicePixelRatio', {
        writable: true,
        configurable: true,
        value: 3
      });
      
      expect(getPerformanceMode()).toBe('low');
    });

    it('should return "medium" for mobile devices with normal DPI', () => {
      // Setup mobile environment with normal DPI and larger screen
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        configurable: true,
        value: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)'
      });
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        configurable: true,
        value: 5
      });
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1024
      });
      Object.defineProperty(window, 'devicePixelRatio', {
        writable: true,
        configurable: true,
        value: 2
      });
      
      expect(getPerformanceMode()).toBe('medium');
    });
  });
});