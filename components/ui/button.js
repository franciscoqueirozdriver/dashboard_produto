'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Button = forwardRef(function Button(
  { className, variant = 'default', size = 'md', ...props },
  ref
) {
  const base = 'inline-flex items-center justify-center rounded-md font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background';
  const variants = {
    default: 'bg-emerald-500 text-black hover:bg-emerald-400 focus-visible:ring-emerald-300',
    outline: 'border border-emerald-500/70 text-emerald-200 hover:bg-emerald-500/10 focus-visible:ring-emerald-300',
  };
  const sizes = {
    md: 'h-11 px-6 text-lg',
    sm: 'h-9 px-4 text-base',
  };

  return (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
});

export { Button };
