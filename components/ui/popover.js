'use client';

import * as React from 'react';

// Implementação simples de Popover para fins de demonstração
// O projeto real provavelmente usa uma biblioteca como Radix UI.

export const Popover = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const triggerRef = React.useRef(null);
  const contentRef = React.useRef(null);

  const toggleOpen = () => setIsOpen(!isOpen);

  const childrenArray = React.Children.toArray(children);
  const trigger = childrenArray.find(child => child.type === PopoverTrigger);
  const content = childrenArray.find(child => child.type === PopoverContent);

  return (
    <div className="relative">
      {React.cloneElement(trigger, { toggleOpen, ref: triggerRef })}
      {isOpen && React.cloneElement(content, { ref: contentRef })}
    </div>
  );
};

export const PopoverTrigger = React.forwardRef(({ children, toggleOpen, ...props }, ref) => {
  return React.cloneElement(children, {
    onClick: toggleOpen,
    ref: ref,
    ...props,
  });
});

export const PopoverContent = React.forwardRef(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`absolute z-50 mt-2 w-auto rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none animate-in data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});
