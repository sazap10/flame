import type { Bookmark, Model } from '.';

export interface NewCategory {
  name: string;
  isPublic: boolean;
}

export interface Category extends Model, NewCategory {
  isPinned: boolean;
  orderId: number;
  bookmarks: Bookmark[];
}
