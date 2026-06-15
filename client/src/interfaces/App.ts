import { Model } from '.';

export interface NewApp {
  name: string;
  url: string;
  icon: string;
  iconLight: string;
  iconDark: string;
  isPublic: boolean;
  description: string;
  categoryId: number | null;
}

export interface App extends Model, NewApp {
  orderId: number;
  isPinned: boolean;
}
