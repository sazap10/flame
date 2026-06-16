import {
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useRef,
} from 'react';

import classes from './Modal.module.css';

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  children: ReactNode;
  cb?: () => void;
}

export const Modal = ({
  isOpen,
  setIsOpen,
  children,
  cb,
}: Props): JSX.Element => {
  const modalRef = useRef(null);
  const modalClasses = [
    classes.Modal,
    isOpen ? classes.ModalOpen : classes.ModalClose,
  ].join(' ');

  const close = () => {
    setIsOpen(false);

    if (cb) cb();
  };

  const clickHandler = (e: MouseEvent) => {
    // Only dismiss when the backdrop itself (not the content) is clicked
    if (e.target === modalRef.current) {
      close();
    }
  };

  const keyHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      close();
    }
  };

  return (
    // The backdrop closes the modal on outside-click / Escape; role="dialog"
    // marks it as an interactive surface for assistive tech.
    <div
      className={modalClasses}
      onClick={clickHandler}
      onKeyDown={keyHandler}
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      {children}
    </div>
  );
};
