'use client';

import React from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className = '', ...props }: Props) {
  return (
    <input
      {...props}
      className={`
        w-full h-[48px]
        border border-pace-gray-300 
        rounded 
        px-3 
        text-pace-gray-700
        placeholder:text-pace-gray-400
        ${className}
      `}
    />
  );
}
