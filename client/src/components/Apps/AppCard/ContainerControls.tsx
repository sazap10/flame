import { type MouseEvent, useState } from 'react';
import { useDispatch } from 'react-redux';
import type { App } from '../../../interfaces';
import { actionCreators } from '../../../store';
import type { AppDispatch } from '../../../store/store';
import { Icon } from '../../UI';
import classes from './AppCard.module.css';

interface Props {
  app: App;
  state: string;
}

// Docker states a container can be stopped from; everything else (exited,
// created, dead, ...) offers Start. A missing container offers neither.
const STOPPABLE = ['running', 'restarting', 'paused'];
const TRANSITIONAL = ['restarting', 'paused'];

export const isContainerStopped = (state: string): boolean =>
  !STOPPABLE.includes(state) && state !== 'missing';

// Container state dot plus a start/stop button for one app. The controls sit
// beside the tile link rather than inside it, so a click can never follow the
// link; the handler still stops default/propagation as a guard.
export const ContainerControls = ({ app, state }: Props): JSX.Element => {
  const dispatch = useDispatch<AppDispatch>();
  const [pending, setPending] = useState(false);

  const action = STOPPABLE.includes(state) ? 'stop' : 'start';
  const label = `${action === 'stop' ? 'Stop' : 'Start'} ${app.name}`;

  const dotClass = [
    classes.StateDot,
    state === 'running'
      ? classes.StateRunning
      : TRANSITIONAL.includes(state)
        ? classes.StateTransitional
        : state === 'missing'
          ? classes.StateMissing
          : classes.StateStopped,
  ].join(' ');

  const handleClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setPending(true);

    try {
      await dispatch(actionCreators.controlContainer(app, action));
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={classes.ContainerControls}>
      <span
        className={dotClass}
        role="img"
        aria-label={`${app.name} is ${state}`}
        title={state}
      />
      {state !== 'missing' && (
        <button
          type="button"
          className={classes.ControlButton}
          aria-label={label}
          title={label}
          aria-busy={pending}
          disabled={pending}
          onClick={handleClick}
        >
          <Icon
            icon={action === 'stop' ? 'mdiStop' : 'mdiPlay'}
            color="var(--color-primary)"
          />
        </button>
      )}
    </div>
  );
};
