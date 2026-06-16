import type {
  DockerSettingsForm,
  GeneralForm,
  ThemeSettingsForm,
  UISettingsForm,
  WeatherForm,
} from '../interfaces';

export type ConfigFormData =
  | WeatherForm
  | GeneralForm
  | DockerSettingsForm
  | UISettingsForm
  | ThemeSettingsForm;
