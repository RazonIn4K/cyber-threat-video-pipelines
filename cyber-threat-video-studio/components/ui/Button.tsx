import React from 'react';
import { clsx } from 'clsx';

type Variant = 'primary' | 'ghost' | 'outline' | 'danger';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: React.ReactNode;
  loading?: boolean;
}

const variantMap: Record<Variant, string> = {
  primary: 'bg-primary text-black hover:bg-primary-dark shadow-glow',
  ghost: 'bg-white/5 text-gray-100 hover:bg-white/10 border border-border',
  outline: 'border border-border text-gray-100 hover:border-primary hover:text-primary',
  danger: 'bg-status-error/10 text-status-error border border-status-error/40 hover:bg-status-error/20',
};

export const Button: React.FC<Props> = ({ children, variant = 'primary', icon, loading, className, ...rest }) => (
  <button
    className={clsx(
      'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background',
      variantMap[variant],
      loading && 'opacity-70 cursor-wait',
      className
    )}
    {...rest}
  >
    {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
    {!loading && icon}
    {children}
  </button>
);
