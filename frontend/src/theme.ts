// Theme configuration for Corralejo 2026 App
// Dark theme with lime accent color

export const theme = {
  // Base colors
  colors: {
    background: '#09090b',
    surface: '#18181b',
    surfaceElevated: '#27272a',
    border: '#3f3f46',
    text: '#fafafa',
    textSecondary: '#a1a1aa',
    textMuted: '#71717a',
    accent: '#bef264', // Lime
    accentHover: '#a3e635',
    error: '#ef4444',
    warning: '#f59e0b',
    success: '#22c55e',
    info: '#3b82f6',
  },
  
  // Session type colors
  sessionTypes: {
    corsaLenta: { color: '#3b82f6', label: 'Corsa Lenta', icon: '🏃' }, // Blue
    lungo: { color: '#a855f7', label: 'Lungo', icon: '🏃‍♂️' }, // Purple
    ripetute: { color: '#ef4444', label: 'Ripetute', icon: '⚡' }, // Red
    ripetuteSalita: { color: '#f59e0b', label: 'Ripetute Salita', icon: '⛰️' }, // Amber
    progressivo: { color: '#f97316', label: 'Progressivo', icon: '📈' }, // Orange
    rinforzo: { color: '#22c55e', label: 'Rinforzo', icon: '💪' }, // Green
    cyclette: { color: '#06b6d4', label: 'Cyclette', icon: '🚴' }, // Cyan
    riposo: { color: '#71717a', label: 'Riposo', icon: '😴' }, // Gray
    test: { color: '#bef264', label: 'Test', icon: '🎯' }, // Lime
    gara: { color: '#eab308', label: 'Gara', icon: '🏆' }, // Gold
  },
  
  // Training phase colors
  phases: {
    ripresa: { color: '#22c55e', label: '🟢 Ripresa' },
    baseAerobica: { color: '#3b82f6', label: '🔵 Base Aerobica' },
    sviluppo: { color: '#eab308', label: '🟡 Sviluppo' },
    prepSpecifica: { color: '#f97316', label: '🟠 Prep. Specifica' },
    picco: { color: '#ef4444', label: '🔴 Picco' },
    tapering: { color: '#fafafa', label: '⚪ Tapering' },
  },
  
  // Spacing (multiples of 4px)
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  
  // Border radius
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  
  // Font sizes
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    title: 40,
  },
  
  // Font weights
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // HR Zones (absolute BPM values based on FC max)
  hrZones: {
    z1: { label: 'Z1 - Recupero', max: 117, color: '#22c55e' },
    z2: { label: 'Z2 - Aerobica', min: 117, max: 146, color: '#3b82f6' },
    z3: { label: 'Z3 - Tempo', min: 147, max: 160, color: '#f59e0b' },
    z4: { label: 'Z4 - Soglia', min: 161, max: 175, color: '#ef4444' },
    z5: { label: 'Z5 - VO2max', min: 175, color: '#7c3aed' },
  },
  
  // VDOT Pace Zones (Daniels)
  vdotZones: {
    easy: { label: 'Easy', percent: 65 },
    marathon: { label: 'Marathon', percent: 79 },
    threshold: { label: 'Threshold', percent: 88 },
    interval: { label: 'Interval', percent: 98 },
    repetition: { label: 'Repetition', percent: 105 },
  },
  
  // Badge levels
  badgeLevels: {
    warmup: { label: '🏃 Warm-up', color: '#71717a' },
    bronze: { label: '🥉 Bronzo', color: '#cd7f32' },
    silver: { label: '🥈 Argento', color: '#c0c0c0' },
    gold: { label: '🥇 Oro', color: '#ffd700' },
    platinum: { label: '💎 Platino', color: '#e5e4e2' },
    elite: { label: '👑 Elite', color: '#bef264' },
  },
};

export type Theme = typeof theme;
export default theme;
