import { fireEvent, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from 'sonner';
import { MAX_IMAGE_UPLOAD_BYTES } from '@/lib/image-upload-limits';
import ImageUploadInput from './image-upload-input';

vi.mock('sonner', () => ({
  toast: { error: vi.fn() }
}));

function selectFile(input: HTMLInputElement, bytes: number) {
  const file = new File([new Uint8Array(bytes)], 'cover.png', {
    type: 'image/png'
  });
  fireEvent.change(input, { target: { files: [file] } });
  return file;
}

describe('ImageUploadInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('refuses an image over 4MB and shows an error', () => {
    const onChange = vi.fn();
    const { container } = render(<ImageUploadInput onChange={onChange} />);
    const input = container.querySelector('input[type="file"]')!;

    selectFile(input as HTMLInputElement, MAX_IMAGE_UPLOAD_BYTES + 1);

    expect(onChange).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith(
      '이미지는 4MB 이하만 올릴 수 있습니다.'
    );
  });

  it('passes an image within the limit to onChange', () => {
    const onChange = vi.fn();
    const { container } = render(<ImageUploadInput onChange={onChange} />);
    const input = container.querySelector('input[type="file"]')!;

    const file = selectFile(input as HTMLInputElement, 1024);

    expect(onChange).toHaveBeenCalledWith(file);
    expect(toast.error).not.toHaveBeenCalled();
  });
});
