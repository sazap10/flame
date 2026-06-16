import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Modal } from './Modal';

describe('Modal', () => {
  it('focuses the backdrop when opened so it can receive the Escape key', () => {
    render(
      <Modal isOpen={true} setIsOpen={vi.fn()}>
        <p>content</p>
      </Modal>
    );

    // Without the focus-on-open effect the keydown handler never fires, since
    // a tabIndex={-1} div only receives key events while focused.
    expect(screen.getByRole('dialog')).toHaveFocus();
  });

  it('closes on Escape and runs the optional callback', () => {
    const setIsOpen = vi.fn();
    const cb = vi.fn();

    render(
      <Modal isOpen={true} setIsOpen={setIsOpen} cb={cb}>
        <p>content</p>
      </Modal>
    );

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

    expect(setIsOpen).toHaveBeenCalledWith(false);
    expect(cb).toHaveBeenCalledTimes(1);
  });
});
