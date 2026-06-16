import type { Action } from '../actions';
import { ActionType } from '../action-types';
import type { ColorScheme, Theme, ThemeColors, ThemeMode } from '../../interfaces';
import {
  arrayPartition,
  getSlotColors,
  getStoredMode,
  resolveScheme,
} from '../../utility';

interface ThemeState {
  activeTheme: Theme;
  themes: Theme[];
  userThemes: Theme[];
  themeInEdit: Theme | null;
  mode: ThemeMode;
  scheme: ColorScheme;
  lightTheme: ThemeColors;
  darkTheme: ThemeColors;
}

const mode = getStoredMode();
const scheme = resolveScheme(mode);
const lightTheme = getSlotColors('light');
const darkTheme = getSlotColors('dark');
const activeColors = scheme === 'dark' ? darkTheme : lightTheme;

const initialState: ThemeState = {
  activeTheme: {
    name: 'main',
    isCustom: false,
    colors: {
      ...activeColors,
    },
  },
  themes: [],
  userThemes: [],
  themeInEdit: null,
  mode,
  scheme,
  lightTheme,
  darkTheme,
};

export const themeReducer = (
  state: ThemeState = initialState,
  action: Action
): ThemeState => {
  switch (action.type) {
    case ActionType.setColorScheme: {
      return {
        ...state,
        mode: action.payload.mode,
        scheme: action.payload.scheme,
        activeTheme: {
          ...state.activeTheme,
          colors: action.payload.colors,
        },
      };
    }

    case ActionType.setSlotTheme: {
      return {
        ...state,
        ...(action.payload.scheme === 'dark'
          ? { darkTheme: action.payload.colors }
          : { lightTheme: action.payload.colors }),
      };
    }

    case ActionType.fetchThemes: {
      const [themes, userThemes] = arrayPartition<Theme>(
        action.payload,
        (e) => !e.isCustom
      );

      return {
        ...state,
        themes,
        userThemes,
      };
    }

    case ActionType.addTheme: {
      return {
        ...state,
        userThemes: [...state.userThemes, action.payload],
      };
    }

    case ActionType.deleteTheme: {
      return {
        ...state,
        userThemes: action.payload,
      };
    }

    case ActionType.editTheme: {
      return {
        ...state,
        themeInEdit: action.payload,
      };
    }

    case ActionType.updateTheme: {
      return {
        ...state,
        userThemes: action.payload,
      };
    }

    default:
      return state;
  }
};
