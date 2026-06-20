import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  // Regression: PR #25 added type="button" to satisfy Biome's useButtonType,
  // which stopped a plain <Button> from submitting its surrounding form (so the
  // "Update application" button and every other form submit did nothing). The
  // default must stay 'submit'.
  it('submits its surrounding form by default', () => {
    const onSubmit = vi.fn((e) => e.preventDefault());

    render(
      <form onSubmit={onSubmit}>
        <Button>Submit</Button>
      </form>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('does not submit the form when type="button"', () => {
    const onSubmit = vi.fn((e) => e.preventDefault());
    const click = vi.fn();

    render(
      <form onSubmit={onSubmit}>
        <Button type="button" click={click}>
          Action
        </Button>
      </form>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Action' }));

    expect(click).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
