import { useRef, useEffect, useState } from 'react';
import { Group, Rect, Text } from 'react-konva';
import Konva from 'konva';
import { Note } from '../../types';
import { useAppStore } from '../../contexts/StoreProvider';
import { ClickableText } from './components/ClickableText';
import { parseTextWithURLs } from '../../utils/urlDetection';

interface StickyNoteProps {
  note: Note;
}

export const StickyNote = ({ note }: StickyNoteProps) => {
  const groupRef = useRef<Konva.Group>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const updateNote = useAppStore((state) => state.updateNote);
  const selectNote = useAppStore((state) => state.selectNote);
  const selectedNoteId = useAppStore((state) => state.selectedNoteId);
  const isSelected = selectedNoteId === note.id;

  const colorMap = {
    yellow: '#FEF08A',
    pink: '#FBCFE8',
    blue: '#93C5FD',
    green: '#86EFAC',
    purple: '#C4B5FD',
    orange: '#FED7AA',
  };

  const darkColorMap = {
    yellow: '#FDE047',
    pink: '#F9A8D4',
    blue: '#60A5FA',
    green: '#4ADE80',
    purple: '#A78BFA',
    orange: '#FDBA74',
  };

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    // Add shadow when selected
    const shadowEnabled = true;
    const shadowBlur = isSelected ? 20 : 10;
    const shadowColor = isSelected ? 'rgba(0, 0, 0, 0.15)' : 'rgba(0, 0, 0, 0.1)';
    const shadowOffsetY = isSelected ? 10 : 5;
    
    group.setAttrs({
      shadowEnabled,
      shadowBlur,
      shadowColor,
      shadowOffsetX: 0,
      shadowOffsetY,
    });
  }, [isSelected]);

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    updateNote(note.id, {
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // 이벤트가 이미 처리되었으면 무시
    if (e.evt.defaultPrevented) return;
    selectNote(note.id);
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
    // Create textarea for editing
    const stage = groupRef.current?.getStage();
    if (!stage) return;

    const textPosition = groupRef.current?.absolutePosition();
    if (!textPosition) return;

    const areaPosition = {
      x: stage.container().offsetLeft + textPosition.x * stage.scaleX() + stage.x() + 10,
      y: stage.container().offsetTop + textPosition.y * stage.scaleY() + stage.y() + 10,
    };

    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    textarea.value = note.content;
    textarea.style.position = 'absolute';
    textarea.style.top = `${areaPosition.y}px`;
    textarea.style.left = `${areaPosition.x}px`;
    textarea.style.width = `${(note.width - 20) * stage.scaleX()}px`;
    textarea.style.height = `${(note.height - 20) * stage.scaleY()}px`;
    textarea.style.fontSize = `${16 * stage.scaleX()}px`;
    textarea.style.border = 'none';
    textarea.style.padding = '5px';
    textarea.style.margin = '0px';
    textarea.style.overflow = 'hidden';
    textarea.style.background = 'transparent';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.lineHeight = '1.5';
    textarea.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    textarea.focus();
    textarea.select();

    const removeTextarea = () => {
      textarea.parentNode?.removeChild(textarea);
      window.removeEventListener('click', handleOutsideClick);
      setIsEditing(false);
    };

    const handleOutsideClick = (e: MouseEvent) => {
      if (e.target !== textarea) {
        updateNote(note.id, { content: textarea.value });
        removeTextarea();
      }
    };

    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        removeTextarea();
      } else if (e.key === 'Enter' && e.ctrlKey) {
        updateNote(note.id, { content: textarea.value });
        removeTextarea();
      }
    });

    setTimeout(() => {
      window.addEventListener('click', handleOutsideClick);
    });
  };

  return (
    <Group
      ref={groupRef}
      x={note.x}
      y={note.y}
      draggable
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onDblClick={handleDoubleClick}
      onTap={handleClick}
      onDblTap={handleDoubleClick}
    >
      <Rect
        width={note.width}
        height={note.height}
        fill={colorMap[note.color]}
        stroke={isSelected ? darkColorMap[note.color] : 'transparent'}
        strokeWidth={2}
        cornerRadius={8}
      />
      {!isEditing && (() => {
        const content = note.content || '더블 클릭하여 메모 작성';
        const segments = parseTextWithURLs(content);
        const hasUrls = segments.some(segment => segment.type === 'url');
        const isDarkMode = false; // StickyNote는 기본적으로 밝은 색상 사용
        
        if (hasUrls && note.content) {
          return (
            <ClickableText
              content={content}
              x={10}
              y={10}
              width={note.width - 20}
              height={note.height - 20}
              isDarkMode={isDarkMode}
              fontSize={16}
              fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              onLinkClick={(url) => {
                // 링크 클릭시 노트 선택 방지
                window.open(url, '_blank', 'noopener,noreferrer');
              }}
            />
          );
        }
        
        return (
          <Text
            x={10}
            y={10}
            width={note.width - 20}
            height={note.height - 20}
            text={content}
            fontSize={16}
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            fill={note.content ? '#1F2937' : '#9CA3AF'}
            wrap="word"
            lineHeight={1.5}
          />
        );
      })()}
    </Group>
  );
};