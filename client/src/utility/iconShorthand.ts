import type { ColorScheme } from '../interfaces/Theme';

const JSDELIVR_GH = 'https://cdn.jsdelivr.net/gh';

export type IconFormat = 'svg' | 'png' | 'webp';

const ICON_FORMATS: readonly IconFormat[] = ['svg', 'png', 'webp'];

const isIconFormat = (value: string): value is IconFormat =>
  (ICON_FORMATS as readonly string[]).includes(value);

export interface ShorthandIcon {
  url: string;
  format: IconFormat;
}

/**
 * Build a jsDelivr URL for a repo that follows the selfh.st/icons folder layout
 * (`<format>/<name>.<ext>`, with optional `<name>-light` / `<name>-dark`
 * monochrome variants).
 *
 * `modifiers` is the list of `/`-separated tokens that may follow the icon name:
 * an optional format (`svg` | `png` | `webp`, default `svg`) and/or `auto`.
 * `auto` appends the scheme-appropriate variant suffix: `-light` (light-coloured
 * icon) on dark themes, `-dark` on light themes.
 */
const buildShorthandIcon = (
  repoPath: string,
  name: string,
  modifiers: string[],
  scheme: ColorScheme
): ShorthandIcon => {
  const format = modifiers.find(isIconFormat) ?? 'svg';
  const iconName = modifiers.includes('auto')
    ? `${name}${scheme === 'dark' ? '-light' : '-dark'}`
    : name;

  return {
    url: `${JSDELIVR_GH}/${repoPath}/${format}/${iconName}.${format}`,
    format,
  };
};

const splitModifiers = (raw: string): string[] =>
  raw.toLowerCase().split('/').filter(Boolean);

/**
 * Resolve a selfh.st/icons shorthand: `selfhst:<name>` with optional
 * `/svg|/png|/webp` and/or `/auto` modifiers (e.g. `selfhst:bitwarden/auto`).
 *
 * @returns the resolved icon, or null when the value is not a selfh.st shorthand
 */
export const parseSelfhstIcon = (
  icon: string,
  scheme: ColorScheme = 'dark'
): ShorthandIcon | null => {
  const match = /^selfhst:([a-z0-9._-]+?)((?:\/(?:svg|png|webp|auto))*)$/i.exec(
    icon.trim()
  );

  if (!match) {
    return null;
  }

  return buildShorthandIcon(
    'selfhst/icons',
    match[1].toLowerCase(),
    splitModifiers(match[2]),
    scheme
  );
};

/**
 * Resolve a generic GitHub-repo icon shorthand for any repo that follows the
 * selfh.st/icons folder layout:
 *   gh:<owner>/<repo>/<name>[/<format>][/auto]
 *
 * Examples:
 *   gh:sazap10/personal-project-icons/flame        -> svg/flame.svg
 *   gh:sazap10/personal-project-icons/flame/auto   -> svg/flame-light.svg (dark)
 *   gh:walkxcode/dashboard-icons/plex/png          -> png/plex.png
 *
 * The icon is served from jsDelivr's default branch of the repo. As with
 * selfh.st, SVG is rendered inline (recoloured to the theme); PNG/webp keep
 * their colours.
 *
 * @returns the resolved icon, or null when the value is not a gh: shorthand
 */
export const parseGhIcon = (
  icon: string,
  scheme: ColorScheme = 'dark'
): ShorthandIcon | null => {
  const match =
    /^gh:([a-z0-9-]+)\/([a-z0-9._-]+)\/([a-z0-9._-]+?)((?:\/(?:svg|png|webp|auto))*)$/i.exec(
      icon.trim()
    );

  if (!match) {
    return null;
  }

  const [, owner, repo, name, modifiers] = match;

  return buildShorthandIcon(
    `${owner}/${repo}`,
    name,
    splitModifiers(modifiers),
    scheme
  );
};

/**
 * Resolve any supported icon shorthand (`selfhst:` or `gh:`) into a CDN URL,
 * or return null when the value isn't a recognised shorthand.
 */
export const parseShorthandIcon = (
  icon: string,
  scheme: ColorScheme = 'dark'
): ShorthandIcon | null =>
  parseSelfhstIcon(icon, scheme) ?? parseGhIcon(icon, scheme);
