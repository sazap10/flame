import type { MouseEventHandler, ReactNode } from 'react';
import classes from './Button.module.css';

interface Props {
  children: ReactNode;
  // Defaults to 'submit' so a plain <Button> inside a form submits it (the
  // pre-Biome behaviour). Pass type="button" for standalone action buttons
  // that use the click handler and must not submit a surrounding form.
  type?: 'button' | 'submit';
  click?: MouseEventHandler<HTMLButtonElement>;
}

export const Button = ({
  children,
  type = 'submit',
  click,
}: Props): JSX.Element => {
  return (
    <button type={type} className={classes.Button} onClick={click}>
      {children}
    </button>
  );
};
