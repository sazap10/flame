// WCAG 2.1 relative luminance and contrast ratio for hex colors. Used to warn
// when a user-built theme would render text below the AA contrast floor.

const linearize = (value: number): number => {
  const s = value / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

const relativeLuminance = (hex: string): number => {
  let h = hex.replace('#', '').trim();

  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  }

  // Reject anything that isn't exactly six hex digits, so a bad value (wrong
  // length or non-hex characters) yields 0 rather than NaN downstream.
  if (!/^[0-9a-f]{6}$/i.test(h)) return 0;

  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);

  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
};

// Contrast ratio between two hex colors, from 1 (identical) to 21 (black/white).
export const contrastRatio = (hex1: string, hex2: string): number => {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
};

// WCAG AA minimum contrast for normal body text.
export const AA_CONTRAST_MIN = 4.5;
