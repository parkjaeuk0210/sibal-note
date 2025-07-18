import { useState, useRef, useEffect } from 'react';
import { NoteColor } from '../../types';
import '../../styles/color-picker.css';

interface ColorPickerProps {
  currentColor: NoteColor;
  onColorChange: (color: NoteColor) => void;
}

const colors: { name: NoteColor; hex: string }[] = [
  { name: 'yellow', hex: '#FEF08A' },
  { name: 'pink', hex: '#FBCFE8' },
  { name: 'blue', hex: '#93C5FD' },
  { name: 'green', hex: '#86EFAC' },
  { name: 'purple', hex: '#C4B5FD' },
  { name: 'orange', hex: '#FED7AA' },
];

export const ColorPicker = ({ currentColor, onColorChange }: ColorPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentColorHex = colors.find(c => c.name === currentColor)?.hex || colors[0].hex;

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  // Calculate position for each color in the wheel
  const getColorPosition = (index: number) => {
    const angle = (index * 60 - 90) * (Math.PI / 180);
    const radius = 36;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    };
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Current color button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="glass-button rounded-full p-2 hover:scale-105 transition-transform"
        title="색상 선택"
        aria-label={`현재 색상: ${currentColor}`}
      >
        <div 
          className="w-6 h-6 rounded-full shadow-inner"
          style={{ backgroundColor: currentColorHex }}
        />
      </button>

      {/* Color wheel popover */}
      {isOpen && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2">
          {/* Backdrop blur */}
          <div 
            className="relative w-28 h-28 glass rounded-full p-4 color-wheel-container"
          >
            {/* Center current color */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div 
                className="w-8 h-8 rounded-full shadow-lg ring-2 ring-white"
                style={{ backgroundColor: currentColorHex }}
              />
            </div>

            {/* Color options */}
            {colors.map((color, index) => {
              const position = getColorPosition(index);
              const isSelected = color.name === currentColor;
              
              return (
                <button
                  key={color.name}
                  onClick={() => {
                    onColorChange(color.name);
                    setIsOpen(false);
                  }}
                  className={`absolute w-6 h-6 rounded-full shadow-md transition-all duration-200 hover:scale-125 hover:shadow-lg color-option ${
                    isSelected ? 'ring-2 ring-white ring-offset-1' : ''
                  }`}
                  style={{
                    backgroundColor: color.hex,
                    left: '50%',
                    top: '50%',
                    transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
                  }}
                  title={`색상: ${color.name}`}
                  aria-label={`색상 ${color.name}로 변경`}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};