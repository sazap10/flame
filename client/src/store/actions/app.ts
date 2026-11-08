import type { App, ContainerState } from '../../interfaces';
import type { ActionType } from '../action-types';

export interface GetAppsAction<T> {
  type:
    | ActionType.getApps
    | ActionType.getAppsSuccess
    | ActionType.getAppsError;
  payload: T;
}
export interface PinAppAction {
  type: ActionType.pinApp;
  payload: App;
}

export interface AddAppAction {
  type: ActionType.addAppSuccess;
  payload: App;
}
export interface DeleteAppAction {
  type: ActionType.deleteApp;
  payload: number;
}

export interface UpdateAppAction {
  type: ActionType.updateApp;
  payload: App;
}

export interface ReorderAppsAction {
  type: ActionType.reorderApps;
  payload: App[];
}

export interface SortAppsAction {
  type: ActionType.sortApps;
  payload: string;
}

export interface SetEditAppAction {
  type: ActionType.setEditApp;
  payload: App | null;
}

export interface GetContainerStatesSuccessAction {
  type: ActionType.getContainerStatesSuccess;
  payload: ContainerState[];
}

export interface SetContainerStateAction {
  type: ActionType.setContainerState;
  payload: ContainerState;
}
