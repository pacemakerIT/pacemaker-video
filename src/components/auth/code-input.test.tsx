import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import CodeInput from '@/components/auth/code-input';

function Harness({ initial = '' }: { initial?: string }) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <CodeInput value={value} onChange={setValue} />
      <output data-testid="value">{value}</output>
    </>
  );
}

const boxes = () => screen.getAllByRole('textbox') as HTMLInputElement[];

describe('CodeInput', () => {
  it('renders six boxes and moves focus forward while typing', () => {
    render(<Harness />);
    expect(boxes()).toHaveLength(6);

    fireEvent.change(boxes()[0], { target: { value: '4' } });
    expect(screen.getByTestId('value')).toHaveTextContent('4');
    expect(document.activeElement).toBe(boxes()[1]);
  });

  it('ignores non-digits', () => {
    render(<Harness />);
    fireEvent.change(boxes()[0], { target: { value: 'a' } });
    expect(screen.getByTestId('value')).toHaveTextContent('');
  });

  it('fills every box on paste', () => {
    render(<Harness />);
    fireEvent.paste(boxes()[0], {
      clipboardData: { getData: () => '12-34 56' }
    });
    expect(screen.getByTestId('value')).toHaveTextContent('123456');
    expect(boxes().map((b) => b.value)).toEqual(['1', '2', '3', '4', '5', '6']);
  });

  it('spreads autofilled digits that land in one box', () => {
    render(<Harness />);
    fireEvent.change(boxes()[0], { target: { value: '987654' } });
    expect(screen.getByTestId('value')).toHaveTextContent('987654');
  });

  it('clears the previous box on Backspace from an empty box', () => {
    render(<Harness initial="12" />);
    boxes()[2].focus();
    fireEvent.keyDown(boxes()[2], { key: 'Backspace' });
    expect(screen.getByTestId('value')).toHaveTextContent('1');
    expect(document.activeElement).toBe(boxes()[1]);
  });
});
