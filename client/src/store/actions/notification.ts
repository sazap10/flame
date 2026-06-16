import type { NewNotification } from '../../interfaces';
import type { ActionType } from '../action-types';

export interface CreateNotificationAction {
  type: ActionType.createNotification;
  payload: NewNotification;
}

export interface ClearNotificationAction {
  type: ActionType.clearNotification;
  payload: number;
}
