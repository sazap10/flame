import type { Action } from '../actions';
import { ActionType } from '../action-types';

interface AuthState {
  isAuthenticated: boolean;
  isAnonymous: boolean;
  token: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isAnonymous: false,
  token: null,
};

export const authReducer = (
  state: AuthState = initialState,
  action: Action
): AuthState => {
  switch (action.type) {
    case ActionType.login:
      return {
        ...state,
        token: action.payload,
        isAuthenticated: true,
        isAnonymous: false,
      };

    case ActionType.logout:
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        isAnonymous: false,
      };

    case ActionType.autoLogin:
      return {
        ...state,
        token: action.payload,
        isAuthenticated: true,
        isAnonymous: false,
      };

    case ActionType.authError:
      // In anonymous mode the user is authenticated without a token, so a failed
      // token validation (e.g. a stale token from before anon mode was enabled)
      // must not log them out.
      if (state.isAnonymous) {
        return state;
      }

      return {
        ...state,
        token: null,
        isAuthenticated: false,
      };

    case ActionType.setAnonymousAuth:
      return {
        ...state,
        token: null,
        isAuthenticated: true,
        isAnonymous: true,
      };

    default:
      return state;
  }
};
