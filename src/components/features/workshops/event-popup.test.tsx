import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import EventPopup from './event-popup';

afterEach(cleanup);

it('closes on outside clicks and Escape, while preserving popup and calendar interactions', () => {
  const onClose = vi.fn();
  const { unmount } = render(
    <>
      <h1>Workshops</h1>
      <div className="rbc-event-content">
        <span>Calendar event</span>
      </div>
      <EventPopup top={100} left={100} width={200} onClose={onClose}>
        <button>View detail</button>
      </EventPopup>
    </>
  );
  fireEvent.click(screen.getByRole('button', { name: 'View detail' }));
  fireEvent.click(screen.getByText('Calendar event'));
  expect(onClose).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('heading'));
  expect(onClose).toHaveBeenCalledTimes(1);
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(onClose).toHaveBeenCalledTimes(2);
  unmount();
  fireEvent.click(document.body);
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(onClose).toHaveBeenCalledTimes(2);
});
