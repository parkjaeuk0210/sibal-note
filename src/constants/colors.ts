// Light theme colors
export const NOTE_COLORS = {
  yellow: {
    primary: '#FFFBEB',
    secondary: '#FEF3C7',
    accent: '#F59E0B',
    header: 'rgba(245, 158, 11, 0.1)',
    border: 'rgba(245, 158, 11, 0.15)',
  },
  pink: {
    primary: '#FDF2F8',
    secondary: '#FCE7F3',
    accent: '#EC4899',
    header: 'rgba(236, 72, 153, 0.1)',
    border: 'rgba(236, 72, 153, 0.15)',
  },
  blue: {
    primary: '#EFF6FF',
    secondary: '#DBEAFE',
    accent: '#3B82F6',
    header: 'rgba(59, 130, 246, 0.1)',
    border: 'rgba(59, 130, 246, 0.15)',
  },
  green: {
    primary: '#F0FDF4',
    secondary: '#DCFCE7',
    accent: '#22C55E',
    header: 'rgba(34, 197, 94, 0.1)',
    border: 'rgba(34, 197, 94, 0.15)',
  },
  purple: {
    primary: '#FAF5FF',
    secondary: '#F3E8FF',
    accent: '#9333EA',
    header: 'rgba(147, 51, 234, 0.1)',
    border: 'rgba(147, 51, 234, 0.15)',
  },
  orange: {
    primary: '#FFF7ED',
    secondary: '#FED7AA',
    accent: '#F97316',
    header: 'rgba(249, 115, 22, 0.1)',
    border: 'rgba(249, 115, 22, 0.15)',
  },
} as const;

// Dark theme colors - Apple-inspired sophisticated palette
export const NOTE_COLORS_DARK = {
  yellow: {
    primary: '#3A3424',
    secondary: '#4A4228',
    accent: '#E6B86A',
    header: 'rgba(230, 184, 106, 0.15)',
    border: 'rgba(230, 184, 106, 0.2)',
  },
  pink: {
    primary: '#3A2832',
    secondary: '#4A3240',
    accent: '#E67AB8',
    header: 'rgba(230, 122, 184, 0.15)',
    border: 'rgba(230, 122, 184, 0.2)',
  },
  blue: {
    primary: '#2A3142',
    secondary: '#34394A',
    accent: '#6BA3F7',
    header: 'rgba(107, 163, 247, 0.15)',
    border: 'rgba(107, 163, 247, 0.2)',
  },
  green: {
    primary: '#283A2F',
    secondary: '#32453A',
    accent: '#5FD582',
    header: 'rgba(95, 213, 130, 0.15)',
    border: 'rgba(95, 213, 130, 0.2)',
  },
  purple: {
    primary: '#342A42',
    secondary: '#42344A',
    accent: '#B366EF',
    header: 'rgba(179, 102, 239, 0.15)',
    border: 'rgba(179, 102, 239, 0.2)',
  },
  orange: {
    primary: '#3A2F28',
    secondary: '#4A3A32',
    accent: '#F4994C',
    header: 'rgba(244, 153, 76, 0.15)',
    border: 'rgba(244, 153, 76, 0.2)',
  },
} as const;

export const HEADER_HEIGHT = 4; // Minimal header with just color accent
export const PADDING = 20;
export const CORNER_RADIUS = 20; // Rounder corners to match selection border
export const FONT_SIZE = 15;
export const LINE_HEIGHT = 1.6;