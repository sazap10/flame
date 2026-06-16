import * as MDIcons from '@mdi/js';

import { Icon as MDIcon } from '@mdi/react';
import classes from './Icon.module.css';

interface Props {
  icon: string;
  color?: string;
}

// Indexing the namespace import directly defeats tree-shaking; alias it to a
// plain record so the icon can be looked up dynamically by name.
const icons: Record<string, string> = MDIcons;

export const Icon = (props: Props): JSX.Element => {
  let iconPath = icons[props.icon];

  if (!iconPath) {
    console.log(`Icon ${props.icon} not found`);
    iconPath = MDIcons.mdiCancel;
  }

  return (
    <MDIcon
      className={classes.Icon}
      path={iconPath}
      color={props.color ? props.color : 'var(--color-primary)'}
    />
  );
};
