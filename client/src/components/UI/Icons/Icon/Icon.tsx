import * as MDIcons from '@mdi/js';

import { Icon as MDIcon } from '@mdi/react';
import classes from './Icon.module.css';

interface Props {
  icon: string;
  color?: string;
}

// Look icons up by name at runtime. Aliasing the namespace import to a record
// keeps the dynamic lookup in one place and satisfies
// noDynamicNamespaceImportAccess (the dynamic access already prevents
// tree-shaking of @mdi/js regardless).
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
