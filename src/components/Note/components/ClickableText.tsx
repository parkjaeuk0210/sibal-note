import React, { useCallback, useState, useRef, useEffect, useMemo } from 'react';
import { Text, Group } from 'react-konva';
import { FONT_SIZE, LINE_HEIGHT } from '../../../constants/colors';
import { parseTextWithURLs } from '../../../utils/urlDetection';
import Konva from 'konva';

interface ClickableTextProps {
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isDarkMode: boolean;
  fontSize?: number;
  fontFamily?: string;
}

interface URLRegion {
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const ClickableText: React.FC<ClickableTextProps> = ({
  content,
  x,
  y,
  width,
  height,
  isDarkMode,
  fontSize = FONT_SIZE,
  fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif"
}) => {
  const textColor = isDarkMode ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.85)";
  
  const [urlRegions, setUrlRegions] = useState<URLRegion[]>([]);
  const textRef = useRef<Konva.Text>(null);
  
  const handleLinkClick = useCallback((url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);
  
  // segments를 useMemo로 메모이제이션하여 무한 루프 방지
  const { segments, fullText } = useMemo(() => {
    const segs = parseTextWithURLs(content);
    const text = segs.map(s => s.content).join('');
    return { segments: segs, fullText: text };
  }, [content]);
  
  // URL 영역 계산
  useEffect(() => {
    const regions: URLRegion[] = [];
    let currentIndex = 0;
    
    segments.forEach(segment => {
      if (segment.type === 'url' && segment.url) {
        // 간단한 계산 - 실제로는 더 정교한 텍스트 측정 필요
        const startX = (currentIndex * fontSize * 0.6) % width;
        const startY = Math.floor((currentIndex * fontSize * 0.6) / width) * fontSize * LINE_HEIGHT;
        
        regions.push({
          url: segment.url,
          x: startX,
          y: startY,
          width: segment.content.length * fontSize * 0.6,
          height: fontSize * LINE_HEIGHT
        });
      }
      currentIndex += segment.content.length;
    });
    
    setUrlRegions(regions);
  }, [segments, fontSize, width]);
  
  const handleClick = useCallback((e: any) => {
    const pos = e.target.getRelativePointerPosition();
    if (!pos) return;
    
    // 클릭한 위치가 URL 영역인지 확인
    for (const region of urlRegions) {
      if (
        pos.x >= region.x &&
        pos.x <= region.x + region.width &&
        pos.y >= region.y &&
        pos.y <= region.y + region.height
      ) {
        handleLinkClick(region.url);
        break;
      }
    }
  }, [urlRegions, handleLinkClick]);
  
  // 실제로는 개별 세그먼트 렌더링이 이상적이지만,
  // Konva의 텍스트 래핑 문제로 인해 단일 텍스트로 렌더링
  return (
    <Group>
      <Text
        ref={textRef}
        x={x}
        y={y}
        width={width}
        height={height}
        text={fullText}
        fontSize={fontSize}
        fontFamily={fontFamily}
        fill={textColor}
        wrap="word"
        lineHeight={LINE_HEIGHT}
        onClick={handleClick}
        onTap={handleClick}
        onMouseMove={(e) => {
          const pos = e.target.getRelativePointerPosition();
          if (!pos) return;
          
          let isOverUrl = false;
          for (const region of urlRegions) {
            if (
              pos.x >= region.x &&
              pos.x <= region.x + region.width &&
              pos.y >= region.y &&
              pos.y <= region.y + region.height
            ) {
              isOverUrl = true;
              break;
            }
          }
          
          const stage = e.target.getStage();
          if (stage) {
            stage.container().style.cursor = isOverUrl ? 'pointer' : 'text';
          }
        }}
        onMouseLeave={(e) => {
          const stage = e.target.getStage();
          if (stage) {
            stage.container().style.cursor = 'default';
          }
        }}
      />
    </Group>
  );
};