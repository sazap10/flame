import { Dispatch } from 'redux';
import {
  AddThemeAction,
  DeleteThemeAction,
  EditThemeAction,
  FetchThemesAction,
  SetColorSchemeAction,
  SetSlotThemeAction,
  UpdateThemeAction,
} from '../actions/theme';
import { ActionType } from '../action-types';
import {
  Theme,
  ApiResponse,
  ThemeColors,
  ThemeMode,
  ColorScheme,
  Config,
} from '../../interfaces';
import {
  applyAuth,
  parseThemeToPAB,
  resolveScheme,
  getStoredMode,
  getSlotColors,
  THEME_MODE_KEY,
  LIGHT_THEME_KEY,
  DARK_THEME_KEY,
} from '../../utility';
import axios, { AxiosError } from 'axios';

// Write theme colors to CSS variables and reflect the active scheme on <body>
const applyColors = (colors: ThemeColors, scheme: ColorScheme): void => {
  for (const [key, value] of Object.entries(colors)) {
    document.body.style.setProperty(`--color-${key}`, value);
  }

  document.body.dataset.colorScheme = scheme;
};

// Apply the stored color scheme on app start (prevents flash of default theme)
export const initTheme =
  () => (dispatch: Dispatch<SetColorSchemeAction>) => {
    const mode = getStoredMode();
    const scheme = resolveScheme(mode);
    const colors = getSlotColors(scheme);

    applyColors(colors, scheme);

    dispatch({
      type: ActionType.setColorScheme,
      payload: { mode, scheme, colors },
    });
  };

// Change the user color scheme preference (light / dark / system)
export const setThemeMode =
  (mode: ThemeMode) => (dispatch: Dispatch<SetColorSchemeAction>) => {
    localStorage.setItem(THEME_MODE_KEY, mode);

    const scheme = resolveScheme(mode);
    const colors = getSlotColors(scheme);

    applyColors(colors, scheme);

    dispatch({
      type: ActionType.setColorScheme,
      payload: { mode, scheme, colors },
    });
  };

// Re-resolve and apply the active scheme. Used when the OS preference changes
// while the user is in 'system' mode.
export const syncSystemScheme =
  () => (dispatch: Dispatch<SetColorSchemeAction>) => {
    const mode = getStoredMode();

    if (mode !== 'system') return;

    const scheme = resolveScheme(mode);
    const colors = getSlotColors(scheme);

    applyColors(colors, scheme);

    dispatch({
      type: ActionType.setColorScheme,
      payload: { mode, scheme, colors },
    });
  };

// Assign a theme to a scheme slot (light or dark). Applies immediately if the
// assigned slot matches the currently active scheme.
export const setSlotTheme =
  (scheme: ColorScheme, colors: ThemeColors) =>
  (dispatch: Dispatch<SetSlotThemeAction | SetColorSchemeAction>) => {
    const key = scheme === 'dark' ? DARK_THEME_KEY : LIGHT_THEME_KEY;
    localStorage.setItem(key, parseThemeToPAB(colors));

    dispatch({
      type: ActionType.setSlotTheme,
      payload: { scheme, colors },
    });

    const mode = getStoredMode();

    if (resolveScheme(mode) === scheme) {
      applyColors(colors, scheme);

      dispatch({
        type: ActionType.setColorScheme,
        payload: { mode, scheme, colors },
      });
    }
  };

// Quick-pick a theme for the currently active scheme (used by the theme grid)
export const setTheme =
  (colors: ThemeColors) =>
  (dispatch: Dispatch<SetSlotThemeAction | SetColorSchemeAction>) => {
    const scheme = resolveScheme(getStoredMode());
    setSlotTheme(scheme, colors)(dispatch);
  };

// Seed this browser's scheme preferences from the server defaults the first
// time it loads (no localStorage choices yet), then apply them.
export const initThemeFromConfig =
  (config: Config) => (dispatch: Dispatch<SetColorSchemeAction>) => {
    if (!localStorage.getItem(THEME_MODE_KEY)) {
      localStorage.setItem(
        THEME_MODE_KEY,
        config.defaultColorScheme || 'system'
      );
    }

    if (!localStorage.getItem(LIGHT_THEME_KEY) && config.defaultLightTheme) {
      localStorage.setItem(LIGHT_THEME_KEY, config.defaultLightTheme);
    }

    if (!localStorage.getItem(DARK_THEME_KEY) && config.defaultDarkTheme) {
      localStorage.setItem(DARK_THEME_KEY, config.defaultDarkTheme);
    }

    const mode = getStoredMode();
    const scheme = resolveScheme(mode);
    const colors = getSlotColors(scheme);

    applyColors(colors, scheme);

    dispatch({
      type: ActionType.setColorScheme,
      payload: { mode, scheme, colors },
    });
  };

export const fetchThemes =
  () => async (dispatch: Dispatch<FetchThemesAction>) => {
    try {
      const res = await axios.get<ApiResponse<Theme[]>>('/api/themes');

      dispatch({
        type: ActionType.fetchThemes,
        payload: res.data.data,
      });
    } catch (err) {
      console.log(err);
    }
  };

export const addTheme =
  (theme: Theme) => async (dispatch: Dispatch<AddThemeAction>) => {
    try {
      const res = await axios.post<ApiResponse<Theme>>('/api/themes', theme, {
        headers: applyAuth(),
      });

      dispatch({
        type: ActionType.addTheme,
        payload: res.data.data,
      });

      dispatch<any>({
        type: ActionType.createNotification,
        payload: {
          title: 'Success',
          message: 'Theme added',
        },
      });
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;

      dispatch<any>({
        type: ActionType.createNotification,
        payload: {
          title: 'Error',
          message: error.response?.data.error,
        },
      });
    }
  };

export const deleteTheme =
  (name: string) => async (dispatch: Dispatch<DeleteThemeAction>) => {
    try {
      const res = await axios.delete<ApiResponse<Theme[]>>(
        `/api/themes/${name}`,
        { headers: applyAuth() }
      );

      dispatch({
        type: ActionType.deleteTheme,
        payload: res.data.data,
      });

      dispatch<any>({
        type: ActionType.createNotification,
        payload: {
          title: 'Success',
          message: 'Theme deleted',
        },
      });
    } catch (err) {
      console.log(err);
    }
  };

export const editTheme =
  (theme: Theme | null) => (dispatch: Dispatch<EditThemeAction>) => {
    dispatch({
      type: ActionType.editTheme,
      payload: theme,
    });
  };

export const updateTheme =
  (theme: Theme, originalName: string) =>
  async (dispatch: Dispatch<UpdateThemeAction>) => {
    try {
      const res = await axios.put<ApiResponse<Theme[]>>(
        `/api/themes/${originalName}`,
        theme,
        { headers: applyAuth() }
      );

      dispatch({
        type: ActionType.updateTheme,
        payload: res.data.data,
      });
    } catch (err) {
      console.log(err);
    }
  };
