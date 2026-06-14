import { ColorScheme, ThemeColors, ThemeMode } from '../interfaces';
import { parsePABToTheme } from './parseTheme';

// localStorage keys used by the color scheme engine
export const THEME_MODE_KEY = 'themeMode';
export const LIGHT_THEME_KEY = 'lightTheme';
export const DARK_THEME_KEY = 'darkTheme';

// Fallback themes used before any slot has been assigned (white / tron)
export const fallbackLightTheme: ThemeColors =
  parsePABToTheme('#222222;#dddddd;#ffffff');
export const fallbackDarkTheme: ThemeColors =
  parsePABToTheme('#EFFBFF;#6EE2FF;#242B33');

// Read the operating system color scheme preference
export const getSystemScheme = (): ColorScheme =>
  window.matchMedia &&
  window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';

// Resolve a user preference (light/dark/system) to a concrete scheme
export const resolveScheme = (mode: ThemeMode): ColorScheme =>
  mode === 'system' ? getSystemScheme() : mode;

// Read the stored preference from localStorage (defaults to system)
export const getStoredMode = (): ThemeMode =>
  (localStorage.getItem(THEME_MODE_KEY) as ThemeMode) || 'system';

// Read the colors assigned to a given scheme slot, falling back to defaults
export const getSlotColors = (scheme: ColorScheme): ThemeColors => {
  const key = scheme === 'dark' ? DARK_THEME_KEY : LIGHT_THEME_KEY;
  const stored = localStorage.getItem(key);

  if (stored) {
    return parsePABToTheme(stored);
  }

  return scheme === 'dark' ? fallbackDarkTheme : fallbackLightTheme;
};
