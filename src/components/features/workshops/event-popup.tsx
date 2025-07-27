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

export default function EventPopup({ top, left, width, children }: Props) {
  return createPortal(
    <div
      style={{
        position: 'absolute',
        top,
        left,
        width,
        zIndex: 99999,
        boxSizing: 'border-box'
      }}
      className="absolute rounded-lg shadow-md text-pace-xs"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>,
    document.body
  );
}
