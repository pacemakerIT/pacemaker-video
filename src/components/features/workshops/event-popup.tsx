'use client';

import { ReactNode } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  top: number;
  left: number;
  width: number;
  children: ReactNode;
  onClose: () => void;
};

export default function EventPopup({
  top,
  left,
  width,
  children,
  onClose
}: Props) {
  return createPortal(
    <>
      <button
        type="button"
        aria-label="Close workshop details"
        className="workshop-event-popup-overlay"
        onClick={onClose}
      />
      <div
        style={{
          position: 'absolute',
          top,
          left,
          width,
          zIndex: 99999,
          boxSizing: 'border-box'
        }}
        className="workshop-event-popup text-pace-xs rounded-lg shadow-md"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </>,
    document.body
  );
}
