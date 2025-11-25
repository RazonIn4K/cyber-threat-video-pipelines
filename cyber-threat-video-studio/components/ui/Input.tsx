import React from 'react';
import { clsx } from 'clsx';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<Props> = ({ className, ...rest }) => (
  <input
    className={clsx(
      'w-full rounded-lg border border-border bg-background-card px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30',
      className
    )}
    {...rest}
  />
);
