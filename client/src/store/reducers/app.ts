import type { App } from '../../interfaces';
// Import directly (not via the utility barrel) so the reducer doesn't pull in
// modules that import the store singleton, which would be a circular dependency.
import { sortData } from '../../utility/sortData';
import { ActionType } from '../action-types';
import type { Action } from '../actions/index';

interface AppsState {
  loading: boolean;
  apps: App[];
  errors: string | undefined;
  appInUpdate: App | null;
  // Docker State per app id, for apps with container control. An id is absent
  // until the first successful fetch (or when control is disabled server-side).
  containerStates: Record<number, string>;
}

const initialState: AppsState = {
  loading: true,
  apps: [],
  errors: undefined,
  appInUpdate: null,
  containerStates: {},
};

export const appsReducer = (
  state: AppsState = initialState,
  action: Action
): AppsState => {
  switch (action.type) {
    case ActionType.getApps: {
      return {
        ...state,
        loading: true,
        errors: undefined,
      };
    }

    case ActionType.getAppsSuccess: {
      return {
        ...state,
        loading: false,
        apps: action.payload || [],
      };
    }

    case ActionType.pinApp: {
      const appIdx = state.apps.findIndex(
        (app) => app.id === action.payload.id
      );

      return {
        ...state,
        apps: [
          ...state.apps.slice(0, appIdx),
          action.payload,
          ...state.apps.slice(appIdx + 1),
        ],
      };
    }

    case ActionType.addAppSuccess: {
      return {
        ...state,
        apps: [...state.apps, action.payload],
      };
    }

    case ActionType.deleteApp: {
      return {
        ...state,
        apps: [...state.apps].filter((app) => app.id !== action.payload),
      };
    }

    case ActionType.updateApp: {
      const appIdx = state.apps.findIndex(
        (app) => app.id === action.payload.id
      );

      return {
        ...state,
        apps: [
          ...state.apps.slice(0, appIdx),
          action.payload,
          ...state.apps.slice(appIdx + 1),
        ],
      };
    }

    case ActionType.reorderApps: {
      return {
        ...state,
        apps: action.payload,
      };
    }

    case ActionType.sortApps: {
      return {
        ...state,
        apps: sortData<App>(state.apps, action.payload),
      };
    }

    case ActionType.setEditApp: {
      return {
        ...state,
        appInUpdate: action.payload,
      };
    }

    case ActionType.getContainerStatesSuccess: {
      // Replace wholesale so apps whose container disappeared drop out.
      const containerStates: Record<number, string> = {};

      for (const { appId, state: containerState } of action.payload) {
        containerStates[appId] = containerState;
      }

      return {
        ...state,
        containerStates,
      };
    }

    case ActionType.setContainerState: {
      return {
        ...state,
        containerStates: {
          ...state.containerStates,
          [action.payload.appId]: action.payload.state,
        },
      };
    }

    default:
      return state;
  }
};
