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

// Dark theme colors
export const NOTE_COLORS_DARK = {
  yellow: {
    primary: '#78350F',
    secondary: '#92400E',
    accent: '#F59E0B',
    header: 'rgba(245, 158, 11, 0.2)',
    border: 'rgba(245, 158, 11, 0.3)',
  },
  pink: {
    primary: '#831843',
    secondary: '#9F1239',
    accent: '#EC4899',
    header: 'rgba(236, 72, 153, 0.2)',
    border: 'rgba(236, 72, 153, 0.3)',
  },
  blue: {
    primary: '#1E3A8A',
    secondary: '#1E40AF',
    accent: '#3B82F6',
    header: 'rgba(59, 130, 246, 0.2)',
    border: 'rgba(59, 130, 246, 0.3)',
  },
  green: {
    primary: '#14532D',
    secondary: '#166534',
    accent: '#22C55E',
    header: 'rgba(34, 197, 94, 0.2)',
    border: 'rgba(34, 197, 94, 0.3)',
  },
  purple: {
    primary: '#4C1D95',
    secondary: '#5B21B6',
    accent: '#9333EA',
    header: 'rgba(147, 51, 234, 0.2)',
    border: 'rgba(147, 51, 234, 0.3)',
  },
  orange: {
    primary: '#7C2D12',
    secondary: '#9A3412',
    accent: '#F97316',
    header: 'rgba(249, 115, 22, 0.2)',
    border: 'rgba(249, 115, 22, 0.3)',
  },
} as const;

export const HEADER_HEIGHT = 4; // Minimal header with just color accent
export const PADDING = 20;
export const CORNER_RADIUS = 20; // Rounder corners to match selection border
export const FONT_SIZE = 15;
export const LINE_HEIGHT = 1.6;