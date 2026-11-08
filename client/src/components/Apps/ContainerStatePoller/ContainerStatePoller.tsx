import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { actionCreators } from '../../../store';
import type { State } from '../../../store/reducers';
import type { AppDispatch } from '../../../store/store';

// How often container state is refreshed while the page is visible.
export const CONTAINER_POLL_INTERVAL = 15 * 1000;

// Headless component keeping Docker container state fresh for apps with
// container control. It fetches once on mount and then polls on an interval,
// pausing while the tab is hidden and refreshing as soon as it's visible again.
// Rendered by the views that show app cards (Home, Applications).
export const ContainerStatePoller = (): null => {
  const dispatch = useDispatch<AppDispatch>();

  // A boolean (not the apps array) so the effect below only re-runs when
  // polling is turned on or off, never when unrelated app data changes.
  const enabled = useSelector(
    (state: State) =>
      state.auth.isAuthenticated &&
      state.apps.apps.some((app) => app.dockerControl)
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let timer: ReturnType<typeof setInterval> | undefined;

    const refresh = () => {
      dispatch(actionCreators.getContainerStates());
    };

    const startPolling = () => {
      if (timer === undefined) {
        timer = setInterval(refresh, CONTAINER_POLL_INTERVAL);
      }
    };

    const stopPolling = () => {
      if (timer !== undefined) {
        clearInterval(timer);
        timer = undefined;
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        refresh();
        startPolling();
      }
    };

    if (!document.hidden) {
      refresh();
      startPolling();
    }

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [enabled, dispatch]);

  return null;
};
