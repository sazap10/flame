export interface ThemeColors {
  background: string;
  primary: string;
  accent: string;
}

export interface Theme {
  name: string;
  colors: ThemeColors;
  isCustom: boolean;
}

// User-selectable color scheme preference
export type ThemeMode = 'light' | 'dark' | 'system';

// Resolved color scheme actually applied to the page
export type ColorScheme = 'light' | 'dark';
