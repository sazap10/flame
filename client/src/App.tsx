import { useEffect } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import 'external-svg-loader';

// Redux
import { useDispatch, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import { autoLogin, getConfig, initTheme } from './store/action-creators';
import { actionCreators, store } from './store';
import { State } from './store/reducers';

// Utils
import { checkVersion, decodeToken } from './utility';

// Routes
import { Home } from './components/Home/Home';
import { Apps } from './components/Apps/Apps';
import { Settings } from './components/Settings/Settings';
import { Bookmarks } from './components/Bookmarks/Bookmarks';
import { NotificationCenter } from './components/NotificationCenter/NotificationCenter';

// Apply the stored color scheme as early as possible to avoid a flash
store.dispatch<any>(initTheme());

// Get config
store.dispatch<any>(getConfig());

// Validate token
if (localStorage.token) {
  store.dispatch<any>(autoLogin());
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
        const now = new Date().getTime();

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
  }, []);

  // Seed this browser's scheme preferences from the server defaults on first load
  useEffect(() => {
    if (!loading) {
      initThemeFromConfig(config);
    }
  }, [loading]);

  return (
    <>
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/settings" component={Settings} />
          <Route path="/applications" component={Apps} />
          <Route path="/bookmarks" component={Bookmarks} />
        </Switch>
      </BrowserRouter>
      <NotificationCenter />
    </>
  );
};
