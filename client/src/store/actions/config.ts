import type { Config, Query } from '../../interfaces';
import type { ActionType } from '../action-types';

export interface GetConfigAction {
  type: ActionType.getConfig;
  payload: Config;
}

export interface UpdateConfigAction {
  type: ActionType.updateConfig;
  payload: Config;
}

export interface FetchQueriesAction {
  type: ActionType.fetchQueries;
  payload: Query[];
}

export interface AddQueryAction {
  type: ActionType.addQuery;
  payload: Query;
}

export interface DeleteQueryAction {
  type: ActionType.deleteQuery;
  payload: Query[];
}

export interface UpdateQueryAction {
  type: ActionType.updateQuery;
  payload: Query[];
}
