import React from 'react';
import { Text } from 'react-konva';
import { PADDING, FONT_SIZE, LINE_HEIGHT } from '../../../constants/colors';

interface NoteContentProps {
  content: string;
  width: number;
  height: number;
  isDarkMode: boolean;
  isEditing: boolean;
}

export const NoteContent: React.FC<NoteContentProps> = ({
  content,
  width,
  height,
  isDarkMode,
  isEditing,
}) => {
  if (isEditing) return null;
  
  return (
    <Text
      x={PADDING}
      y={PADDING}
      width={width - PADDING * 2}
      height={height - PADDING * 2}
      text={content || ''}
      fontSize={FONT_SIZE}
      fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif"
      fill={isDarkMode ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.85)"}
      wrap="word"
      lineHeight={LINE_HEIGHT}
    />
  );
};