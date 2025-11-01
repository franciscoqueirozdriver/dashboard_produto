'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function PeriodSelector({ dateRange, setDateRange, className, onApply }) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (range) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      onApply(range);
      setOpen(false);
    }
  };

  const displayRange = dateRange?.from
    ? dateRange.to
      ? format(dateRange.from, 'dd/MM/yyyy') + ' - ' + format(dateRange.to, 'dd/MM/yyyy')
      : format(dateRange.from, 'dd/MM/yyyy')
    : 'Selecione um período';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'justify-start text-left font-normal gap-2',
            !dateRange?.from && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="h-4 w-4" />
          <span>{displayRange}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={dateRange?.from}
          selected={dateRange}
          onSelect={handleSelect}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
