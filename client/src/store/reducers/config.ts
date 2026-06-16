import type { Config, Query } from '../../interfaces';
// Import directly (not via the utility barrel) so the reducer doesn't pull in
// modules that import the store singleton, which would be a circular dependency.
import { configTemplate } from '../../utility/templateObjects/configTemplate';
import { ActionType } from '../action-types';
import type { Action } from '../actions';

interface ConfigState {
  loading: boolean;
  config: Config;
  customQueries: Query[];
}

const initialState: ConfigState = {
  loading: true,
  config: { ...configTemplate },
  customQueries: [],
};

export const configReducer = (
  state: ConfigState = initialState,
  action: Action
): ConfigState => {
  switch (action.type) {
    case ActionType.getConfig:
      return {
        ...state,
        loading: false,
        config: action.payload,
      };

    case ActionType.updateConfig:
      return {
        ...state,
        config: action.payload,
      };

    case ActionType.fetchQueries:
      return {
        ...state,
        customQueries: action.payload,
      };

    case ActionType.addQuery:
      return {
        ...state,
        customQueries: [...state.customQueries, action.payload],
      };

    case ActionType.deleteQuery:
      return {
        ...state,
        customQueries: action.payload,
      };

    case ActionType.updateQuery:
      return {
        ...state,
        customQueries: action.payload,
      };

    default:
      return state;
  }
};
