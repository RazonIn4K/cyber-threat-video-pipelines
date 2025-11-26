import React from 'react';
import { clsx } from 'clsx';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, className }) => {
  const handleToggle = () => {
    onChange(!checked);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={handleToggle}
      className={clsx(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        checked ? 'bg-primary' : 'bg-gray-600',
        className
      )}
    >
      <span
        aria-hidden="true"
        className={clsx(
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out',
          checked ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  );
};