// Redux
import { useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
// Other
import type { Theme } from '../../../../interfaces/Theme';
import { actionCreators } from '../../../../store';
import classes from './ThemePreview.module.css';

interface Props {
  theme: Theme;
}

export const ThemePreview = ({
  theme: { colors, name },
}: Props): JSX.Element => {
  const { setTheme } = bindActionCreators(actionCreators, useDispatch());

  return (
    <div
      className={classes.ThemePreview}
      role="button"
      tabIndex={0}
      onClick={() => setTheme(colors)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setTheme(colors);
        }
      }}
    >
      <div className={classes.ColorsPreview}>
        <div
          className={classes.ColorPreview}
          style={{ backgroundColor: colors.background }}
        ></div>
        <div
          className={classes.ColorPreview}
          style={{ backgroundColor: colors.primary }}
        ></div>
        <div
          className={classes.ColorPreview}
          style={{ backgroundColor: colors.accent }}
        ></div>
      </div>
      <p>{name}</p>
    </div>
  );
};
