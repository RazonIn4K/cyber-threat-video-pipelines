import React from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<Props> = ({ open, onClose, title, children, footer }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="card w-full max-w-lg shadow-glow">
        <div className={clsx('flex items-center justify-between border-b border-border pb-3 mb-4')}>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4">{children}</div>
        {footer && <div className="mt-6 border-t border-border pt-4 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
};
