import type { MouseEventHandler, ReactNode } from 'react';
import classes from './Button.module.css';

interface Props {
  children: ReactNode;
  click?: MouseEventHandler<HTMLButtonElement>;
}

export const Button = (props: Props): JSX.Element => {
  const { children, click } = props;

  return (
    <button type="button" className={classes.Button} onClick={click}>
      {children}
    </button>
  );
};
