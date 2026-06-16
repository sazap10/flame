import {
  type RenderOptions,
  type RenderResult,
  render,
} from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { thunk } from 'redux-thunk';
import { reducers, type State } from '../store/reducers';

// Build a real store (combined reducers + thunk middleware, exactly like the
// app) seeded with an optional partial state. Missing slices fall back to each
// reducer's own initial state.
export const makeStore = (preloadedState?: Partial<State>) =>
  createStore(
    reducers,
    // The real contract is the `Partial<State>` parameter above: combineReducers
    // fills any omitted slices from their initial state. The `as never` only
    // bridges to createStore's legacy type — redux 5 dropped the PreloadedState
    // helper and, with an enhancer, types this argument as an unsatisfiable
    // `Partial<Record<keyof State, never>>`.
    preloadedState as never,
    applyMiddleware(thunk)
  );

type AppStore = ReturnType<typeof makeStore>;

interface RenderWithStoreOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<State>;
  store?: AppStore;
}

// Render a component inside a Redux Provider and return the store so tests can
// spy on `store.dispatch` or inspect state.
export const renderWithStore = (
  ui: ReactElement,
  {
    preloadedState,
    store = makeStore(preloadedState),
    ...renderOptions
  }: RenderWithStoreOptions = {}
): RenderResult & { store: AppStore } => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};
