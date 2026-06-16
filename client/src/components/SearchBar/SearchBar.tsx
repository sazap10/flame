import {
  Fragment,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

// Redux
import { useDispatch, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
// Typescript
import type { App, Category } from '../../interfaces';
import { actionCreators } from '../../store';
import type { State } from '../../store/reducers';
// Utils
import { redirectUrl, searchParser, urlParser } from '../../utility';
// Components
import { Icon } from '../UI';
// CSS
import classes from './SearchBar.module.css';

interface Props {
  setLocalSearch: (query: string) => void;
  appSearchResult: App[] | null;
  bookmarkSearchResult: Category[] | null;
}

export const SearchBar = (props: Props): JSX.Element => {
  const { config, loading } = useSelector((state: State) => state.config);

  const dispatch = useDispatch();
  const { createNotification } = bindActionCreators(actionCreators, dispatch);

  const { setLocalSearch, appSearchResult, bookmarkSearchResult } = props;

  const inputRef = useRef<HTMLInputElement>(document.createElement('input'));

  // Whether the field has text, so the clear button only shows when relevant.
  const [hasQuery, setHasQuery] = useState(false);

  // First-run tip teaching the search syntax, dismissed for good once seen.
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('searchHintDismissed')) {
      setShowHint(true);
    }
  }, []);

  const dismissHint = useCallback(() => {
    localStorage.setItem('searchHintDismissed', 'true');
    setShowHint(false);
  }, []);

  // Search bar autofocus. Skip on touch-sized screens so opening the page
  // doesn't immediately pop the on-screen keyboard.
  useEffect(() => {
    const isDesktop =
      window.matchMedia?.('(min-width: 769px)')?.matches ?? false;

    if (!loading && !config.disableAutofocus && isDesktop) {
      inputRef.current.focus();
    }
  }, [config, loading]);

  const clearSearch = useCallback(() => {
    inputRef.current.value = '';
    setLocalSearch('');
    setHasQuery(false);
    inputRef.current.focus();
  }, [setLocalSearch]);

  // Listen for keyboard events outside of search bar
  useEffect(() => {
    const keyOutsideFocus = (e: globalThis.KeyboardEvent) => {
      const { key } = e;

      if (key === 'Escape') {
        clearSearch();
      } else if (document.activeElement !== inputRef.current) {
        if (key === '`') {
          inputRef.current.focus();
          clearSearch();
        }
      }
    };

    window.addEventListener('keyup', keyOutsideFocus);

    return () => window.removeEventListener('keyup', keyOutsideFocus);
  }, [clearSearch]);

  const searchHandler = (e: KeyboardEvent<HTMLInputElement>) => {
    const {
      isLocal,
      encodedURL,
      primarySearch,
      secondarySearch,
      isURL,
      sameTab,
      rawQuery,
    } = searchParser(inputRef.current.value);

    if (isLocal) {
      setLocalSearch(encodedURL);
    }

    if (e.code === 'Enter' || e.code === 'NumpadEnter') {
      // Once the user has run a search, they've learned the feature.
      dismissHint();

      if (!primarySearch.prefix) {
        // Prefix not found -> emit notification
        createNotification({
          title: 'No matching search prefix',
          message:
            'Use a slash prefix like /g (Google) or /yt (YouTube), or set a default search provider in Settings.',
        });
      } else if (isURL) {
        // URL or IP passed -> redirect
        const url = urlParser(inputRef.current.value)[1];
        redirectUrl(url, sameTab);
      } else if (isLocal) {
        // Local query -> redirect if at least 1 result found
        if (appSearchResult?.length) {
          redirectUrl(appSearchResult[0].url, sameTab);
        } else if (bookmarkSearchResult?.[0]?.bookmarks?.length) {
          redirectUrl(bookmarkSearchResult[0].bookmarks[0].url, sameTab);
        } else {
          // no local results -> search the internet with the default search provider if query is not empty
          if (!/^ *$/.test(rawQuery)) {
            let template = primarySearch.template;

            if (primarySearch.prefix === 'l') {
              template = secondarySearch.template;
            }

            const url = `${template}${encodedURL}`;
            redirectUrl(url, sameTab);
          }
        }
      } else {
        // Valid query -> redirect to search results
        const url = `${primarySearch.template}${encodedURL}`;
        redirectUrl(url, sameTab);
      }
    } else if (e.code === 'Escape') {
      clearSearch();
    }
  };

  return (
    <Fragment>
      <div className={classes.SearchContainer}>
        <span className={classes.SearchIcon} aria-hidden="true">
          <Icon icon="mdiMagnify" />
        </span>
        <input
          ref={inputRef}
          type="text"
          aria-label="Search applications and bookmarks"
          placeholder="Search apps and bookmarks, or /g /yt /w to search the web"
          className={classes.SearchBar}
          onKeyUp={(e) => searchHandler(e)}
          onChange={() => setHasQuery(inputRef.current.value.length > 0)}
          onDoubleClick={clearSearch}
        />
        {hasQuery && (
          <button
            type="button"
            className={classes.ClearButton}
            onClick={clearSearch}
            aria-label="Clear search"
          >
            <Icon icon="mdiClose" />
          </button>
        )}
      </div>

      {showHint && (
        <div className={classes.SearchHint}>
          <span>
            Tip: type to search, or use a slash prefix like <code>/g</code>{' '}
            Google, <code>/yt</code> YouTube, <code>/w</code> Wikipedia. Press
            Esc to clear.
          </span>
          <button
            type="button"
            className={classes.HintDismiss}
            onClick={dismissHint}
            aria-label="Dismiss search tip"
          >
            <Icon icon="mdiClose" />
          </button>
        </div>
      )}
    </Fragment>
  );
};
