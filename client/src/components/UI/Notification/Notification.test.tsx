import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithStore } from '../../../testing/test-utils';
import { Notification } from './Notification';

const props = {
  title: 'Heads up',
  message: 'Something happened',
  id: 1,
  url: null,
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('Notification', () => {
  it('arms the auto-dismiss timer once and not again on re-render', () => {
    // Regression guard: depending on `[props.id, clearNotification]` re-ran the
    // effect on every render (clearNotification is a fresh function each time),
    // tearing down and re-arming the dismiss timers so the notification could
    // never close. The 3600ms timeout is unique to this effect, so counting it
    // isolates the effect from any timers React schedules internally.
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');

    const { rerender } = renderWithStore(<Notification {...props} />);
    rerender(<Notification {...props} />);

    const dismissTimers = setTimeoutSpy.mock.calls.filter(
      ([, delay]) => delay === 3600
    );

    expect(dismissTimers).toHaveLength(1);
  });
});
