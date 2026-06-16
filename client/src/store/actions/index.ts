import type { App, Category } from '../../interfaces';
import type {
  AddAppAction,
  DeleteAppAction,
  GetAppsAction,
  PinAppAction,
  ReorderAppsAction,
  SetEditAppAction,
  SortAppsAction,
  UpdateAppAction,
} from './app';
import type {
  AuthErrorAction,
  AutoLoginAction,
  LoginAction,
  LogoutAction,
  SetAnonymousAuthAction,
} from './auth';
import type {
  AddBookmarkAction,
  AddCategoryAction,
  DeleteBookmarkAction,
  DeleteCategoryAction,
  GetCategoriesAction,
  PinCategoryAction,
  ReorderBookmarksAction,
  ReorderCategoriesAction,
  SetEditBookmarkAction,
  SetEditCategoryAction,
  SortBookmarksAction,
  SortCategoriesAction,
  UpdateBookmarkAction,
  UpdateCategoryAction,
} from './bookmark';
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
  AddThemeAction,
  DeleteThemeAction,
  EditThemeAction,
  FetchThemesAction,
  SetColorSchemeAction,
  SetSlotThemeAction,
  SetThemeAction,
  UpdateThemeAction,
} from './theme';

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
  | GetCategoriesAction<undefined | Category[]>
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
