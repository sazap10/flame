import type { ColorScheme, ThemeColors, ThemeMode } from '../interfaces';
import { parsePABToTheme } from './parseTheme';

// localStorage keys used by the color scheme engine
export const THEME_MODE_KEY = 'themeMode';
export const LIGHT_THEME_KEY = 'lightTheme';
export const DARK_THEME_KEY = 'darkTheme';

// Legacy single-theme key used before the light/dark slot model
const LEGACY_THEME_KEY = 'theme';

const THEME_MODES: ThemeMode[] = ['light', 'dark', 'system'];

// Type guard for stored/config mode values that may be corrupted or stale
export const isThemeMode = (value: unknown): value is ThemeMode =>
  typeof value === 'string' && THEME_MODES.includes(value as ThemeMode);

// Fallback themes used before any slot has been assigned (white / tron)
export const fallbackLightTheme: ThemeColors = parsePABToTheme(
  '#222222;#dddddd;#ffffff'
);
export const fallbackDarkTheme: ThemeColors = parsePABToTheme(
  '#EFFBFF;#6EE2FF;#242B33'
);

// Read the operating system color scheme preference
export const getSystemScheme = (): ColorScheme =>
  window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';

// Resolve a user preference (light/dark/system) to a concrete scheme
export const resolveScheme = (mode: ThemeMode): ColorScheme =>
  mode === 'system' ? getSystemScheme() : mode;

// Read the stored preference from localStorage, validating it and defaulting
// to 'system' for missing or corrupted values
export const getStoredMode = (): ThemeMode => {
  const stored = localStorage.getItem(THEME_MODE_KEY);
  return isThemeMode(stored) ? stored : 'system';
};

// Decide whether a hex color reads as dark, using perceived brightness
export const isDarkColor = (hex: string): boolean => {
  let h = hex.replace('#', '').trim();

  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  }

  if (h.length !== 6) return true; // assume dark when the value is unknown

  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);

  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
};

// One-time migration of the legacy single-theme preference into a slot, so
// users upgrading from the pre-light/dark model keep their saved theme.
export const migrateLegacyTheme = (): void => {
  const legacy = localStorage.getItem(LEGACY_THEME_KEY);

  // Only migrate before a mode preference exists (i.e. on first upgrade)
  if (!legacy || localStorage.getItem(THEME_MODE_KEY)) return;

  const { background } = parsePABToTheme(legacy);
  const scheme: ColorScheme = isDarkColor(background) ? 'dark' : 'light';
  const slotKey = scheme === 'dark' ? DARK_THEME_KEY : LIGHT_THEME_KEY;

  if (!localStorage.getItem(slotKey)) {
    localStorage.setItem(slotKey, legacy);
  }

  // Pin to the matching scheme so the user's existing appearance is preserved
  localStorage.setItem(THEME_MODE_KEY, scheme);
  localStorage.removeItem(LEGACY_THEME_KEY);
};

// Read the colors assigned to a given scheme slot, falling back to defaults
export const getSlotColors = (scheme: ColorScheme): ThemeColors => {
  const key = scheme === 'dark' ? DARK_THEME_KEY : LIGHT_THEME_KEY;
  const stored = localStorage.getItem(key);

  if (stored) {
    return parsePABToTheme(stored);
  }

  return scheme === 'dark' ? fallbackDarkTheme : fallbackLightTheme;
};
