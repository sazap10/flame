import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { App } from '../../../interfaces';
import { ActionType } from '../../../store/action-types';
import { renderWithStore } from '../../../testing/test-utils';
import { appTemplate } from '../../../utility/templateObjects/appTemplate';
import {
  CONTAINER_POLL_INTERVAL,
  ContainerStatePoller,
} from './ContainerStatePoller';

const { get } = vi.hoisted(() => ({
  get: vi.fn(),
}));

vi.mock('axios', () => ({
  default: { get, post: vi.fn(), isAxiosError: () => false },
}));

const controllableApp: App = {
  ...appTemplate,
  id: 1,
  name: 'Web',
  containerName: 'web',
  dockerControl: true,
};

const stateWith = (apps: App[], isAuthenticated = true) => ({
  apps: {
    loading: false,
    apps,
    errors: undefined,
    appInUpdate: null,
    containerStates: {},
  },
  auth: { isAuthenticated, isAnonymous: false, token: null },
});

const setHidden = (hidden: boolean) => {
  Object.defineProperty(document, 'hidden', {
    configurable: true,
    get: () => hidden,
  });
  document.dispatchEvent(new Event('visibilitychange'));
};

beforeEach(() => {
  vi.useFakeTimers();
  get.mockReset();
  get.mockResolvedValue({ data: { data: [] } });
  setHidden(false);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('ContainerStatePoller', () => {
  it('arms the poll timer once and not again on re-render', async () => {
    // Regression guard: the interval must only be (re)created when polling is
    // switched on or off, never on a re-render or unrelated store change. The
    // interval length is unique to this effect, so counting it isolates it from
    // timers React schedules internally.
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval');

    const { rerender, store } = renderWithStore(<ContainerStatePoller />, {
      preloadedState: stateWith([controllableApp]),
    });
    rerender(<ContainerStatePoller />);

    // Unrelated store change: a new apps array with the same capability.
    await act(async () => {
      store.dispatch({
        type: ActionType.setContainerState,
        payload: { appId: 1, containerName: 'web', state: 'running' },
      });
    });

    const pollTimers = setIntervalSpy.mock.calls.filter(
      ([, delay]) => delay === CONTAINER_POLL_INTERVAL
    );

    expect(pollTimers).toHaveLength(1);
  });

  it('fetches on mount and then once per interval', async () => {
    renderWithStore(<ContainerStatePoller />, {
      preloadedState: stateWith([controllableApp]),
    });
    await act(async () => {});
    expect(get).toHaveBeenCalledTimes(1);
    expect(get.mock.calls[0][0]).toBe('/api/apps/containers');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(CONTAINER_POLL_INTERVAL);
    });
    expect(get).toHaveBeenCalledTimes(2);
  });

  it('pauses while the page is hidden and refreshes when visible again', async () => {
    renderWithStore(<ContainerStatePoller />, {
      preloadedState: stateWith([controllableApp]),
    });
    await act(async () => {});
    expect(get).toHaveBeenCalledTimes(1);

    await act(async () => {
      setHidden(true);
      await vi.advanceTimersByTimeAsync(CONTAINER_POLL_INTERVAL * 3);
    });
    expect(get).toHaveBeenCalledTimes(1);

    await act(async () => {
      setHidden(false);
    });
    expect(get).toHaveBeenCalledTimes(2);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(CONTAINER_POLL_INTERVAL);
    });
    expect(get).toHaveBeenCalledTimes(3);
  });

  it('clears the timer and listener on unmount', async () => {
    const { unmount } = renderWithStore(<ContainerStatePoller />, {
      preloadedState: stateWith([controllableApp]),
    });
    await act(async () => {});
    expect(get).toHaveBeenCalledTimes(1);

    unmount();
    await vi.advanceTimersByTimeAsync(CONTAINER_POLL_INTERVAL * 3);
    setHidden(false);

    expect(get).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('does nothing without controllable apps or when logged out', async () => {
    renderWithStore(<ContainerStatePoller />, {
      preloadedState: stateWith([{ ...controllableApp, dockerControl: false }]),
    });
    renderWithStore(<ContainerStatePoller />, {
      preloadedState: stateWith([controllableApp], false),
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(CONTAINER_POLL_INTERVAL * 2);
    });

    expect(get).not.toHaveBeenCalled();
  });
});
