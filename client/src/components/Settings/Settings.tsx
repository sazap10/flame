// Redux
import { useSelector } from 'react-redux';
import { Link, NavLink, Route, Routes } from 'react-router-dom';
// Typescript
import type { Route as SettingsRoute } from '../../interfaces';
import type { State } from '../../store/reducers';
import { ProtectedRoute } from '../Routing/ProtectedRoute';
// UI
import { Container, Headline } from '../UI';
import { AppDetails } from './AppDetails/AppDetails';
import { DockerSettings } from './DockerSettings/DockerSettings';
import { GeneralSettings } from './GeneralSettings/GeneralSettings';
// CSS
import classes from './Settings.module.css';
import { StyleSettings } from './StyleSettings/StyleSettings';
// Data
import clientRoutes from './settings.json';
// Components
import { Themer } from './Themer/Themer';
import { UISettings } from './UISettings/UISettings';
import { WeatherSettings } from './WeatherSettings/WeatherSettings';

export const Settings = (): JSX.Element => {
  const routes = clientRoutes.routes;

  const { isAuthenticated } = useSelector((state: State) => state.auth);

  const tabs = isAuthenticated ? routes : routes.filter((r) => !r.authRequired);

  return (
    <Container>
      <Headline title="Settings" subtitle={<Link to="/">Go back</Link>} />
      <div className={classes.Settings}>
        {/* NAVIGATION MENU */}
        <nav className={classes.SettingsNav}>
          {tabs.map(({ name, dest }: SettingsRoute) => (
            <NavLink
              className={({ isActive }) =>
                isActive
                  ? `${classes.SettingsNavLink} ${classes.SettingsNavLinkActive}`
                  : classes.SettingsNavLink
              }
              end
              to={dest}
              key={dest}
            >
              {name}
            </NavLink>
          ))}
        </nav>

        {/* ROUTES */}
        <section className={classes.SettingsContent}>
          <Routes>
            <Route index element={<Themer />} />
            <Route
              path="weather"
              element={
                <ProtectedRoute>
                  <WeatherSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="general"
              element={
                <ProtectedRoute>
                  <GeneralSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="interface"
              element={
                <ProtectedRoute>
                  <UISettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="docker"
              element={
                <ProtectedRoute>
                  <DockerSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="css"
              element={
                <ProtectedRoute>
                  <StyleSettings />
                </ProtectedRoute>
              }
            />
            <Route path="app" element={<AppDetails />} />
          </Routes>
        </section>
      </div>
    </Container>
  );
};
