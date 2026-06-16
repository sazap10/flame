import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import 'external-svg-loader';

// Redux
import { useDispatch, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Apps } from './components/Apps/Apps';
import { Bookmarks } from './components/Bookmarks/Bookmarks';
// Routes
import { Home } from './components/Home/Home';
import { NotificationCenter } from './components/NotificationCenter/NotificationCenter';
import { Settings } from './components/Settings/Settings';
import { actionCreators, store } from './store';
import { autoLogin, getConfig, initTheme } from './store/action-creators';
import type { State } from './store/reducers';
import type { AppDispatch } from './store/store';
// Utils
import { checkVersion, decodeToken } from './utility';

// store.dispatch is typed as the base Dispatch; cast to AppDispatch so it
// accepts thunks (action creators that return a function).
const dispatch = store.dispatch as AppDispatch;

// Apply the stored color scheme as early as possible to avoid a flash
dispatch(initTheme());

// Get config
dispatch(getConfig());

// Validate token
if (localStorage.token) {
  dispatch(autoLogin());
}

export const App = (): JSX.Element => {
  const { config, loading } = useSelector((state: State) => state.config);

  const dispath = useDispatch();
  const {
    fetchQueries,
    logout,
    createNotification,
    fetchThemes,
    initThemeFromConfig,
    syncSystemScheme,
  } = bindActionCreators(actionCreators, dispath);

  useEffect(() => {
    // check if token is valid
    const tokenIsValid = setInterval(() => {
      if (localStorage.token) {
        const expiresIn = decodeToken(localStorage.token).exp * 1000;
        const now = Date.now();

        if (now > expiresIn) {
          logout();
          createNotification({
            title: 'Info',
            message: 'Session expired. You have been logged out',
          });
        }
      }
    }, 1000);

    // load themes
    fetchThemes();

    // re-apply theme when the OS color scheme changes (only affects 'system' mode)
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const schemeListener = () => syncSystemScheme();

    if (mql.addEventListener) {
      mql.addEventListener('change', schemeListener);
    } else {
      // Safari < 14 fallback
      mql.addListener(schemeListener);
    }

    // check for updated
    checkVersion();

    // load custom search queries
    fetchQueries();

    return () => {
      window.clearInterval(tokenIsValid);

      if (mql.removeEventListener) {
        mql.removeEventListener('change', schemeListener);
      } else {
        mql.removeListener(schemeListener);
      }
    };
  }, [
    logout,
    syncSystemScheme, // load themes
    fetchThemes, // load custom search queries
    fetchQueries,
    createNotification,
  ]);

  // Seed this browser's scheme preferences from the server defaults on first load
  useEffect(() => {
    if (!loading) {
      initThemeFromConfig(config);
    }
  }, [loading, initThemeFromConfig, config]);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/settings/*" element={<Settings />} />
          <Route path="/applications" element={<Apps searching={false} />} />
          <Route path="/bookmarks" element={<Bookmarks searching={false} />} />
        </Routes>
      </BrowserRouter>
      <NotificationCenter />
    </>
  );
};
