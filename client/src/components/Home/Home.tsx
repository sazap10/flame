import { Fragment, useEffect, useState } from 'react';
// Redux
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
// Typescript
import type { App, Category } from '../../interfaces';
import { actionCreators } from '../../store';
import type { State } from '../../store/reducers';
// Utils
import { escapeRegex } from '../../utility';
// Components
import { AppCategoryGrid } from '../Apps/AppGrid/AppCategoryGrid';
import { BookmarkGrid } from '../Bookmarks/BookmarkGrid/BookmarkGrid';
import { SearchBar } from '../SearchBar/SearchBar';
// UI
import { Container, Icon, Message, SectionHeadline, Spinner } from '../UI';
import { Header } from './Header/Header';
// CSS
import classes from './Home.module.css';

export const Home = (): JSX.Element => {
  const {
    apps: { apps, loading: appsLoading },
    bookmarks: { categories, loading: bookmarksLoading },
    config: { config },
    auth: { isAuthenticated },
  } = useSelector((state: State) => state);

  const dispatch = useDispatch();
  const { getApps, getCategories } = bindActionCreators(
    actionCreators,
    dispatch
  );

  // Local search query
  const [localSearch, setLocalSearch] = useState<null | string>(null);
  const [appSearchResult, setAppSearchResult] = useState<null | App[]>(null);
  const [bookmarkSearchResult, setBookmarkSearchResult] = useState<
    null | Category[]
  >(null);

  // Load applications
  useEffect(() => {
    if (!apps.length) {
      getApps();
    }
  }, []);

  // Load bookmark categories
  useEffect(() => {
    if (!categories.length) {
      getCategories();
    }
  }, []);

  useEffect(() => {
    if (localSearch) {
      // Search through apps
      setAppSearchResult([
        ...apps.filter(({ name, description }) =>
          new RegExp(escapeRegex(localSearch), 'i').test(
            `${name} ${description}`
          )
        ),
      ]);

      // Search through bookmarks
      const category = { ...categories[0] };

      category.name = 'Search Results';
      category.bookmarks = categories
        .flatMap(({ bookmarks }) => bookmarks)
        .filter(({ name }) =>
          new RegExp(escapeRegex(localSearch), 'i').test(name)
        );

      setBookmarkSearchResult([category]);
    } else {
      setAppSearchResult(null);
      setBookmarkSearchResult(null);
    }
  }, [localSearch]);

  return (
    <Container>
      {!config.hideSearch ? (
        <SearchBar
          setLocalSearch={setLocalSearch}
          appSearchResult={appSearchResult}
          bookmarkSearchResult={bookmarkSearchResult}
        />
      ) : (
        <div></div>
      )}

      <Header />

      {!isAuthenticated &&
      !apps.some((a) => a.isPinned) &&
      !categories.some((c) => c.isPinned) ? (
        <Message>
          Welcome to Flame! Go to <Link to="/settings/app">/settings</Link>,
          login and start customizing your new homepage
        </Message>
      ) : null}

      {!config.hideApps && (isAuthenticated || apps.some((a) => a.isPinned)) ? (
        <Fragment>
          <SectionHeadline title="Applications" link="/applications" />
          {appsLoading ? (
            <Spinner />
          ) : (
            <AppCategoryGrid
              apps={
                !appSearchResult
                  ? apps.filter(({ isPinned }) => isPinned)
                  : appSearchResult
              }
              categories={categories}
              totalApps={apps.length}
              searching={!!localSearch}
            />
          )}
          <div className={classes.HomeSpace}></div>
        </Fragment>
      ) : null}

      {!config.hideCategories &&
      (isAuthenticated || categories.some((c) => c.isPinned)) ? (
        <Fragment>
          <SectionHeadline title="Bookmarks" link="/bookmarks" />
          {bookmarksLoading ? (
            <Spinner />
          ) : (
            <BookmarkGrid
              categories={
                !bookmarkSearchResult
                  ? categories.filter(
                      ({ isPinned, bookmarks }) =>
                        isPinned && bookmarks.length > 0
                    )
                  : bookmarkSearchResult
              }
              totalCategories={
                categories.filter(({ bookmarks }) => bookmarks.length > 0)
                  .length
              }
              searching={!!localSearch}
              fromHomepage={true}
            />
          )}
        </Fragment>
      ) : null}

      <Link to="/settings" className={classes.SettingsButton}>
        <Icon icon="mdiCog" color="var(--color-background)" />
      </Link>
    </Container>
  );
};
