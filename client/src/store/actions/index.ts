import type { App } from '../../interfaces';

import type {
  AddThemeAction,
  DeleteThemeAction,
  EditThemeAction,
  FetchThemesAction,
  SetThemeAction,
  SetColorSchemeAction,
  SetSlotThemeAction,
  UpdateThemeAction,
} from './theme';

import type {
  AddQueryAction,
  DeleteQueryAction,
  FetchQueriesAction,
  GetConfigAction,
  UpdateConfigAction,
  UpdateQueryAction,
} from './config';

import type {
  ClearNotificationAction,
  CreateNotificationAction,
} from './notification';

import type {
  GetAppsAction,
  PinAppAction,
  AddAppAction,
  DeleteAppAction,
  UpdateAppAction,
  ReorderAppsAction,
  SortAppsAction,
  SetEditAppAction,
} from './app';

import type {
  GetCategoriesAction,
  AddCategoryAction,
  PinCategoryAction,
  DeleteCategoryAction,
  UpdateCategoryAction,
  SortCategoriesAction,
  ReorderCategoriesAction,
  AddBookmarkAction,
  DeleteBookmarkAction,
  UpdateBookmarkAction,
  SetEditCategoryAction,
  SetEditBookmarkAction,
  ReorderBookmarksAction,
  SortBookmarksAction,
} from './bookmark';

import type {
  AuthErrorAction,
  AutoLoginAction,
  LoginAction,
  LogoutAction,
  SetAnonymousAuthAction,
} from './auth';

export type Action =
  // Theme
  | SetThemeAction
  | SetColorSchemeAction
  | SetSlotThemeAction
  | FetchThemesAction
  | AddThemeAction
  | DeleteThemeAction
  | UpdateThemeAction
  | EditThemeAction
  // Config
  | GetConfigAction
  | UpdateConfigAction
  | AddQueryAction
  | DeleteQueryAction
  | FetchQueriesAction
  | UpdateQueryAction
  // Notifications
  | CreateNotificationAction
  | ClearNotificationAction
  // Apps
  | GetAppsAction<undefined | App[]>
  | PinAppAction
  | AddAppAction
  | DeleteAppAction
  | UpdateAppAction
  | ReorderAppsAction
  | SortAppsAction
  | SetEditAppAction
  // Categories
  | GetCategoriesAction<any>
  | AddCategoryAction
  | PinCategoryAction
  | DeleteCategoryAction
  | UpdateCategoryAction
  | SortCategoriesAction
  | ReorderCategoriesAction
  | SetEditCategoryAction
  // Bookmarks
  | AddBookmarkAction
  | DeleteBookmarkAction
  | UpdateBookmarkAction
  | SetEditBookmarkAction
  | ReorderBookmarksAction
  | SortBookmarksAction
  // Auth
  | LoginAction
  | LogoutAction
  | AutoLoginAction
  | AuthErrorAction
  | SetAnonymousAuthAction;
