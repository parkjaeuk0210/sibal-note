import { useGesture } from '@use-gesture/react';
import { RefObject } from 'react';
import { isMobile } from '../utils/deviceDetection';
import { haptics } from '../utils/haptics';

interface SwipeGesturesProps {
  containerRef: RefObject<HTMLElement>;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
}

export const useSwipeGestures = ({
  containerRef,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50
}: SwipeGesturesProps) => {
  
  const bind = useGesture(
    {
      onDrag: ({ movement: [mx, my], last, velocity: [vx, vy] }) => {
        if (!isMobile() || !last) return;
        
        const absX = Math.abs(mx);
        const absY = Math.abs(my);
        
        // 속도와 거리 기반 스와이프 감지
        const isHorizontalSwipe = absX > absY && (absX > threshold || Math.abs(vx) > 0.5);
        const isVerticalSwipe = absY > absX && (absY > threshold || Math.abs(vy) > 0.5);
        
        if (isHorizontalSwipe) {
          haptics.light();
          if (mx > 0 && onSwipeRight) {
            onSwipeRight();
          } else if (mx < 0 && onSwipeLeft) {
            onSwipeLeft();
          }
        } else if (isVerticalSwipe) {
          haptics.light();
          if (my > 0 && onSwipeDown) {
            onSwipeDown();
          } else if (my < 0 && onSwipeUp) {
            onSwipeUp();
          }
        }
      }
    },
    {
      target: containerRef,
      drag: {
        filterTaps: true,
        threshold: 10,
        rubberband: false
      }
    }
  );

  return bind;
};