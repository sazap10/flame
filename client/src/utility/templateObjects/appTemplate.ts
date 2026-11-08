import type { App, NewApp } from '../../interfaces';

export const newAppTemplate: NewApp = {
  name: '',
  url: '',
  icon: '',
  iconLight: '',
  iconDark: '',
  isPublic: true,
  description: '',
  categoryId: -1,
};

export const appTemplate: App = {
  ...newAppTemplate,
  isPinned: false,
  orderId: 0,
  containerName: null,
  dockerControl: false,
  id: -1,
  createdAt: new Date(),
  updatedAt: new Date(),
};
