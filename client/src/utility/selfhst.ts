import { ColorScheme } from '../interfaces/Theme';

const SELFHST_CDN = 'https://cdn.jsdelivr.net/gh/selfhst/icons';

export type SelfhstFormat = 'svg' | 'png' | 'webp';

export interface SelfhstIcon {
  url: string;
  format: SelfhstFormat;
}

/**
 * Detect and resolve a selfh.st/icons shorthand into a CDN URL.
 *
 * Accepted forms (the `selfhst:` prefix is case-insensitive). The name may be
 * followed by any combination of `/`-separated modifiers: a format
 * (`svg` | `png` | `webp`) and/or `auto`:
 *   selfhst:bitwarden             -> svg/bitwarden.svg
 *   selfhst:bitwarden/png         -> png/bitwarden.png
 *   selfhst:bitwarden/webp        -> webp/bitwarden.webp
 *   selfhst:bitwarden-light       -> svg/bitwarden-light.svg
 *   selfhst:bitwarden/auto        -> picks the -light/-dark variant per scheme
 *   selfhst:bitwarden/auto/png    -> same, as png
 *
 * `auto` appends selfh.st's monochrome variant suffix based on the active
 * scheme: `-light` (light-coloured icon) on dark themes, `-dark` on light
 * themes. Note that not every selfh.st icon ships these variants, so `auto` can
 * 404 for icons that only provide a base file.
 *
 * The icon name is taken verbatim from https://selfh.st/icons/. When no format
 * is given it defaults to SVG. SVG icons are rendered inline so they pick up the
 * active theme colour (like uploaded SVGs); PNG/webp are rendered via <img> and
 * keep their original colours since raster images can't be recoloured.
 *
 * @param icon the raw icon field value
 * @param scheme the active colour scheme, used to resolve `auto`
 * @returns the resolved icon, or null when the value is not a selfh.st shorthand
 */
export const parseSelfhstIcon = (
  icon: string,
  scheme: ColorScheme = 'dark'
): SelfhstIcon | null => {
  const match = /^selfhst:([a-z0-9._-]+?)((?:\/(?:svg|png|webp|auto))*)$/i.exec(
    icon.trim()
  );

  if (!match) {
    return null;
  }

  let name = match[1].toLowerCase();
  const modifiers = match[2]
    .toLowerCase()
    .split('/')
    .filter(Boolean);

  const format =
    (modifiers.find((m) => m !== 'auto') as SelfhstFormat) || 'svg';

  if (modifiers.includes('auto')) {
    name += scheme === 'dark' ? '-light' : '-dark';
  }

  return {
    url: `${SELFHST_CDN}/${format}/${name}.${format}`,
    format,
  };
};
