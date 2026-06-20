import { Fragment } from 'react';
// Store
import { useSelector } from 'react-redux';
import type { State } from '../../../store/reducers';
// Other
import { checkVersion } from '../../../utility';
// UI
import { Button, SettingsHeadline } from '../../UI';
import classes from './AppDetails.module.css';
import { AuthForm } from './AuthForm/AuthForm';

export const AppDetails = (): JSX.Element => {
  const { isAuthenticated } = useSelector((state: State) => state.auth);

  return (
    <Fragment>
      <SettingsHeadline text="Authentication" />
      <AuthForm />

      {isAuthenticated && (
        <Fragment>
          <hr className={classes.separator} />

          <div>
            <SettingsHeadline text="App version" />
            <p className={classes.text}>
              <a
                href="https://github.com/pawelmalak/flame"
                target="_blank"
                rel="noreferrer"
              >
                Flame
              </a>{' '}
              version {import.meta.env.VITE_VERSION}
            </p>

            <p className={classes.text}>
              See the{' '}
              <a
                href="https://github.com/pawelmalak/flame/blob/master/CHANGELOG.md"
                target="_blank"
                rel="noreferrer"
              >
                changelog
              </a>
            </p>

            <Button type="button" click={() => checkVersion(true)}>
              Check for updates
            </Button>
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};
