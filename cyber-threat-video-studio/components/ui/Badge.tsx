import React from 'react';
import { clsx } from 'clsx';

type Tone = 'default' | 'success' | 'warning' | 'error' | 'info';

const toneMap: Record<Tone, string> = {
  default: 'bg-white/5 text-gray-200 border border-border',
  success: 'bg-status-success/10 text-status-success border border-status-success/30',
  warning: 'bg-status-warning/10 text-status-warning border border-status-warning/30',
  error: 'bg-status-error/10 text-status-error border border-status-error/30',
  info: 'bg-status-info/10 text-status-info border border-status-info/30',
};

interface Props extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export const Badge: React.FC<Props> = ({ children, tone = 'default', className, ...rest }) => (
  <span
    className={clsx('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold', toneMap[tone], className)}
    {...rest}
  >
    {children}
  </span>
);
