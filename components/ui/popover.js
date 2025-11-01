'use client';

import * as React from 'react';

// Implementação simples de Popover para fins de demonstração
// O projeto real provavelmente usa uma biblioteca como Radix UI.

export const Popover = ({ children, open, onOpenChange }) => {
  const childrenArray = React.Children.toArray(children);
  const trigger = childrenArray.find(child => child.type === PopoverTrigger);
  const content = childrenArray.find(child => child.type === PopoverContent);

  return (
    <div className="relative">
      {React.cloneElement(trigger, { onOpenChange, open })}
      {open && React.cloneElement(content)}
    </div>
  );
};

export const PopoverTrigger = React.forwardRef(({ children, onOpenChange, open, ...props }, ref) => {
  return React.cloneElement(children, {
    onClick: () => onOpenChange(!open),
    ref: ref,
    ...props,
  });
});

export const PopoverContent = React.forwardRef(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`absolute z-50 mt-2 w-auto rounded-md border border-gray-700 bg-gray-800 p-4 text-white shadow-lg ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});
