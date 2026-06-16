import axios, { type AxiosError } from 'axios';
import type { ApiResponse } from '../../interfaces';
import { ActionType } from '../action-types';
import type { AppDispatch } from '../store';
import { getApps, getCategories } from '.';

export const login =
  (formData: { password: string; duration: string }) =>
  async (dispatch: AppDispatch) => {
    try {
      const res = await axios.post<ApiResponse<{ token: string }>>(
        '/api/auth',
        formData
      );

      localStorage.setItem('token', res.data.data.token);

      dispatch({
        type: ActionType.login,
        payload: res.data.data.token,
      });

      dispatch(getApps());
      dispatch(getCategories());
    } catch (err) {
      dispatch(authError(err, true));
    }
  };

export const logout = () => (dispatch: AppDispatch) => {
  localStorage.removeItem('token');

  dispatch({
    type: ActionType.logout,
  });

  dispatch(getApps());
  dispatch(getCategories());
};

export const autoLogin = () => async (dispatch: AppDispatch) => {
  const token: string = localStorage.token;

  try {
    await axios.post<ApiResponse<{ token: { isValid: boolean } }>>(
      '/api/auth/validate',
      { token }
    );

    dispatch({
      type: ActionType.autoLogin,
      payload: token,
    });

    dispatch(getApps());
    dispatch(getCategories());
  } catch (err) {
    dispatch(authError(err, false));
  }
};

export const setAnonymousAuth = () => (dispatch: AppDispatch) => {
  // Drop any stale token so the App expiry timer can't later log us out
  localStorage.removeItem('token');

  dispatch({
    type: ActionType.setAnonymousAuth,
  });

  dispatch(getApps());
  dispatch(getCategories());
};

export const authError =
  (error: unknown, showNotification: boolean) => (dispatch: AppDispatch) => {
    const apiError = error as AxiosError<{ error: string }>;

    if (showNotification) {
      dispatch({
        type: ActionType.createNotification,
        payload: {
          title: 'Error',
          message: apiError.response?.data.error,
        },
      });
    }

    dispatch(getApps());
    dispatch(getCategories());
  };
