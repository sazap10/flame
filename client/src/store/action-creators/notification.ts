import type { Dispatch } from 'redux';
import type { NewNotification } from '../../interfaces';
import { ActionType } from '../action-types';
import type {
  ClearNotificationAction,
  CreateNotificationAction,
} from '../actions/notification';

export const createNotification =
  (notification: NewNotification) =>
  (dispatch: Dispatch<CreateNotificationAction>) => {
    dispatch({
      type: ActionType.createNotification,
      payload: notification,
    });
  };

export const clearNotification =
  (id: number) => (dispatch: Dispatch<ClearNotificationAction>) => {
    dispatch({
      type: ActionType.clearNotification,
      payload: id,
    });
  };
