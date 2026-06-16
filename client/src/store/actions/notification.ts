import type { ActionType } from '../action-types';
import type { NewNotification } from '../../interfaces';

export interface CreateNotificationAction {
  type: ActionType.createNotification;
  payload: NewNotification;
}

export interface ClearNotificationAction {
  type: ActionType.clearNotification;
  payload: number;
}
