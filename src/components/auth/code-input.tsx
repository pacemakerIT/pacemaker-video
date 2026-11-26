'use client';

import { useRef } from 'react';
import { cn } from '@/lib/utils';

type CodeInputProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  hasError?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  /** id of the element that describes an error, for screen readers */
  describedBy?: string;
};

/**
 * One box per digit. Typing moves forward, Backspace moves back, arrow keys
 * move between boxes, and pasting (or iOS one-time-code autofill) fills every box.
 */
export default function CodeInput({
  value,
  onChange,
  length = 6,
  hasError = false,
  disabled = false,
  autoFocus = false,
  describedBy
}: CodeInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  const focusBox = (index: number) => {
    const box = refs.current[Math.max(0, Math.min(index, length - 1))];
    box?.focus();
    box?.select();
  };

  const fillFrom = (start: number, input: string) => {
    const incoming = input.replace(/\D/g, '');
    if (!incoming) return;
    const next = [...digits];
    incoming
      .slice(0, length - start)
      .split('')
      .forEach((digit, offset) => {
        next[start + offset] = digit;
      });
    onChange(next.join('').slice(0, length));
    focusBox(start + incoming.length);
  };

  const handleChange = (index: number, raw: string) => {
    const onlyDigits = raw.replace(/\D/g, '');
    if (onlyDigits.length > 1) {
      // Autofill or a fast paste landed in one box: spread it out.
      fillFrom(index, onlyDigits);
      return;
    }
    const next = [...digits];
    next[index] = onlyDigits;
    onChange(next.join(''));
    if (onlyDigits) focusBox(index + 1);
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      event.preventDefault();
      const next = [...digits];
      next[index - 1] = '';
      onChange(next.join(''));
      focusBox(index - 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focusBox(index - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      focusBox(index + 1);
    }
  };

  return (
    <div
      role="group"
      aria-label={`${length}-digit code`}
      className="flex justify-between gap-2"
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          aria-label={`Digit ${index + 1}`}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          autoFocus={autoFocus && index === 0}
          disabled={disabled}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={(e) => {
            e.preventDefault();
            fillFrom(index, e.clipboardData.getData('text'));
          }}
          onFocus={(e) => e.target.select()}
          className={cn(
            'h-14 w-full min-w-0 max-w-[56px] rounded-xl border text-center font-heading text-2xl font-bold text-navy focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange disabled:opacity-70',
            hasError ? 'border-orange' : 'border-gray-300'
          )}
        />
      ))}
    </div>
  );
}
