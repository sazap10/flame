// Redux
import { useDispatch, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
// Typescript
import type { ThemeMode } from '../../../../interfaces';
import { actionCreators } from '../../../../store';
import type { State } from '../../../../store/reducers';

// UI
import { Icon } from '../../../UI';

// CSS
import classes from './ThemeToggle.module.css';

// Order the toggle cycles through
const order: ThemeMode[] = ['light', 'dark', 'system'];

const config: Record<ThemeMode, { icon: string; label: string }> = {
  light: { icon: 'mdiWhiteBalanceSunny', label: 'Light theme' },
  dark: { icon: 'mdiWeatherNight', label: 'Dark theme' },
  system: { icon: 'mdiMonitor', label: 'System theme' },
};

export const ThemeToggle = (): JSX.Element => {
  const mode = useSelector((state: State) => state.theme.mode);

  const dispatch = useDispatch();
  const { setThemeMode } = bindActionCreators(actionCreators, dispatch);

  const next = order[(order.indexOf(mode) + 1) % order.length];
  const { icon, label } = config[mode];

  return (
    <button
      type="button"
      className={classes.ThemeToggle}
      onClick={() => setThemeMode(next)}
      aria-label={`${label} (click for ${config[next].label.toLowerCase()})`}
      title={`${label} — click to switch to ${config[next].label.toLowerCase()}`}
    >
      <Icon icon={icon} color="var(--color-primary)" />
    </button>
  );
};
