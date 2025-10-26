import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'node:util';
import { vi } from 'vitest';

Object.assign(global, { TextEncoder, TextDecoder });

interface MockImageProps {
  src: string;
  alt?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
  [key: string]: unknown;
}

vi.mock('next/image', () => ({
  default: (props: MockImageProps) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { priority, fill, ...rest } = props;

    // eslint-disable-next-line @next/next/no-img-element
    return <img {...rest} alt={props.alt || ''} />;
  }
}));
