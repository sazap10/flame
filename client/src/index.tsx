import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

import { Provider } from 'react-redux';
import { App } from './App';
import { store } from './store/store';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element #root was not found in the document');
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
