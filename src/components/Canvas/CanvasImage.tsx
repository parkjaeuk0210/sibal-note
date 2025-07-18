import React, { useRef, useEffect, useState } from 'react';
import { Image, Group, Rect, Transformer } from 'react-konva';
import Konva from 'konva';
import { CanvasImage as CanvasImageType } from '../../types';
import { useCanvasStore } from '../../store/canvasStore';

interface CanvasImageProps {
  image: CanvasImageType;
  isSelected: boolean;
  onSelect: () => void;
  onDraggingChange?: (isDragging: boolean) => void;
  onResizingChange?: (isResizing: boolean) => void;
}

export const CanvasImage = ({ 
  image, 
  isSelected, 
  onSelect,
  onDraggingChange,
  onResizingChange 
}: CanvasImageProps) => {
  const groupRef = useRef<Konva.Group>(null);
  const imageRef = useRef<Konva.Image>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const { updateImage } = useCanvasStore();

  // Load image
  useEffect(() => {
    const img = new window.Image();
    img.src = image.url;
    img.onload = () => {
      setImageObj(img);
    };
  }, [image.url]);

  // Handle transformer
  useEffect(() => {
    if (isSelected && transformerRef.current && imageRef.current) {
      transformerRef.current.nodes([imageRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleDragStart = () => {
    setIsDragging(true);
    onDraggingChange?.(true);
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    setIsDragging(false);
    onDraggingChange?.(false);
    
    const node = e.target;
    updateImage(image.id, {
      x: node.x(),
      y: node.y(),
    });
  };

  const handleTransformStart = () => {
    onResizingChange?.(true);
  };

  const handleTransformEnd = () => {
    onResizingChange?.(false);
    
    const node = imageRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Reset scale and update size
    node.scaleX(1);
    node.scaleY(1);

    updateImage(image.id, {
      x: node.x(),
      y: node.y(),
      width: Math.max(5, node.width() * scaleX),
      height: Math.max(5, node.height() * scaleY),
    });
  };

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    onSelect();
  };

  if (!imageObj) return null;

  return (
    <Group
      ref={groupRef}
      x={image.x}
      y={image.y}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onTap={handleClick}
    >
      {/* Shadow and border for selected state */}
      {isSelected && (
        <Rect
          x={-4}
          y={-4}
          width={image.width + 8}
          height={image.height + 8}
          fill="transparent"
          stroke="#3B82F6"
          strokeWidth={2}
          cornerRadius={8}
          shadowColor="rgba(59, 130, 246, 0.3)"
          shadowBlur={20}
          shadowOpacity={0.5}
        />
      )}
      
      <Image
        ref={imageRef}
        image={imageObj}
        width={image.width}
        height={image.height}
        cornerRadius={8}
        shadowColor={isDragging ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.15)'}
        shadowBlur={isDragging ? 20 : 10}
        shadowOpacity={1}
        shadowOffsetY={isDragging ? 10 : 5}
        onTransformStart={handleTransformStart}
        onTransformEnd={handleTransformEnd}
      />
      
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit minimum size
            if (newBox.width < 50 || newBox.height < 50) {
              return oldBox;
            }
            return newBox;
          }}
          enabledAnchors={[
            'top-left',
            'top-right',
            'bottom-left',
            'bottom-right',
          ]}
          anchorStroke="#3B82F6"
          anchorFill="white"
          anchorSize={12}
          borderStroke="#3B82F6"
          borderStrokeWidth={1}
          borderDash={[4, 4]}
          rotateEnabled={false}
          keepRatio={true}
        />
      )}
    </Group>
  );
};