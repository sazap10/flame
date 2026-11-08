import { useSelector } from 'react-redux';
import type { App } from '../../../interfaces';
import type { State } from '../../../store/reducers';
import {
  iconParser,
  isImage,
  isSvg,
  isUrl,
  parseShorthandIcon,
  urlParser,
} from '../../../utility';
import { Icon } from '../../UI';
import classes from './AppCard.module.css';
import { ContainerControls, isContainerStopped } from './ContainerControls';

interface Props {
  app: App;
}

export const AppCard = ({ app }: Props): JSX.Element => {
  const { config } = useSelector((state: State) => state.config);
  const { scheme } = useSelector((state: State) => state.theme);
  const isAuthenticated = useSelector(
    (state: State) => state.auth.isAuthenticated
  );
  // Known only once the server reported it, i.e. container control is enabled
  // and the container opted in.
  const containerState = useSelector(
    (state: State) => state.apps.containerStates[app.id]
  );
  const showControls =
    app.dockerControl && isAuthenticated && containerState !== undefined;

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
            role="img"
            aria-label={`${app.name} icon`}
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
          role="img"
          aria-label={`${app.name} icon`}
        ></svg>
      </div>
    );
  } else {
    iconEl = <Icon icon={iconParser(icon)} />;
  }

  const cardClasses = [
    classes.AppCard,
    showControls && isContainerStopped(containerState)
      ? classes.AppCardStopped
      : '',
  ]
    .join(' ')
    .trim();

  return (
    <div className={classes.AppCardRow}>
      <a
        href={redirectUrl}
        target={config.appsSameTab ? '' : '_blank'}
        rel="noreferrer"
        className={cardClasses}
      >
        <div className={classes.AppCardIcon}>{iconEl}</div>
        <div className={classes.AppCardDetails}>
          <h5>{app.name}</h5>
          <span>{!app.description.length ? displayUrl : app.description}</span>
        </div>
      </a>
      {showControls && <ContainerControls app={app} state={containerState} />}
    </div>
  );
};
