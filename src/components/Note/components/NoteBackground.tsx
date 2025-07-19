import React from 'react';
import { Shape } from 'react-konva';
import { CORNER_RADIUS } from '../../../constants/colors';

interface NoteBackgroundProps {
  width: number;
  height: number;
  color: string;
  isDarkMode: boolean;
  isSelected: boolean;
  isDragging: boolean;
  isResizing: boolean;
  performanceMode: 'high' | 'medium' | 'low';
}

export const NoteBackground: React.FC<NoteBackgroundProps> = ({
  width,
  height,
  color,
  isDarkMode,
  isSelected,
  isDragging,
  isResizing,
  performanceMode,
}) => {
  return (
    <Shape
      sceneFunc={(context) => {
        const gradient = context.createLinearGradient(0, 0, width * 0.5, height);
        
        if (isDarkMode) {
          switch (color) {
            case 'yellow':
              gradient.addColorStop(0, 'rgba(120, 53, 15, 0.95)');
              gradient.addColorStop(0.5, 'rgba(146, 64, 14, 0.88)');
              gradient.addColorStop(1, 'rgba(180, 83, 9, 0.82)');
              break;
            case 'pink':
              gradient.addColorStop(0, 'rgba(131, 24, 67, 0.95)');
              gradient.addColorStop(0.5, 'rgba(159, 18, 57, 0.88)');
              gradient.addColorStop(1, 'rgba(190, 24, 93, 0.82)');
              break;
            case 'blue':
              gradient.addColorStop(0, 'rgba(30, 58, 138, 0.95)');
              gradient.addColorStop(0.5, 'rgba(29, 78, 216, 0.88)');
              gradient.addColorStop(1, 'rgba(37, 99, 235, 0.82)');
              break;
            case 'green':
              gradient.addColorStop(0, 'rgba(20, 83, 45, 0.95)');
              gradient.addColorStop(0.5, 'rgba(22, 101, 52, 0.88)');
              gradient.addColorStop(1, 'rgba(34, 197, 94, 0.82)');
              break;
            case 'purple':
              gradient.addColorStop(0, 'rgba(76, 29, 149, 0.95)');
              gradient.addColorStop(0.5, 'rgba(91, 33, 182, 0.88)');
              gradient.addColorStop(1, 'rgba(124, 58, 237, 0.82)');
              break;
            case 'orange':
              gradient.addColorStop(0, 'rgba(124, 45, 18, 0.95)');
              gradient.addColorStop(0.5, 'rgba(154, 52, 18, 0.88)');
              gradient.addColorStop(1, 'rgba(194, 65, 12, 0.82)');
              break;
          }
        } else {
          switch (color) {
            case 'yellow':
              gradient.addColorStop(0, 'rgba(254, 243, 199, 0.95)');
              gradient.addColorStop(0.5, 'rgba(253, 230, 138, 0.88)');
              gradient.addColorStop(1, 'rgba(252, 211, 77, 0.82)');
              break;
            case 'pink':
              gradient.addColorStop(0, 'rgba(252, 231, 243, 0.95)');
              gradient.addColorStop(0.5, 'rgba(251, 207, 232, 0.88)');
              gradient.addColorStop(1, 'rgba(249, 168, 212, 0.82)');
              break;
            case 'blue':
              gradient.addColorStop(0, 'rgba(224, 242, 254, 0.95)');
              gradient.addColorStop(0.5, 'rgba(186, 230, 253, 0.88)');
              gradient.addColorStop(1, 'rgba(147, 197, 253, 0.82)');
              break;
            case 'green':
              gradient.addColorStop(0, 'rgba(236, 253, 245, 0.95)');
              gradient.addColorStop(0.5, 'rgba(209, 250, 229, 0.88)');
              gradient.addColorStop(1, 'rgba(134, 239, 172, 0.82)');
              break;
            case 'purple':
              gradient.addColorStop(0, 'rgba(243, 232, 255, 0.95)');
              gradient.addColorStop(0.5, 'rgba(233, 213, 255, 0.88)');
              gradient.addColorStop(1, 'rgba(196, 167, 231, 0.82)');
              break;
            case 'orange':
              gradient.addColorStop(0, 'rgba(254, 243, 199, 0.95)');
              gradient.addColorStop(0.5, 'rgba(253, 230, 138, 0.88)');
              gradient.addColorStop(1, 'rgba(251, 191, 36, 0.82)');
              break;
          }
        }
        
        context.beginPath();
        context.roundRect(0, 0, width, height, CORNER_RADIUS);
        context.fillStyle = gradient;
        context.fill();
        context.closePath();
      }}
      shadowColor={isDarkMode ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.1)"}
      shadowBlur={performanceMode === 'high' ? (isSelected ? 20 : 8) : 0}
      shadowOffset={{ x: 0, y: performanceMode === 'high' ? (isSelected ? 6 : 2) : 0 }}
      shadowEnabled={performanceMode === 'high' && !isDragging && !isResizing}
    />
  );
};