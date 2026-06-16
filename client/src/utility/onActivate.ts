import type { KeyboardEvent } from 'react';

// Run a click handler when Enter or Space is pressed, so static elements given
// role="button" stay operable from the keyboard (a11y/useKeyWithClickEvents).
export const onActivate =
  (handler: () => void) =>
  (e: KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handler();
    }
  };
