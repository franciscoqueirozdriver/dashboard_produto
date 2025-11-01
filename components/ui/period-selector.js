'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const PERIOD_OPTIONS = [
  { label: 'Últimos 7 dias', value: 7 },
  { label: 'Últimos 30 dias', value: 30 },
  { label: 'Mês Atual', value: 'month' },
  { label: 'Ano Atual', value: 'year' },
];

const getPeriodRange = (value) => {
  const today = new Date();
  const range = { from: undefined, to: today };

  if (typeof value === 'number') {
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - value);
    range.from = pastDate;
  } else if (value === 'month') {
    range.from = new Date(today.getFullYear(), today.getMonth(), 1);
  } else if (value === 'year') {
    range.from = new Date(today.getFullYear(), 0, 1);
  }

  return range;
};

export function PeriodSelector({ dateRange, setDateRange, className, onApply }) {
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  const handlePresetSelect = (value) => {
    const newRange = getPeriodRange(value);
    setDateRange(newRange);
    onApply(newRange);
  };

  const handleCalendarSelect = (range) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      onApply(range);
      setIsCalendarOpen(false);
    }
  };

  const displayRange = dateRange?.from
    ? dateRange.to
      ? format(dateRange.from, 'dd/MM/yyyy') + ' - ' + format(dateRange.to, 'dd/MM/yyyy')
      : format(dateRange.from, 'dd/MM/yyyy')
    : 'Selecione um período';

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
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
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0">
        {PERIOD_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handlePresetSelect(option.value)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setIsCalendarOpen(true)}>
          Customizado
        </DropdownMenuItem>

        {isCalendarOpen && (
          <div className="p-2">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={handleCalendarSelect}
              numberOfMonths={1}
            />
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
