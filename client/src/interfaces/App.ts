import type { Model } from '.';

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
  // Set by Docker discovery, never by the user: the container behind this app
  // and whether it opted in to start/stop (flame.control=true).
  containerName: string | null;
  dockerControl: boolean;
}
