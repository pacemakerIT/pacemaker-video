'use client';

import { ReactNode, useEffect, useRef } from 'react';
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
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (
        popupRef.current?.contains(target) ||
        target.closest('.rbc-event-content')
      )
        return;
      onClose();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Close workshop details"
        className="workshop-event-popup-overlay"
        onClick={onClose}
      />
      <div
        ref={popupRef}
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
