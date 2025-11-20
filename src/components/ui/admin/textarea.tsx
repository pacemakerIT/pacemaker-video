'use client';

import { TextareaHTMLAttributes, forwardRef } from 'react';

// forwardRef 사용: react-hook-form 같은 곳에서도 쉽게 쓸 수 있게
const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className = '', ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      {...props}
      className={`w-full border border-pace-gray-300 rounded p-3 text-pace-base resize-none focus:outline-none focus:ring-1 focus:ring-pace-gray-500 ${className}`}
    />
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
