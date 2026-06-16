import { Fragment } from 'react';

// Redux
import { useDispatch, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
// Typescript
import type { Bookmark, Category } from '../../../interfaces';
import { actionCreators } from '../../../store';
import type { State } from '../../../store/reducers';
import {
  iconParser,
  isImage,
  isSvg,
  isUrl,
  onActivate,
  parseShorthandIcon,
  urlParser,
} from '../../../utility';
import { Icon } from '../../UI';
// Other
import classes from './BookmarkCard.module.css';

interface Props {
  category: Category;
  fromHomepage?: boolean;
}

export const BookmarkCard = (props: Props): JSX.Element => {
  const { category, fromHomepage = false } = props;

  const {
    config: { config },
    auth: { isAuthenticated },
    theme: { scheme },
  } = useSelector((state: State) => state);

  const dispatch = useDispatch();
  const { setEditCategory } = bindActionCreators(actionCreators, dispatch);

  // The header is only interactive (opens the category editor) for an
  // authenticated user outside the homepage.
  const isEditable = !fromHomepage && isAuthenticated;

  const editHandler = () => {
    if (isEditable) {
      setEditCategory(category);
    }
  };

  return (
    <div className={classes.BookmarkCard}>
      <h3
        className={isEditable ? classes.BookmarkHeader : ''}
        onClick={editHandler}
        onKeyDown={onActivate(editHandler)}
        tabIndex={isEditable ? 0 : undefined}
      >
        {category.name}
      </h3>

      <div className={classes.Bookmarks}>
        {category.bookmarks.map((bookmark: Bookmark) => {
          const redirectUrl = urlParser(bookmark.url)[1];

          let iconEl: JSX.Element = <Fragment></Fragment>;

          // Use the scheme-specific icon when set, otherwise fall back to default
          const icon =
            (scheme === 'dark' ? bookmark.iconDark : bookmark.iconLight) ||
            bookmark.icon;

          if (icon) {
            const { name } = bookmark;
            const shorthandIcon = parseShorthandIcon(icon, scheme);

            if (shorthandIcon) {
              iconEl =
                shorthandIcon.format === 'svg' ? (
                  <div className={classes.BookmarkIcon}>
                    <svg
                      data-src={shorthandIcon.url}
                      fill="var(--color-primary)"
                      className={classes.BookmarkIconSvg}
                      role="img"
                      aria-label={`${name} icon`}
                    ></svg>
                  </div>
                ) : (
                  <div className={classes.BookmarkIcon}>
                    <img
                      src={shorthandIcon.url}
                      alt={`${name} icon`}
                      className={classes.CustomIcon}
                    />
                  </div>
                );
            } else if (isImage(icon)) {
              const source = isUrl(icon) ? icon : `/uploads/${icon}`;

              iconEl = (
                <div className={classes.BookmarkIcon}>
                  <img
                    src={source}
                    alt={`${name} icon`}
                    className={classes.CustomIcon}
                  />
                </div>
              );
            } else if (isSvg(icon)) {
              const source = isUrl(icon) ? icon : `/uploads/${icon}`;

              iconEl = (
                <div className={classes.BookmarkIcon}>
                  <svg
                    data-src={source}
                    fill="var(--color-primary)"
                    className={classes.BookmarkIconSvg}
                    role="img"
                    aria-label={`${name} icon`}
                  ></svg>
                </div>
              );
            } else {
              iconEl = (
                <div className={classes.BookmarkIcon}>
                  <Icon icon={iconParser(icon)} />
                </div>
              );
            }
          }

          return (
            <a
              href={redirectUrl}
              target={config.bookmarksSameTab ? '' : '_blank'}
              rel="noreferrer"
              key={`bookmark-${bookmark.id}`}
            >
              {icon && iconEl}
              {bookmark.name}
            </a>
          );
        })}
      </div>
    </div>
  );
};
