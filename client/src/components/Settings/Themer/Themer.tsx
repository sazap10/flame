import { ChangeEvent, FormEvent, Fragment, useEffect, useState } from 'react';

// Redux
import { useDispatch, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import { actionCreators } from '../../../store';
import { State } from '../../../store/reducers';

// Typescript
import {
  ColorScheme,
  Theme,
  ThemeMode,
  ThemeSettingsForm,
} from '../../../interfaces';

// Components
import { Button, InputGroup, SettingsHeadline, Spinner } from '../../UI';
import { ThemeBuilder } from './ThemeBuilder/ThemeBuilder';
import { ThemeGrid } from './ThemeGrid/ThemeGrid';

// Other
import {
  parsePABToTheme,
  parseThemeToPAB,
  themeSettingsTemplate,
} from '../../../utility';

export const Themer = (): JSX.Element => {
  const {
    auth: { isAuthenticated },
    config: { loading, config },
    theme: { themes, userThemes, mode, lightTheme, darkTheme },
  } = useSelector((state: State) => state);

  const dispatch = useDispatch();
  const { updateConfig, setThemeMode, setSlotTheme } = bindActionCreators(
    actionCreators,
    dispatch
  );

  const allThemes = [...themes, ...userThemes];

  // Initial state
  const [formData, setFormData] = useState<ThemeSettingsForm>(
    themeSettingsTemplate
  );

  // Get config
  useEffect(() => {
    setFormData({
      ...config,
    });
  }, [loading]);

  // Change color scheme mode (live), and stage it as the new-user default
  const modeChangeHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    const newMode = e.target.value as ThemeMode;
    setThemeMode(newMode);
    setFormData((prev) => ({ ...prev, defaultColorScheme: newMode }));
  };

  // Assign a theme to the light/dark slot (live), and stage as new-user default
  const slotChangeHandler = (
    scheme: ColorScheme,
    e: ChangeEvent<HTMLSelectElement>
  ) => {
    const pab = e.target.value;
    setSlotTheme(scheme, parsePABToTheme(pab));
    setFormData((prev) => ({
      ...prev,
      ...(scheme === 'dark'
        ? { defaultDarkTheme: pab }
        : { defaultLightTheme: pab }),
    }));
  };

  // Form handler
  const formSubmitHandler = async (e: FormEvent) => {
    e.preventDefault();

    // Save settings
    await updateConfig({ ...formData });
  };

  const customThemesEl = (
    <Fragment>
      <SettingsHeadline text="User themes" />
      <ThemeBuilder themes={userThemes} />
    </Fragment>
  );

  return (
    <Fragment>
      <SettingsHeadline text="Color scheme" />
      <InputGroup>
        <label htmlFor="themeMode">Mode</label>
        <select id="themeMode" value={mode} onChange={modeChangeHandler}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System (follow device)</option>
        </select>
        <span>
          Toggle between your light and dark themes, or automatically follow your
          device setting.
        </span>
      </InputGroup>

      <InputGroup>
        <label htmlFor="lightTheme">Light theme</label>
        <select
          id="lightTheme"
          value={parseThemeToPAB(lightTheme)}
          onChange={(e) => slotChangeHandler('light', e)}
        >
          {allThemes.map((theme: Theme, idx) => (
            <option key={idx} value={parseThemeToPAB(theme.colors)}>
              {theme.isCustom && '+'} {theme.name}
            </option>
          ))}
        </select>
        <span>Applied when a light color scheme is active.</span>
      </InputGroup>

      <InputGroup>
        <label htmlFor="darkTheme">Dark theme</label>
        <select
          id="darkTheme"
          value={parseThemeToPAB(darkTheme)}
          onChange={(e) => slotChangeHandler('dark', e)}
        >
          {allThemes.map((theme: Theme, idx) => (
            <option key={idx} value={parseThemeToPAB(theme.colors)}>
              {theme.isCustom && '+'} {theme.name}
            </option>
          ))}
        </select>
        <span>Applied when a dark color scheme is active.</span>
      </InputGroup>

      <SettingsHeadline text="App themes" />
      <p>
        Pick a theme to apply it to your currently active color scheme (
        {mode === 'system' ? 'system' : mode}).
      </p>
      {!themes.length ? <Spinner /> : <ThemeGrid themes={themes} />}

      {!userThemes.length ? isAuthenticated && customThemesEl : customThemesEl}

      {isAuthenticated && (
        <form onSubmit={formSubmitHandler}>
          <SettingsHeadline text="Other settings" />
          <InputGroup>
            <label>Default color scheme for new users</label>
            <span>
              Saving will store your current mode and light/dark theme selection
              as the default for new visitors.
            </span>
          </InputGroup>

          <Button>Save changes</Button>
        </form>
      )}
    </Fragment>
  );
};
