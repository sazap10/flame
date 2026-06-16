import axios, { type AxiosError } from 'axios';
import type { Dispatch } from 'redux';
import type { ApiResponse, Config, Query } from '../../interfaces';
import type { ConfigFormData } from '../../types';
import { applyAuth, storeUIConfig } from '../../utility';
import { ActionType } from '../action-types';
import type {
  DeleteQueryAction,
  FetchQueriesAction,
  UpdateQueryAction,
} from '../actions/config';
import type { AppDispatch } from '../store';
import { setAnonymousAuth } from './auth';

const keys: (keyof Config)[] = [
  'useAmericanDate',
  'greetingsSchema',
  'daySchema',
  'monthSchema',
  'showTime',
  'hideDate',
];

export const getConfig = () => async (dispatch: AppDispatch) => {
  try {
    const res = await axios.get<ApiResponse<Config>>('/api/config');

    dispatch({
      type: ActionType.getConfig,
      payload: res.data.data,
    });

    // Enable anonymous auth when the server reports it is configured
    if (res.data.data.isAnonymousAuth) {
      dispatch(setAnonymousAuth());
    }

    // Set custom page title if set
    document.title = res.data.data.customTitle;

    // Store settings for priority UI elements
    for (const key of keys) {
      storeUIConfig(key, res.data.data);
    }
  } catch (err) {
    console.log(err);
  }
};

export const updateConfig =
  (formData: ConfigFormData) => async (dispatch: AppDispatch) => {
    try {
      const res = await axios.put<ApiResponse<Config>>(
        '/api/config',
        formData,
        {
          headers: applyAuth(),
        }
      );

      dispatch({
        type: ActionType.createNotification,
        payload: {
          title: 'Success',
          message: 'Settings updated',
        },
      });

      dispatch({
        type: ActionType.updateConfig,
        payload: res.data.data,
      });

      // Store settings for priority UI elements
      for (const key of keys) {
        storeUIConfig(key, res.data.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

export const fetchQueries =
  () => async (dispatch: Dispatch<FetchQueriesAction>) => {
    try {
      const res = await axios.get<ApiResponse<Query[]>>('/api/queries');

      dispatch({
        type: ActionType.fetchQueries,
        payload: res.data.data,
      });
    } catch (err) {
      console.log(err);
    }
  };

export const addQuery = (query: Query) => async (dispatch: AppDispatch) => {
  try {
    const res = await axios.post<ApiResponse<Query>>('/api/queries', query, {
      headers: applyAuth(),
    });

    dispatch({
      type: ActionType.addQuery,
      payload: res.data.data,
    });
  } catch (err) {
    const error = err as AxiosError<{ error: string }>;

    dispatch({
      type: ActionType.createNotification,
      payload: {
        title: 'Error',
        message: error.response?.data.error,
      },
    });
  }
};

export const deleteQuery =
  (prefix: string) => async (dispatch: Dispatch<DeleteQueryAction>) => {
    try {
      const res = await axios.delete<ApiResponse<Query[]>>(
        `/api/queries/${prefix}`,
        {
          headers: applyAuth(),
        }
      );

      dispatch({
        type: ActionType.deleteQuery,
        payload: res.data.data,
      });
    } catch (err) {
      console.log(err);
    }
  };

export const updateQuery =
  (query: Query, oldPrefix: string) =>
  async (dispatch: Dispatch<UpdateQueryAction>) => {
    try {
      const res = await axios.put<ApiResponse<Query[]>>(
        `/api/queries/${oldPrefix}`,
        query,
        {
          headers: applyAuth(),
        }
      );

      dispatch({
        type: ActionType.updateQuery,
        payload: res.data.data,
      });
    } catch (err) {
      console.log(err);
    }
  };
