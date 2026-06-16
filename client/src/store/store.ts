import { composeWithDevTools } from '@redux-devtools/extension';
import { applyMiddleware, createStore, type UnknownAction } from 'redux';
import { type ThunkDispatch, thunk } from 'redux-thunk';
import { reducers, type State } from './reducers';

export const store = createStore(
  reducers,
  {},
  composeWithDevTools(applyMiddleware(thunk))
);

// Dispatch type that also accepts thunks (action creators that return a
// function), so a thunk can dispatch other thunks without an `any` cast.
export type AppDispatch = ThunkDispatch<State, unknown, UnknownAction>;
