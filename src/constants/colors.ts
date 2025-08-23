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

// Dark theme colors - Modern, vibrant palette with better contrast
export const NOTE_COLORS_DARK = {
  yellow: {
    primary: '#2d2618',      // Warmer, richer dark yellow
    secondary: '#3a3220',    // Slightly lighter
    accent: '#fbbf24',       // Bright, vibrant yellow
    header: 'rgba(251, 191, 36, 0.12)',
    border: 'rgba(251, 191, 36, 0.25)',
    glow: 'rgba(251, 191, 36, 0.08)',
  },
  pink: {
    primary: '#2d1b2e',      // Deep purple-pink
    secondary: '#3a2439',    // Richer tone
    accent: '#ec4899',       // Vibrant pink
    header: 'rgba(236, 72, 153, 0.12)',
    border: 'rgba(236, 72, 153, 0.25)',
    glow: 'rgba(236, 72, 153, 0.08)',
  },
  blue: {
    primary: '#1e293b',      // Deep navy blue
    secondary: '#2e3f57',    // Lighter navy
    accent: '#60a5fa',       // Sky blue
    header: 'rgba(96, 165, 250, 0.12)',
    border: 'rgba(96, 165, 250, 0.25)',
    glow: 'rgba(96, 165, 250, 0.08)',
  },
  green: {
    primary: '#1a2e1f',      // Forest green
    secondary: '#243832',    // Lighter forest
    accent: '#4ade80',       // Mint green
    header: 'rgba(74, 222, 128, 0.12)',
    border: 'rgba(74, 222, 128, 0.25)',
    glow: 'rgba(74, 222, 128, 0.08)',
  },
  purple: {
    primary: '#2e1f3e',      // Deep purple
    secondary: '#3a2a4a',    // Royal purple
    accent: '#a78bfa',       // Lavender
    header: 'rgba(167, 139, 250, 0.12)',
    border: 'rgba(167, 139, 250, 0.25)',
    glow: 'rgba(167, 139, 250, 0.08)',
  },
  orange: {
    primary: '#2d1f18',      // Burnt orange dark
    secondary: '#3a2820',    // Terracotta
    accent: '#fb923c',       // Bright orange
    header: 'rgba(251, 146, 60, 0.12)',
    border: 'rgba(251, 146, 60, 0.25)',
    glow: 'rgba(251, 146, 60, 0.08)',
  },
} as const;

export const HEADER_HEIGHT = 4; // Minimal header with just color accent
export const PADDING = 20;
export const CORNER_RADIUS = 20; // Rounder corners to match selection border
export const FONT_SIZE = 15;
export const LINE_HEIGHT = 1.6;