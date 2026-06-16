import { useEffect, useState } from 'react';
// Redux
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import type { State } from '../../../store/reducers';
// Components
import { WeatherWidget } from '../../Widgets/WeatherWidget/WeatherWidget';
// Utils
import { getDateTime } from './functions/getDateTime';
import { greeter } from './functions/greeter';
// CSS
import classes from './Header.module.css';
import { ThemeToggle } from './ThemeToggle/ThemeToggle';

export const Header = (): JSX.Element => {
  const { hideHeader, hideDate, showTime } = useSelector(
    (state: State) => state.config.config
  );

  const [dateTime, setDateTime] = useState<string>(getDateTime());
  const [greeting, setGreeting] = useState<string>(greeter());

  useEffect(() => {
    let dateTimeInterval: NodeJS.Timeout;

    dateTimeInterval = setInterval(() => {
      setDateTime(getDateTime());
      setGreeting(greeter());
    }, 1000);

    return () => window.clearInterval(dateTimeInterval);
  }, []);

  return (
    <header className={classes.Header}>
      <div className={classes.HeaderTop}>
        {(!hideDate || showTime) && <p>{dateTime}</p>}

        <div className={classes.HeaderActions}>
          <ThemeToggle />
          <Link to="/settings" className={classes.SettingsLink}>
            Go to Settings
          </Link>
        </div>
      </div>

      {!hideHeader && (
        <span className={classes.HeaderMain}>
          <h1>{greeting}</h1>
          <WeatherWidget />
        </span>
      )}
    </header>
  );
};
