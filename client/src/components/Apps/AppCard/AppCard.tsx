import classes from './AppCard.module.css';
import { Icon } from '../../UI';
import {
  iconParser,
  isImage,
  isSvg,
  isUrl,
  parseShorthandIcon,
  urlParser,
} from '../../../utility';

import type { App } from '../../../interfaces';
import { useSelector } from 'react-redux';
import type { State } from '../../../store/reducers';

interface Props {
  app: App;
}

export const AppCard = ({ app }: Props): JSX.Element => {
  const { config } = useSelector((state: State) => state.config);
  const { scheme } = useSelector((state: State) => state.theme);

  const [displayUrl, redirectUrl] = urlParser(app.url);

  let iconEl: JSX.Element;
  // Use the scheme-specific icon when set, otherwise fall back to the default
  const icon = (scheme === 'dark' ? app.iconDark : app.iconLight) || app.icon;

  const shorthandIcon = parseShorthandIcon(icon, scheme);

  if (shorthandIcon) {
    iconEl =
      shorthandIcon.format === 'svg' ? (
        <div className={classes.CustomIcon}>
          <svg
            data-src={shorthandIcon.url}
            fill="var(--color-primary)"
            className={classes.CustomIcon}
          ></svg>
        </div>
      ) : (
        <img
          src={shorthandIcon.url}
          alt={`${app.name} icon`}
          className={classes.CustomIcon}
        />
      );
  } else if (isImage(icon)) {
    const source = isUrl(icon) ? icon : `/uploads/${icon}`;

    iconEl = (
      <img
        src={source}
        alt={`${app.name} icon`}
        className={classes.CustomIcon}
      />
    );
  } else if (isSvg(icon)) {
    const source = isUrl(icon) ? icon : `/uploads/${icon}`;

    iconEl = (
      <div className={classes.CustomIcon}>
        <svg
          data-src={source}
          fill="var(--color-primary)"
          className={classes.CustomIcon}
        ></svg>
      </div>
    );
  } else {
    iconEl = <Icon icon={iconParser(icon)} />;
  }

  return (
    <a
      href={redirectUrl}
      target={config.appsSameTab ? '' : '_blank'}
      rel="noreferrer"
      className={classes.AppCard}
    >
      <div className={classes.AppCardIcon}>{iconEl}</div>
      <div className={classes.AppCardDetails}>
        <h5>{app.name}</h5>
        <span>{!app.description.length ? displayUrl : app.description}</span>
      </div>
    </a>
  );
};
